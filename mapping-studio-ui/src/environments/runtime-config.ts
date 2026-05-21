export interface RuntimeCanonBridgeConfig {
  apiBaseUrl?: string;
  websocketUrl?: string;
  authIssuer?: string;
  authClientId?: string;
  authRedirectUri?: string;
  tenantId?: string;
  tenantName?: string;
  transformerApiUrl?: string;
  enableDemoMode?: boolean | string;
}

declare global {
  interface Window {
    CANONBRIDGE_CONFIG?: RuntimeCanonBridgeConfig;
  }
}

function runtimeConfig(): RuntimeCanonBridgeConfig {
  if (typeof window === 'undefined') {
    return {};
  }
  return window.CANONBRIDGE_CONFIG ?? {};
}

export function runtimeString(key: keyof RuntimeCanonBridgeConfig, fallback: string): string {
  const value = runtimeConfig()[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function runtimeBoolean(key: keyof RuntimeCanonBridgeConfig, fallback: boolean): boolean {
  const value = runtimeConfig()[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.trim().toLowerCase());
  }
  return fallback;
}
