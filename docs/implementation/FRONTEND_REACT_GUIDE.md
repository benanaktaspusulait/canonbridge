# Frontend Implementation Guide - React + Node.js

## 🎯 Overview

The frontend layer provides dashboards, monitoring, partner management, Mapping Studio navigation, and real-time metrics visualization using React 18 with TypeScript.

Mapping Studio product behavior is defined in:

- [Mapping Studio Product Requirements](../product/01-mapping-studio-product-requirements.md)
- [Mapping Studio UX Flow](../product/02-mapping-studio-ux-flow.md)
- [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Monitoring/
│   │   ├── Partners/
│   │   ├── MappingStudio/
│   │   ├── Metrics/
│   │   └── Common/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Partners.tsx
│   │   ├── MappingStudio.tsx
│   │   ├── Monitoring.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── mappingStudio.ts
│   │   └── metrics.ts
│   ├── store/
│   │   ├── slices/
│   │   ├── hooks.ts
│   │   └── store.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── metrics.ts
│   │   ├── mapping-studio.ts
│   │   └── partner.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@reduxjs/toolkit": "^1.9.x",
    "react-redux": "^8.x",
    "@mui/material": "^5.x",
    "@mui/icons-material": "^5.x",
    "axios": "^1.x",
    "recharts": "^2.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^4.x",
    "@vitejs/plugin-react": "^4.x",
    "vitest": "^0.x",
    "@testing-library/react": "^14.x",
    "cypress": "^13.x"
  }
}
```

## 🚀 Setup

### 1. Create Project

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### 2. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 3. Setup Redux

```typescript
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import partnersReducer from './slices/partnersSlice'
import metricsReducer from './slices/metricsSlice'

export const store = configureStore({
  reducer: {
    partners: partnersReducer,
    metrics: metricsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### 4. Setup Material-UI

```typescript
// src/main.tsx
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
)
```

## 📊 Key Components

### Mapping Studio Shell

The React application should own navigation, route protection, draft lists, published version lists, validation run details, and the surrounding page shell. Complex schema/mapping forms may live directly in React or be implemented as Angular form modules, but the user experience should follow the Mapping Studio product docs.

Core routes:

```text
/mapping-studio
/mapping-studio/drafts/:draftId
/mapping-studio/drafts/:draftId/samples
/mapping-studio/drafts/:draftId/schema
/mapping-studio/drafts/:draftId/mapping
/mapping-studio/drafts/:draftId/preview
/mapping-studio/drafts/:draftId/review
/mapping-studio/versions
/mapping-studio/validation-runs/:validationRunId
```

Core responsibilities:

- List drafts and published versions.
- Launch create/clone draft flows.
- Render Mapping Studio wizard steps.
- Show validation run status and errors.
- Link runtime DLQ context to draft fixes when available.
- Enforce route-level permissions.

### Dashboard Component

```typescript
// src/components/Dashboard/Dashboard.tsx
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchMetrics } from '../../store/slices/metricsSlice'
import { Grid, Paper, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { metrics, loading } = useAppSelector(state => state.metrics)

  useEffect(() => {
    dispatch(fetchMetrics())
    const interval = setInterval(() => {
      dispatch(fetchMetrics())
    }, 5000)
    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Messages Processed</Typography>
          <LineChart width={400} height={300} data={metrics}>
            <CartesianGrid />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </Paper>
      </Grid>
      {/* More components */}
    </Grid>
  )
}
```

### Metrics Service

```typescript
// src/services/metrics.ts
import axios from 'axios'

const API_BASE = '/api'

export const metricsService = {
  getMetrics: async () => {
    const response = await axios.get(`${API_BASE}/metrics`)
    return response.data
  },

  getPartnerMetrics: async (partnerId: string) => {
    const response = await axios.get(`${API_BASE}/metrics/partners/${partnerId}`)
    return response.data
  },

  getSystemHealth: async () => {
    const response = await axios.get(`${API_BASE}/health`)
    return response.data
  }
}
```

## 🧪 Testing

### Unit Tests

```typescript
// src/components/Dashboard/__tests__/Dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../../store/store'
import { Dashboard } from '../Dashboard'

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    )
    expect(screen.getByText('Messages Processed')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
// cypress/e2e/dashboard.cy.ts
describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('displays metrics', () => {
    cy.get('[data-testid="metrics-chart"]').should('be.visible')
    cy.get('[data-testid="throughput-value"]').should('contain', 'msg/sec')
  })

  it('updates metrics in real-time', () => {
    cy.get('[data-testid="throughput-value"]').then(($el) => {
      const initialValue = $el.text()
      cy.wait(5000)
      cy.get('[data-testid="throughput-value"]').should('not.have.text', initialValue)
    })
  })
})
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Implementation Checklist

- [ ] Project setup with Vite
- [ ] Redux store configuration
- [ ] Material-UI theme setup
- [ ] API client setup
- [ ] Dashboard component
- [ ] Metrics visualization
- [ ] Partner management UI
- [ ] Mapping Studio route and shell
- [ ] Mapping draft list
- [ ] Published mapping version list
- [ ] Validation run detail view
- [ ] Real-time updates
- [ ] Authentication integration
- [ ] Unit tests
- [ ] E2E tests
- [ ] Production build
- [ ] Docker containerization

---

**See Also**: [TECH_STACK_FINAL.md](../architecture/tech-stack.md)
