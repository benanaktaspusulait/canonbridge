# Transformer Service Implementation Guide - Node.js + Fastify

## 🎯 Overview

The transformer service consumes partner events, applies JSONata transformations, validates against schemas, and publishes canonical events using Node.js 18+ with Fastify framework.

## 🏗️ Project Structure

```
transformer-service/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── kafka.ts
│   │   └── logger.ts
│   ├── kafka/
│   │   ├── consumer.ts
│   │   ├── producer.ts
│   │   ├── offset-manager.ts
│   │   └── error-handler.ts
│   ├── workers/
│   │   ├── worker-pool.ts
│   │   ├── transform-worker.ts
│   │   └── types.ts
│   ├── services/
│   │   ├── partner-resolver.ts
│   │   ├── mapping-cache.ts
│   │   ├── schema-cache.ts
│   │   ├── jsonata-transformer.ts
│   │   ├── validator.ts
│   │   ├── retry-handler.ts
│   │   ├── dlq-publisher.ts
│   │   └── error-classifier.ts
│   ├── plugins/
│   │   ├── logger.ts
│   │   ├── metrics.ts
│   │   ├── tracing.ts
│   │   └── healthcheck.ts
│   ├── types/
│   │   ├── envelope.ts
│   │   ├── errors.ts
│   │   ├── config.ts
│   │   └── partner.ts
│   └── utils/
│       ├── logger.ts
│       ├── metrics.ts
│       └── helpers.ts
├── partners/
│   ├── company-a/
│   │   ├── order-created/
│   │   │   ├── config.json
│   │   │   ├── input.v1.schema.json
│   │   │   ├── inbound.v1.jsonata
│   │   │   └── canonical.v1.schema.json
│   │   └── order-line-created/
│   │       ├── config.json
│   │       ├── input.v1.schema.json
│   │       ├── inbound.v1.jsonata
│   │       └── canonical.v1.schema.json
│   └── company-b/
│       └── ...
├── schemas/
│   ├── envelope.schema.json
│   └── canonical/
│       ├── order-created.v1.schema.json
│       └── order-line-created.v1.schema.json
├── test/
│   ├── unit/
│   │   ├── jsonata-transformer.test.ts
│   │   ├── validator.test.ts
│   │   └── error-classifier.test.ts
│   ├── integration/
│   │   ├── kafka-consumer.test.ts
│   │   └── end-to-end.test.ts
│   └── fixtures/
│       ├── partner-events.json
│       └── expected-outputs.json
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── hpa.yaml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

## 📦 Dependencies (package.json)

```json
{
  "name": "transformer-service",
  "version": "1.0.0",
  "description": "Partner event transformation service",
  "main": "dist/app.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "ts-node src/app.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "docker:build": "docker build -t transformer:latest .",
    "docker:run": "docker-compose up",
    "docker:stop": "docker-compose down"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "fastify-plugin": "^4.5.0",
    "@fastify/cors": "^8.4.0",
    "@fastify/helmet": "^11.1.0",
    "kafkajs": "^2.2.0",
    "jsonata": "^2.4.0",
    "ajv": "^8.12.0",
    "pino": "^8.17.0",
    "pino-pretty": "^10.2.0",
    "prom-client": "^15.0.0",
    "@opentelemetry/api": "^1.7.0",
    "@opentelemetry/sdk-node": "^0.45.0",
    "@opentelemetry/auto-instrumentations-node": "^0.41.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.45.0",
    "dotenv": "^16.3.0",
    "joi": "^17.11.0",
    "uuid": "^9.0.0",
    "lodash": "^4.17.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/jest": "^29.5.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "prettier": "^3.1.0",
    "testcontainers": "^9.12.0"
  }
}
```

## 🚀 Setup

### 1. Create Project

```bash
mkdir transformer-service
cd transformer-service
npm init -y
npm install fastify kafkajs jsonata ajv pino dotenv
npm install -D typescript ts-node @types/node jest ts-jest
```

### 2. Configure TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### 3. Environment Configuration

```bash
# .env
NODE_ENV=development
LOG_LEVEL=info

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_INPUT_TOPIC=partner.raw.events
KAFKA_OUTPUT_TOPIC=canonical.events
KAFKA_DLQ_TOPIC=transformation.dlq
KAFKA_CONSUMER_GROUP=transformer-service
KAFKA_AUTO_COMMIT=false

