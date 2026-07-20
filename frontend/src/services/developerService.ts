// services/developerService.ts
import { apiClient } from './apiClient';
import { useAuthStore } from '../store/authStore';

export interface Developer {
  id: number;
  full_name: string;
  open_ticket_count: number;
}

export const developerService = {
  listDevelopers: () => {
    const role = useAuthStore.getState().user?.role;
    const basePath = role === 'DEVELOPER' ? '/developer/developers' : '/admin/developers';
    return apiClient.get<Developer[]>(basePath);
  },
};