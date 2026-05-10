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
    baseUrl: 'http://localhost:3000/api',
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
  },
  
  // Feature Flags
  features: {
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
    maxFieldDepth: 10,
    previewSampleSize: 5,
    autoSaveInterval: 30000, // 30 seconds
  },
};

