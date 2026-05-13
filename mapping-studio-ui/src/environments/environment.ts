/**
 * Development Environment Configuration
 * 
 * This file contains configuration for local development.
 * Do not commit sensitive data to version control.
 */

export const environment = {
  production: false,
  version: '1.0.0',
  
  // API Configuration
  api: {
    baseUrl: '/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // WebSocket Configuration
  websocket: {
    url: 'ws://localhost:3000',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
  
  // Authentication Configuration
  auth: {
    clientId: 'mapping-studio-ui',
    issuer: 'http://localhost:8080/auth/realms/canonbridge',
    redirectUri: 'http://localhost:4200/auth/callback',
    scope: 'openid profile email',
    tokenRefreshThreshold: 300, // 5 minutes before expiry
    demoAccounts: [
      { label: 'Admin User', email: 'admin@canonbridge.io', roleLabel: 'admin' },
      { label: 'Integration Engineer', email: 'engineer@canonbridge.io', roleLabel: 'integration_author' },
      { label: 'Platform Operator', email: 'operator@canonbridge.io', roleLabel: 'operator' },
    ],
  },
  
  // Feature Flags
  features: {
    enableDemoMode: true,
    enableDarkMode: true,
    enableAdvancedEditor: false,
    enableBetaFeatures: true,
    enableDebugMode: true,
    enablePerformanceMonitoring: false,
  },
  
  // Logging Configuration
  logging: {
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: true,
    enableRemote: false,
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
    /** Base URL for @canonbridge/transformer HTTP API (same host as transformer /health). When set, advanced JSONata rules are validated on the server against the demo payloads. */
    transformerApiUrl: 'http://localhost:8083',
    maxFieldDepth: 10,
    previewSampleSize: 5,
    autoSaveInterval: 30000, // 30 seconds
  },
};
