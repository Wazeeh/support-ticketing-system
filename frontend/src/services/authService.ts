import { apiClient } from './apiClient';
import type { User } from '../types/user';

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/login', { email, password }
    ),
};