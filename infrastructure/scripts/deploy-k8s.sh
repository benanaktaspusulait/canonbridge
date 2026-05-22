#!/bin/bash

# CanonBridge - Kubernetes Deployment Script
# This script deploys all services to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="canonbridge"
TIMEOUT="300s"
NON_INTERACTIVE=false

# Parse arguments (S1: --non-interactive flag for CI)
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --non-interactive) NON_INTERACTIVE=true ;;
        --namespace) NAMESPACE="$2"; shift ;;
        --timeout) TIMEOUT="$2"; shift ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}CanonBridge - Kubernetes Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Create namespace
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"
echo ""

# Verify secrets exist
echo -e "${YELLOW}Verifying secrets...${NC}"
if ! kubectl get secret postgres-secret -n "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}ERROR: postgres-secret not found in namespace $NAMESPACE${NC}"
    echo -e "${YELLOW}Create secrets using:${NC}"
    echo "  kubectl create secret generic postgres-secret --from-literal=POSTGRES_DB=etldb --from-literal=POSTGRES_USER=etluser --from-literal=POSTGRES_PASSWORD=<PASSWORD> --from-literal=DB_PASSWORD=<PASSWORD> -n $NAMESPACE"
    exit 1
fi

if ! kubectl get secret transformer-secret -n "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}ERROR: transformer-secret not found in namespace $NAMESPACE${NC}"
    echo -e "${YELLOW}Create secrets using:${NC}"
    echo "  kubectl create secret generic transformer-secret --from-literal=API_KEY=<KEY> -n $NAMESPACE"
    exit 1
fi

if [ "$NON_INTERACTIVE" = false ]; then
    read -p "Secrets verified. Continue deployment? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Secrets verified${NC}"
echo ""

# Create configmaps
echo -e "${YELLOW}Creating configmaps...${NC}"
kubectl apply -f k8s/configmap.yaml
echo -e "${GREEN}✓ ConfigMaps created${NC}"
echo ""

# Apply NetworkPolicies (K8)
echo -e "${YELLOW}Applying NetworkPolicies...${NC}"
kubectl apply -f k8s/network-policies.yaml
echo -e "${GREEN}✓ NetworkPolicies applied${NC}"
echo ""

# Deploy PostgreSQL
echo -e "${YELLOW}Deploying PostgreSQL...${NC}"
kubectl apply -f k8s/postgres-statefulset.yaml
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout="$TIMEOUT"
echo -e "${GREEN}✓ PostgreSQL deployed${NC}"
echo ""

# Deploy Kafka
echo -e "${YELLOW}Deploying Kafka...${NC}"
kubectl apply -f k8s/kafka-statefulset.yaml
echo "Waiting for Kafka to be ready..."
kubectl wait --for=condition=ready pod -l app=kafka -n "$NAMESPACE" --timeout="$TIMEOUT"
echo -e "${GREEN}✓ Kafka deployed${NC}"
echo ""

# Create Kafka topics
echo -e "${YELLOW}Creating Kafka topics...${NC}"
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic partner.raw.events --partitions 12 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic canonical.events --partitions 12 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic transformation.dlq --partitions 3 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic transformation.retry --partitions 3 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic transformation.retry.1m --partitions 3 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic transformation.retry.5m --partitions 3 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic transformation.retry.30m --partitions 3 --replication-factor 3
kubectl exec -n "$NAMESPACE" kafka-0 -- kafka-topics --bootstrap-server localhost:9092 \
    --create --if-not-exists --topic business.events --partitions 6 --replication-factor 3
echo -e "${GREEN}✓ Kafka topics created${NC}"
echo ""

# Deploy Transformer Service (G3: use kustomize)
echo -e "${YELLOW}Deploying Transformer Service...${NC}"
kubectl apply -k k8s/transformer/
echo "Waiting for Transformer to be ready..."
kubectl wait --for=condition=ready pod -l app=transformer -n "$NAMESPACE" --timeout="$TIMEOUT"
echo -e "${GREEN}✓ Transformer Service deployed${NC}"
echo ""

# Deploy Business Service
echo -e "${YELLOW}Deploying Business Service...${NC}"
kubectl apply -f k8s/business-service-deployment.yaml
echo "Waiting for Business Service to be ready..."
kubectl wait --for=condition=ready pod -l app=business-service -n "$NAMESPACE" --timeout="$TIMEOUT"
echo -e "${GREEN}✓ Business Service deployed${NC}"
echo ""

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
echo ""
echo "Pod Status:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "Service Status:"
kubectl get svc -n "$NAMESPACE"
echo ""
echo "HPA Status:"
kubectl get hpa -n "$NAMESPACE"
echo ""

# Health checks (S2: unique pod names, S3: correct service name and port)
echo -e "${YELLOW}Running health checks...${NC}"

# Check Transformer health
TRANSFORMER_HEALTH=$(kubectl run health-check-transformer --image=curlimages/curl --rm -i --restart=Never -n "$NAMESPACE" -- \
    curl -s -o /dev/null -w "%{http_code}" http://transformer:8080/health/ready 2>/dev/null) || true

if [ "$TRANSFORMER_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Transformer health check passed${NC}"
else
    echo -e "${RED}✗ Transformer health check failed (HTTP $TRANSFORMER_HEALTH)${NC}"
fi

# Check Business Service health
BUSINESS_HEALTH=$(kubectl run health-check-business --image=curlimages/curl --rm -i --restart=Never -n "$NAMESPACE" -- \
    curl -s -o /dev/null -w "%{http_code}" http://business-service:8080/health/ready 2>/dev/null) || true

if [ "$BUSINESS_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Business Service health check passed${NC}"
else
    echo -e "${RED}✗ Business Service health check failed (HTTP $BUSINESS_HEALTH)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check logs: kubectl logs -n $NAMESPACE -l app=transformer -f"
echo "2. Monitor metrics: kubectl top pods -n $NAMESPACE"
echo "3. Check HPA: kubectl get hpa -n $NAMESPACE"
echo "4. Access services via ingress or port-forward"
echo ""
echo "To port-forward services:"
echo "  kubectl port-forward -n $NAMESPACE svc/transformer 8080:8080"
echo "  kubectl port-forward -n $NAMESPACE svc/business-service 8081:8080"
echo ""
