# Security Operations

**Version**: 1.0  
**Last Updated**: May 10, 2026  
**Status**: Design Document

> ⚠️ **Phase 0 Notice**: This is a design document. No code has been implemented yet.

---

## 📋 OVERVIEW

This document defines security operations for CanonBridge, including Kafka ACLs, mTLS configuration, secret management, and security monitoring.

---

## 🔐 KAFKA SECURITY

### Kafka ACL (Access Control Lists)

**Purpose**: Control which services can produce/consume from which topics

#### ACL Strategy

**Principle**: Least Privilege Access
- Each service gets only the permissions it needs
- No wildcard permissions in production
- Regular ACL audits

#### Service Permissions

**Transformer Service**:
```bash
# Consumer permissions
kafka-acls --add \
  --allow-principal User:transformer-service \
  --operation Read \
  --topic partner.* \
  --group transformer-consumer-group

# Producer permissions
kafka-acls --add \
  --allow-principal User:transformer-service \
  --operation Write \
  --topic canonical.* \
  --topic dlq.*
```

**Business Service**:
```bash
# Consumer permissions
kafka-acls --add \
  --allow-principal User:business-service \
  --operation Read \
  --topic canonical.* \
  --group business-consumer-group

# Producer permissions
kafka-acls --add \
  --allow-principal User:business-service \
  --operation Write \
  --topic business.*
```

**Monitoring Service**:
```bash
# Read-only access for monitoring
kafka-acls --add \
  --allow-principal User:monitoring-service \
  --operation Read \
  --topic * \
  --group monitoring-consumer-group
```

#### ACL Management

**List ACLs**:
```bash
kafka-acls --list --bootstrap-server kafka:9092
```

**Remove ACL**:
```bash
kafka-acls --remove \
  --allow-principal User:service-name \
  --operation Read \
  --topic topic-name
```

**Audit ACLs**:
```bash
# Export current ACLs
kafka-acls --list --bootstrap-server kafka:9092 > acls-$(date +%Y%m%d).txt

# Compare with baseline
diff acls-baseline.txt acls-$(date +%Y%m%d).txt
```

---

### Kafka mTLS (Mutual TLS)

**Purpose**: Encrypt data in transit and authenticate services

#### Certificate Architecture

```
Root CA
├── Kafka Broker 1 Certificate
├── Kafka Broker 2 Certificate
├── Kafka Broker 3 Certificate
├── Transformer Service Certificate
├── Business Service Certificate
└── Monitoring Service Certificate
```

#### Certificate Generation

**1. Create Root CA**:
```bash
# Generate CA private key
openssl genrsa -out ca-key.pem 4096

# Generate CA certificate
openssl req -new -x509 -days 3650 \
  -key ca-key.pem \
  -out ca-cert.pem \
  -subj "/CN=CanonBridge-CA"
```

**2. Generate Service Certificates**:
```bash
# Generate service private key
openssl genrsa -out transformer-key.pem 2048

# Generate certificate signing request
openssl req -new \
  -key transformer-key.pem \
  -out transformer-csr.pem \
  -subj "/CN=transformer-service"

# Sign certificate with CA
openssl x509 -req -days 365 \
  -in transformer-csr.pem \
  -CA ca-cert.pem \
  -CAkey ca-key.pem \
  -CAcreateserial \
  -out transformer-cert.pem
```

**3. Create Truststore and Keystore**:
```bash
# Import CA certificate to truststore
keytool -import -trustcacerts \
  -alias ca \
  -file ca-cert.pem \
  -keystore truststore.jks \
  -storepass changeit

# Create PKCS12 keystore
openssl pkcs12 -export \
  -in transformer-cert.pem \
  -inkey transformer-key.pem \
  -out transformer-keystore.p12 \
  -name transformer-service \
  -password pass:changeit

# Convert to JKS (for Java services)
keytool -importkeystore \
  -srckeystore transformer-keystore.p12 \
  -srcstoretype PKCS12 \
  -destkeystore transformer-keystore.jks \
  -deststoretype JKS
```

#### Kafka Broker Configuration

**server.properties**:
```properties
# Enable SSL
listeners=SSL://0.0.0.0:9093
advertised.listeners=SSL://kafka-broker-1:9093

# SSL Configuration
ssl.keystore.location=/etc/kafka/secrets/kafka-keystore.jks
ssl.keystore.password=changeit
ssl.key.password=changeit
ssl.truststore.location=/etc/kafka/secrets/truststore.jks
ssl.truststore.password=changeit

# Client Authentication
ssl.client.auth=required

# SSL Protocol
ssl.protocol=TLSv1.3
ssl.enabled.protocols=TLSv1.3,TLSv1.2

# Cipher Suites (strong ciphers only)
ssl.cipher.suites=TLS_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256
```

#### Client Configuration

