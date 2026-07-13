// services/developerService.ts
import { apiClient } from './apiClient';

export interface Developer {
  id: number;
  full_name: string;
  open_ticket_count: number;
}

export const developerService = {
  listDevelopers: () => apiClient.get<Developer[]>('/admin/developers'),
};