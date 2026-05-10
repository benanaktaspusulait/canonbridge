# CanonBridge Mapping Studio UI

> **No-code visual mapping interface** for partner event transformations

[![Angular](https://img.shields.io/badge/Angular-21.2-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-21.1-blue.svg)](https://primeng.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

---

## 📋 Overview

Mapping Studio UI is the visual interface for CanonBridge that enables business users to create, test, and publish partner event mappings **without writing code**. Users upload sample JSON, visually map fields, preview transformations, and publish immutable mapping versions - all through an intuitive drag-and-drop interface.

### Key Features

- ✅ **No-Code Mapping** - Visual field mapping with drag-and-drop
- ✅ **Automatic JSONata Generation** - Users don't need to know JSONata
- ✅ **Live Preview** - See transformation results in real-time
- ✅ **Schema Validation** - Automatic schema generation and validation
- ✅ **Version Management** - Immutable mapping versions with rollback
- ✅ **Fixture Testing** - Create and validate test fixtures
- ✅ **Partner Management** - Onboard and configure partners
- ✅ **Monitoring Dashboard** - Real-time metrics and health status

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x LTS or higher
- **npm**: 11.x or higher
- **Angular CLI**: 21.x

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser at http://localhost:4200
```

### Development

```bash
# Start dev server with live reload
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Format code
npm run format

# Check formatting
npm run format:check
```

---

## 🏗️ Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.2 | Frontend framework |
| **TypeScript** | 5.9 | Type-safe development |
| **PrimeNG** | 21.1 | UI component library |
| **PrimeFlex** | 4.0 | CSS utility framework |
| **RxJS** | 7.8 | Reactive programming |
| **Vitest** | 4.0 | Unit testing |

### Project Structure

```
mapping-studio-ui/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services and guards
│   │   │   ├── guards/              # Route guards
│   │   │   ├── models/              # Data models
│   │   │   ├── services/            # Core services
│   │   │   └── interceptors/        # HTTP interceptors
│   │   │
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/                # Authentication
│   │   │   ├── mapping-editor/      # Visual mapping editor
│   │   │   ├── schema-builder/      # Schema generation
│   │   │   ├── preview/             # Transformation preview
│   │   │   └── version-control/     # Version management
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── dashboard/           # Dashboard page
│   │   │   ├── mappings/            # Mappings list
│   │   │   ├── partners/            # Partner management
│   │   │   ├── dlq/                 # Dead letter queue
│   │   │   ├── monitoring/          # Monitoring dashboard
│   │   │   └── settings/            # Settings
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── sidebar/             # Navigation sidebar
│   │   │   ├── topbar/              # Top navigation bar
│   │   │   └── footer/              # Footer
│   │   │
│   │   ├── shared/                  # Shared components
│   │   │   ├── components/          # Reusable components
│   │   │   ├── directives/          # Custom directives
│   │   │   ├── pipes/               # Custom pipes
│   │   │   └── utils/               # Utility functions
│   │   │
│   │   ├── app.config.ts            # App configuration
│   │   ├── app.routes.ts            # Route definitions
│   │   └── app.ts                   # Root component
│   │
│   ├── assets/                      # Static assets
│   │   ├── images/                  # Images
│   │   ├── icons/                   # Icons
│   │   └── fonts/                   # Fonts
│   │
│   ├── environments/                # Environment configs
│   │   ├── environment.ts           # Development
│   │   └── environment.prod.ts      # Production
│   │
│   ├── styles/                      # Global styles
│   │   ├── _variables.scss          # SCSS variables
│   │   ├── _mixins.scss             # SCSS mixins
│   │   └── _themes.scss             # Theme definitions
│   │
│   ├── index.html                   # HTML entry point
│   ├── main.ts                      # TypeScript entry point
│   └── styles.scss                  # Global styles
│
├── public/                          # Public assets
├── .editorconfig                    # Editor configuration
├── .prettierrc                      # Prettier configuration
├── angular.json                     # Angular configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

---

## 🎨 Features

### 1. Visual Mapping Editor

**No-code field mapping with drag-and-drop**:
- Upload or paste sample JSON
- Automatic JSON structure exploration
- Visual field mapping interface
- Automatic JSONata generation
- Live transformation preview

### 2. Schema Management

**Automatic schema generation and validation**:
- Generate input schemas from samples
- Define canonical output schemas
- Schema compatibility checking
- Version management

### 3. Transformation Preview

**Real-time transformation testing**:
- Live preview with sample data
- Multiple test fixtures
- Validation results
- Error highlighting

### 4. Version Control

**Immutable mapping versions**:
- Semantic versioning (v1, v2, v3...)
- Publish workflow with review
- Rollback capabilities
- Change history and audit trail

### 5. Partner Management

**Partner onboarding and configuration**:
- Partner registration
- Event type configuration
- Rate limiting settings
- Monitoring and health checks

### 6. Monitoring Dashboard

**Real-time metrics and health**:
- Event throughput
- Transformation success rate
- DLQ messages
- Performance metrics
- Alert notifications

---

## 🔧 Configuration

### Environment Variables

Create `src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  auth: {
    clientId: 'mapping-studio-ui',
    issuer: 'http://localhost:8080/auth/realms/canonbridge',
  },
  features: {
    enableDarkMode: true,
    enableAdvancedEditor: false,
    enableBetaFeatures: false,
  },
};
```

Create `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.canonbridge.com/api',
  wsUrl: 'wss://api.canonbridge.com',
  auth: {
    clientId: 'mapping-studio-ui',
    issuer: 'https://auth.canonbridge.com/realms/canonbridge',
  },
  features: {
    enableDarkMode: true,
    enableAdvancedEditor: true,
    enableBetaFeatures: false,
  },
};
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/app/core/services/auth.service.spec.ts
```

### E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run E2E tests in headless mode
npm run e2e:headless
```

---

## 📦 Build & Deployment

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

Output will be in `dist/mapping-studio-ui/`.

### Docker Build

```bash
# Build Docker image
docker build -t canonbridge/mapping-studio-ui:latest .

# Run container
docker run -p 4200:80 canonbridge/mapping-studio-ui:latest
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=mapping-studio-ui

# View logs
kubectl logs -f deployment/mapping-studio-ui
```

---

## 🎯 User Workflows

### Creating a New Mapping

1. **Upload Sample JSON**
   - Navigate to Mappings → New Mapping
   - Upload or paste partner event JSON
   - System analyzes structure

2. **Generate Input Schema**
   - Review inferred field types
   - Adjust types if needed
   - Generate JSON Schema

3. **Map Fields Visually**
   - Drag source fields to target fields
   - Apply transformations (trim, uppercase, etc.)
   - Set default values
   - Handle conditional logic

4. **Preview Transformation**
   - See live transformation results
   - Test with multiple samples
   - Validate against canonical schema

5. **Create Test Fixtures**
   - Save sample inputs and expected outputs
   - Run validation tests
   - Ensure all edge cases covered

6. **Review & Publish**
   - Review generated JSONata
   - Submit for approval (if required)
   - Publish immutable version
   - Deploy to transformer service

### Managing Partners

1. **Register Partner**
   - Enter partner details
   - Configure authentication
   - Set rate limits

2. **Configure Event Types**
   - Define supported events
   - Link to mappings
   - Set retry policies

3. **Monitor Health**
   - View real-time metrics
   - Check DLQ messages
   - Review error logs

---

## 🔐 Security

### Authentication

- OAuth 2.0 / OIDC integration
- JWT token-based authentication
- Automatic token refresh
- Secure session management

### Authorization

- Role-Based Access Control (RBAC)
- Route guards
- API permission checks
- Audit logging

### Data Protection

- PII masking in UI
- Secure API communication (HTTPS)
- XSS protection
- CSRF protection

---

## 🎨 Theming

### Custom Theme

Create `src/styles/_custom-theme.scss`:

```scss
@use '@angular/material' as mat;

$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette);
$warn: mat.define-palette(mat.$red-palette);

$theme: mat.define-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
    warn: $warn,
  )
));

