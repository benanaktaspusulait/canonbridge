/**
 * Production Environment Configuration
 * 
 * This file contains configuration for production deployment.
 * Sensitive values should be injected at build time or runtime.
 */

export const environment = {
  production: true,
  version: '1.0.0',
  
  // API Configuration
  api: {
    baseUrl: '/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // WebSocket Configuration
  websocket: {
    url: '',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
  
  // Authentication Configuration
  auth: {
    clientId: 'mapping-studio-ui',
    issuer: 'https://auth.canonbridge.com/realms/canonbridge',
    redirectUri: 'https://studio.canonbridge.com/auth/callback',
    scope: 'openid profile email',
    tokenRefreshThreshold: 300, // 5 minutes before expiry
    demoAccounts: [],
  },

  // Tenant Configuration
  tenant: {
    id: 'tenant-acme',
    name: 'Acme Tenant',
    mode: 'single',
  },
  
  // Feature Flags
  features: {
    enableDemoMode: false,
    enableDarkMode: true,
    enableAdvancedEditor: true,
    enableBetaFeatures: false,
    enableDebugMode: false,
    enablePerformanceMonitoring: true,
  },
  
  // Logging Configuration
  logging: {
    level: 'warn', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: false,
    enableRemote: true,
  },
  
  // UI Configuration
  ui: {
    defaultTheme: 'light',
    defaultLanguage: 'en',
    itemsPerPage: 25,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    supportedFileTypes: ['.json', '.txt'],
  },
  
  // Mapping Configuration
  mapping: {
    /** Inject at deploy time via file/environment replacement when Studio should hit the transformer HTTP API (default: unset). */
    transformerApiUrl: '',
    maxFieldDepth: 10,
    previewSampleSize: 5,
    autoSaveInterval: 30000, // 30 seconds
  },
};