**Node.js (Transformer Service)**:
```javascript
const kafka = new Kafka({
  clientId: 'transformer-service',
  brokers: ['kafka-broker-1:9093', 'kafka-broker-2:9093'],
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync('/etc/ssl/ca-cert.pem', 'utf-8')],
    key: fs.readFileSync('/etc/ssl/transformer-key.pem', 'utf-8'),
    cert: fs.readFileSync('/etc/ssl/transformer-cert.pem', 'utf-8'),
  },
  sasl: {
    mechanism: 'plain',
    username: 'transformer-service',
    password: process.env.KAFKA_PASSWORD,
  },
});
```

**Java (Business Service)**:
```properties
# Kafka SSL Configuration
bootstrap.servers=kafka-broker-1:9093,kafka-broker-2:9093
security.protocol=SSL

ssl.truststore.location=/etc/ssl/truststore.jks
ssl.truststore.password=changeit
ssl.keystore.location=/etc/ssl/business-keystore.jks
ssl.keystore.password=changeit
ssl.key.password=changeit

ssl.protocol=TLSv1.3
ssl.enabled.protocols=TLSv1.3,TLSv1.2
```

#### Certificate Rotation

**Rotation Schedule**:
- Service certificates: Every 90 days
- Broker certificates: Every 180 days
- Root CA: Every 5 years (with careful planning)

**Rotation Process**:
1. Generate new certificates
2. Deploy new certificates alongside old ones
3. Update services to use new certificates (rolling restart)
4. Verify all services using new certificates
5. Remove old certificates
6. Update monitoring and documentation

---

## 🔑 SECRET MANAGEMENT

### HashiCorp Vault Integration

**Purpose**: Centralized secret storage and dynamic secret generation

#### Vault Architecture

```
┌─────────────────────────────────────┐
│         HashiCorp Vault             │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │  KV Secrets Engine           │  │
│  │  - Database passwords        │  │
│  │  - API keys                  │  │
│  │  - Kafka credentials         │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  PKI Secrets Engine          │  │
│  │  - TLS certificates          │  │
│  │  - Automatic rotation        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Database Secrets Engine     │  │
│  │  - Dynamic DB credentials    │  │
│  │  - Automatic rotation        │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Vault Configuration

**Enable Secrets Engines**:
```bash
# Enable KV secrets engine
vault secrets enable -path=canonbridge kv-v2

# Enable PKI for certificates
vault secrets enable pki

# Enable database secrets engine
vault secrets enable database
```

**Store Secrets**:
```bash
# Store Kafka credentials
vault kv put canonbridge/kafka \
  username=transformer-service \
  password=secure-password

# Store database credentials
vault kv put canonbridge/postgres \
  username=canonbridge \
  password=secure-password \
  host=postgres.canonbridge.svc.cluster.local \
  port=5432 \
  database=canonbridge
```

**Configure Dynamic Database Credentials**:
```bash
vault write database/config/postgres \
  plugin_name=postgresql-database-plugin \
  allowed_roles="transformer-role,business-role" \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/canonbridge" \
  username="vault-admin" \
  password="vault-admin-password"

# Create role for transformer service
vault write database/roles/transformer-role \
  db_name=postgres \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
    GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"
