export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'integration_author' | 'integration_reviewer' | 'operator' | 'dlq_analyst';
  tenantId: string;
  tenantName: string;
  avatarInitials: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
