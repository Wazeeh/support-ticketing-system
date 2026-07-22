export type UserRole = 'ADMIN' | 'DEVELOPER' | 'CLIENT_PORTAL' | 'SYSTEM';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}