```

#### Service Integration

**Node.js Service**:
```javascript
const vault = require('node-vault')({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

// Read secret
const secret = await vault.read('canonbridge/kafka');
const kafkaPassword = secret.data.data.password;

// Get dynamic database credentials
const dbCreds = await vault.read('database/creds/transformer-role');
const dbUsername = dbCreds.data.username;
const dbPassword = dbCreds.data.password;
```

**Java Service**:
```java
@Configuration
public class VaultConfig {
    
    @Bean
    public VaultTemplate vaultTemplate() {
        VaultEndpoint endpoint = VaultEndpoint.create(
            System.getenv("VAULT_ADDR"), 8200);
        
        VaultToken token = VaultToken.of(
            System.getenv("VAULT_TOKEN"));
        
        return new VaultTemplate(endpoint, 
            new TokenAuthentication(token));
    }
    
    @Bean
    public DataSource dataSource(VaultTemplate vault) {
        VaultResponse response = vault.read(
            "database/creds/business-role");
        
        String username = response.getData().get("username");
        String password = response.getData().get("password");
        
        return DataSourceBuilder.create()
            .url("jdbc:postgresql://postgres:5432/canonbridge")
            .username(username)
            .password(password)
            .build();
    }
}
```

---

## 🛡️ NETWORK SECURITY

### Kubernetes Network Policies

**Purpose**: Control network traffic between pods

#### Default Deny Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: canonbridge
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

#### Transformer Service Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: transformer-service-policy
  namespace: canonbridge
spec:
  podSelector:
    matchLabels:
      app: transformer-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: kafka
    ports:
    - protocol: TCP
      port: 9093
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

#### Business Service Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: business-service-policy
  namespace: canonbridge
spec:
  podSelector:
    matchLabels:
      app: business-service
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: kafka
    ports:
    - protocol: TCP
      port: 9093
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

---

## 🔍 SECURITY MONITORING

### Security Metrics

**Kafka Security Metrics**:
- Failed authentication attempts
- ACL violations
- SSL handshake failures
- Certificate expiration warnings

**Application Security Metrics**:
- Failed API authentication
- Rate limit violations
- Suspicious activity patterns
- Secret access patterns

### Security Alerts

**Critical Alerts**:
```yaml
# Certificate expiring soon
- alert: CertificateExpiringSoon
  expr: kafka_ssl_certificate_expiry_days < 30
  for: 1h
  labels:
    severity: critical
  annotations:
    summary: "Certificate expiring in {{ $value }} days"

# Failed authentication spike
- alert: FailedAuthenticationSpike
  expr: rate(kafka_failed_authentication_total[5m]) > 10
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High rate of failed authentication attempts"

# ACL violation
- alert: KafkaACLViolation
  expr: rate(kafka_acl_violation_total[5m]) > 0
  for: 1m
  labels:
    severity: warning
  annotations:
    summary: "Kafka ACL violation detected"
```

### Security Audit Logging

**What to Log**:
- All authentication attempts (success and failure)
- ACL changes
- Secret access
- Certificate operations
- Network policy changes
- Privilege escalations

**Log Format**:
```json
{
  "timestamp": "2026-05-10T10:30:00Z",
  "event_type": "authentication",
  "service": "transformer-service",
  "action": "kafka_connect",
  "result": "success",
  "source_ip": "10.0.1.45",
  "user": "transformer-service",
  "metadata": {
    "broker": "kafka-broker-1",
    "protocol": "SSL"
  }
}
```

---

## 🔐 DATA ENCRYPTION

### Encryption at Rest

**PostgreSQL**:
```sql
-- Enable transparent data encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/postgres-cert.pem';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/postgres-key.pem';

-- Encrypt specific columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
INSERT INTO partners (name, api_key_encrypted)
VALUES ('Partner A', pgp_sym_encrypt('secret-key', 'encryption-password'));

-- Decrypt when reading
SELECT name, pgp_sym_decrypt(api_key_encrypted, 'encryption-password')
FROM partners;
```

**Kafka**:
```properties
# Enable encryption at rest (requires Kafka 2.8+)
log.message.format.version=2.8
inter.broker.protocol.version=2.8

# Use encrypted volumes
log.dirs=/var/lib/kafka/encrypted-data
```

### Encryption in Transit

**All Services**:
- Kafka: TLS 1.3 with mTLS
- PostgreSQL: TLS 1.3
- Redis: TLS 1.3
- HTTP APIs: TLS 1.3
- Internal service communication: mTLS

---

## 🚨 INCIDENT RESPONSE

### Security Incident Playbook

**1. Detection**:
- Security alert triggered
- Anomaly detected in logs
- User report

**2. Containment**:
```bash
# Revoke compromised credentials
vault token revoke <token-id>

# Block suspicious IP
kubectl exec -it api-gateway -- iptables -A INPUT -s <ip> -j DROP

# Disable compromised service
kubectl scale deployment transformer-service --replicas=0
```

**3. Investigation**:
```bash
# Check audit logs
kubectl logs -n canonbridge -l app=transformer-service --since=1h | grep ERROR

# Check Kafka logs
kafka-console-consumer --topic __consumer_offsets \
  --bootstrap-server kafka:9092 \
  --from-beginning | grep suspicious-pattern

# Check database logs
psql -c "SELECT * FROM audit_log WHERE timestamp > NOW() - INTERVAL '1 hour';"
```

**4. Recovery**:
- Rotate all credentials
- Update certificates
- Patch vulnerabilities
- Restore from backup if needed

**5. Post-Incident**:
- Document incident
- Update security policies
- Improve detection
- Train team

---

## ✅ SECURITY CHECKLIST

### Pre-Production

- [ ] Kafka ACLs configured for all services
- [ ] mTLS enabled for Kafka
- [ ] Vault configured and integrated
- [ ] Network policies applied
- [ ] Certificates generated and deployed
- [ ] Security monitoring configured
- [ ] Audit logging enabled
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enabled
- [ ] Security alerts configured

### Regular Maintenance

- [ ] Review ACLs monthly
- [ ] Rotate certificates quarterly
- [ ] Audit security logs weekly
- [ ] Update security policies as needed
- [ ] Test incident response procedures quarterly
- [ ] Security training for team annually

---

## 📚 RELATED DOCUMENTS

- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Alerting Strategy](./02-alerting-strategy.md)
- [Disaster Recovery](./06-disaster-recovery.md)
- [Audit Logging](./13-audit-logging.md)

---

**Status**: Design Document  
**Phase**: Phase 0 (Validation)  
**Implementation**: Phase 3+