# Service
SERVICE_PORT=3000
SERVICE_HOST=0.0.0.0
WORKER_POOL_SIZE=4

# Metrics
METRICS_PORT=9090

# Tracing
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## 📋 Key Components

### 1. Fastify Application Setup

```typescript
// src/app.ts
import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { logger } from './utils/logger'
import { metricsPlugin } from './plugins/metrics'
import { healthCheckPlugin } from './plugins/healthcheck'
import { tracingPlugin } from './plugins/tracing'
import { kafkaConsumer } from './kafka/consumer'
import { workerPool } from './workers/worker-pool'

export async function createApp() {
  const fastify = Fastify({
    logger: logger,
    requestTimeout: 30000
  })

  // Register plugins
  await fastify.register(helmet)
  await fastify.register(cors)
  await fastify.register(metricsPlugin)
  await fastify.register(healthCheckPlugin)
  await fastify.register(tracingPlugin)

  // Initialize Kafka consumer
  await kafkaConsumer.connect()
  await kafkaConsumer.subscribe()

  // Initialize worker pool
  await workerPool.initialize()

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM']
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully`)
      await fastify.close()
      await kafkaConsumer.disconnect()
      await workerPool.shutdown()
      process.exit(0)
    })
  })

  return fastify
}
```

### 2. Kafka Consumer

```typescript
// src/kafka/consumer.ts
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs'
import { logger } from '../utils/logger'
import { workerPool } from '../workers/worker-pool'
import { errorClassifier } from '../services/error-classifier'
import { dlqPublisher } from '../services/dlq-publisher'

class KafkaConsumer {
  private kafka: Kafka
  private consumer: Consumer
  private isRunning = false

