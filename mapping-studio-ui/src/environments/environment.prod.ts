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
    baseUrl: 'https://api.canonbridge.com/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // WebSocket Configuration
  websocket: {
    url: 'wss://api.canonbridge.com',
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
  },
  
  // Feature Flags
  features: {
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
    maxFieldDepth: 10,
    previewSampleSize: 5,
    autoSaveInterval: 30000, // 30 seconds
  },
};