@include mat.all-component-themes($theme);
```

### Dark Mode

Toggle dark mode in settings or use system preference:

```typescript
// In component
toggleDarkMode() {
  this.themeService.toggleDarkMode();
}
```

---

## 📊 Performance

### Optimization Techniques

- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Change Detection**: Optimized change detection
- **Virtual Scrolling**: Efficient rendering of large lists
- **Code Splitting**: Smaller bundle sizes
- **Tree Shaking**: Remove unused code
- **AOT Compilation**: Ahead-of-time compilation

### Bundle Size

| Bundle | Size (gzipped) |
|--------|----------------|
| main.js | ~250 KB |
| polyfills.js | ~35 KB |
| styles.css | ~15 KB |
| **Total** | **~300 KB** |

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Port 4200 already in use
```bash
# Solution: Use different port
ng serve --port 4201
```

**Issue**: Module not found errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Build fails with memory error
```bash
# Solution: Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## 📚 Documentation

- [Documentation hub](../../docs/README.md) - CanonBridge docs index
- [Mapping Studio (product)](../../docs/product/README.md) - Requirements, UX, API model
- [Design system](../../docs/product/mapping-studio-design-system.md) - Tokens, components, layout
- [Architecture](../../docs/architecture/tech-stack.md) - System technology stack

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Push changes: `git push origin feature/my-feature`
6. Create pull request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

---

## 📝 License

Proprietary - All rights reserved.

Copyright © 2026 CanonBridge

---

## 🔗 Links

- **Project**: [CanonBridge](../../README.md)
- **Documentation**: [docs/](../../docs/)
- **Architecture**: [docs/architecture/](../../docs/architecture/)
- **Roadmap**: [docs/project/MASTER_ROADMAP.md](../../docs/project/MASTER_ROADMAP.md)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/benanaktaspusulait/canonbridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/benanaktaspusulait/canonbridge/discussions)
- **Email**: support@canonbridge.com

---

**Made with ❤️ by the CanonBridge Team**