  constructor() {
    this.kafka = new Kafka({
      clientId: 'transformer-service',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8,
        maxRetryTime: 30000
      }
    })

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_CONSUMER_GROUP || 'transformer-service',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    })
  }

  async connect() {
    try {
      await this.consumer.connect()
      logger.info('Kafka consumer connected')
    } catch (error) {
      logger.error('Failed to connect Kafka consumer', error)
      throw error
    }
  }

  async subscribe() {
    try {
      await this.consumer.subscribe({
        topic: process.env.KAFKA_INPUT_TOPIC || 'partner.raw.events',
        fromBeginning: false
      })

      await this.consumer.run({
        eachMessage: this.handleMessage.bind(this)
      })

      this.isRunning = true
      logger.info('Kafka consumer subscribed and running')
    } catch (error) {
      logger.error('Failed to subscribe to Kafka topic', error)
      throw error
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { topic, partition, offset, key, value, headers } = payload

    try {
      logger.info(`Received message: topic=${topic}, partition=${partition}, offset=${offset}`)

      // Submit to worker pool
      await workerPool.submit({
        topic,
        partition,
        offset,
        key: key?.toString(),
        value: value?.toString(),
        headers: this.parseHeaders(headers)
      })

      // Commit offset after successful processing
      await this.consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (offset + 1).toString()
        }
      ])
    } catch (error) {
      logger.error('Error processing message', { topic, partition, offset, error })

      // Classify error and handle accordingly
      const errorType = errorClassifier.classify(error)
      if (errorType === 'RETRYABLE') {
        // Will be retried by Kafka consumer group
        throw error
      } else {
        // Send to DLQ
        await dlqPublisher.publish({
          originalTopic: topic,
          partition,
          offset,
          key: key?.toString(),
          value: value?.toString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  private parseHeaders(headers: Record<string, Buffer> | undefined) {
    if (!headers) return {}
    return Object.entries(headers).reduce((acc, [key, value]) => {
      acc[key] = value.toString()
      return acc
    }, {} as Record<string, string>)
  }

  async disconnect() {
    if (this.isRunning) {
      await this.consumer.disconnect()
      logger.info('Kafka consumer disconnected')
    }
  }
}

export const kafkaConsumer = new KafkaConsumer()
```

### 3. JSONata Transformer Service

```typescript
// src/services/jsonata-transformer.ts
import jsonata from 'jsonata'
import { logger } from '../utils/logger'
import { mappingCache } from './mapping-cache'

interface TransformationResult {
  success: boolean
  data?: any
  error?: string
}

class JsonataTransformer {
  private expressionCache = new Map<string, any>()

  async transform(
    partnerId: string,
    eventType: string,
    schemaVersion: string,
    inputData: any
  ): Promise<TransformationResult> {
    try {
      // Get mapping from cache
      const mapping = await mappingCache.getMapping(
        partnerId,
        eventType,
        schemaVersion
      )

      if (!mapping) {
        return {
          success: false,
          error: `Mapping not found for ${partnerId}/${eventType}/${schemaVersion}`
        }
      }

      // Get or compile JSONata expression
      const expression = this.getExpression(mapping)

      // Apply transformation
      const result = await expression.evaluate(inputData)

      logger.info('Transformation successful', {
        partnerId,
        eventType,
        schemaVersion
      })

      return {
        success: true,
        data: result
      }
    } catch (error) {
      logger.error('Transformation failed', {
        partnerId,
        eventType,
        schemaVersion,
        error
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getExpression(mapping: string) {
    if (!this.expressionCache.has(mapping)) {
      const expression = jsonata(mapping)
      this.expressionCache.set(mapping, expression)
    }
    return this.expressionCache.get(mapping)!
  }

  clearCache() {
    this.expressionCache.clear()
  }
}

export const jsonataTransformer = new JsonataTransformer()
```

### 4. Schema Validator

```typescript
// src/services/validator.ts
import Ajv, { JSONSchemaType } from 'ajv'
import { logger } from '../utils/logger'
import { schemaCache } from './schema-cache'

class Validator {
  private ajv: Ajv
  private validatorCache = new Map<string, any>()

  constructor() {
    this.ajv = new Ajv({
      strict: true,
      useDefaults: true,
      removeAdditional: 'all'
    })
  }

  async validateInput(
    partnerId: string,
    eventType: string,
    schemaVersion: string,
    data: any
  ): Promise<{ valid: boolean; errors?: any[] }> {
    try {
      const schema = await schemaCache.getInputSchema(
        partnerId,
        eventType,
        schemaVersion
      )

      if (!schema) {
        return {
          valid: false,
          errors: [`Schema not found for ${partnerId}/${eventType}/${schemaVersion}`]
        }
      }

      const validator = this.getValidator(schema)
      const valid = validator(data)

      if (!valid) {
        logger.warn('Input validation failed', {
          partnerId,
          eventType,
          errors: validator.errors
        })
        return { valid: false, errors: validator.errors }
      }

      return { valid: true }
    } catch (error) {
      logger.error('Validation error', { error })
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  async validateOutput(
    eventType: string,
    schemaVersion: string,
    data: any
  ): Promise<{ valid: boolean; errors?: any[] }> {
    try {
      const schema = await schemaCache.getCanonicalSchema(eventType, schemaVersion)

      if (!schema) {
        return {
          valid: false,
          errors: [`Canonical schema not found for ${eventType}/${schemaVersion}`]
        }
      }

      const validator = this.getValidator(schema)
      const valid = validator(data)

      if (!valid) {
        logger.warn('Output validation failed', {
          eventType,
          errors: validator.errors
        })
        return { valid: false, errors: validator.errors }
      }

      return { valid: true }
    } catch (error) {
      logger.error('Validation error', { error })
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  private getValidator(schema: any) {
    const schemaKey = JSON.stringify(schema)
    if (!this.validatorCache.has(schemaKey)) {
      const validator = this.ajv.compile(schema)
      this.validatorCache.set(schemaKey, validator)
    }
    return this.validatorCache.get(schemaKey)!
  }
}

export const validator = new Validator()
```

### 5. Worker Pool

```typescript
// src/workers/worker-pool.ts
import { Worker } from 'worker_threads'
import path from 'path'
import { logger } from '../utils/logger'

interface WorkerTask {
  topic: string
  partition: number
  offset: string
  key?: string
  value?: string
  headers: Record<string, string>
}

class WorkerPool {
  private workers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private activeWorkers = new Set<Worker>()
  private poolSize: number

  constructor(poolSize: number = 4) {
    this.poolSize = poolSize
  }

  async initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(path.join(__dirname, 'transform-worker.ts'))
      this.workers.push(worker)
    }
    logger.info(`Worker pool initialized with ${this.poolSize} workers`)
  }

  async submit(task: WorkerTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => !this.activeWorkers.has(w))

      if (!availableWorker) {
        this.taskQueue.push(task)
        return
      }

      this.executeTask(availableWorker, task, resolve, reject)
    })
  }

  private executeTask(
    worker: Worker,
    task: WorkerTask,
    resolve: () => void,
    reject: (error: Error) => void
  ) {
    this.activeWorkers.add(worker)

    const timeout = setTimeout(() => {
      this.activeWorkers.delete(worker)
      reject(new Error('Worker task timeout'))
    }, 30000)

    worker.once('message', (result) => {
      clearTimeout(timeout)
      this.activeWorkers.delete(worker)

      if (result.error) {
        reject(new Error(result.error))
      } else {
        resolve()
      }

      // Process next task in queue
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift()!
        this.executeTask(worker, nextTask, () => {}, () => {})
      }
    })

    worker.once('error', (error) => {
      clearTimeout(timeout)
      this.activeWorkers.delete(worker)
      reject(error)
    })

    worker.postMessage(task)
  }

  async shutdown() {
    await Promise.all(this.workers.map(w => w.terminate()))
    logger.info('Worker pool shut down')
  }
}

export const workerPool = new WorkerPool(
  parseInt(process.env.WORKER_POOL_SIZE || '4', 10)
)
```

## 🧪 Testing

### Unit Test Example

```typescript
// test/unit/jsonata-transformer.test.ts
import { jsonataTransformer } from '../../src/services/jsonata-transformer'

describe('JSONata Transformer', () => {
  it('should transform simple data', async () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe'
    }

    const result = await jsonataTransformer.transform(
      'company-a',
      'OrderCreated',
      'v1',
      input
    )

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should handle transformation errors', async () => {
    const result = await jsonataTransformer.transform(
      'unknown-partner',
      'UnknownEvent',
      'v1',
      {}
    )

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start

# Docker
npm run docker:build
npm run docker:run
```

## 📋 Implementation Checklist

- [ ] Node.js 18+ setup
- [ ] Fastify framework setup
- [ ] TypeScript configuration
- [ ] Kafka consumer setup
- [ ] Kafka producer setup
- [ ] JSONata integration
- [ ] Ajv schema validation
- [ ] Worker pool implementation
- [ ] Error handling & DLQ
- [ ] Metrics collection
- [ ] Health checks
- [ ] Logging (Pino)
- [ ] Tracing (OpenTelemetry)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Docker containerization
- [ ] Kubernetes deployment

---

**See Also**: [Tech Stack](../architecture/tech-stack.md), [Architecture Overview](../architecture/01-overview.md)
