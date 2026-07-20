import { apiClient } from './apiClient';
import type { SoftwareType } from '../types/ticket';

export const categoryService = {
  listCategories: (software: SoftwareType) =>
    apiClient.get<{ value: string; label: string; requires_description: boolean }[]>(
      '/issue-categories', { params: { software } }
    ),
};