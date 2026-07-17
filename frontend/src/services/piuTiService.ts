import { apiClient } from './apiClient';

export const piuTiService = {
  listPiu: () => apiClient.get<{ id: number; name: string; code: string }[]>('/piu'),
  listTiForPiu: (piuId: number) =>
    apiClient.get<{ id: number; name: string; code: string }[]>(`/piu/${piuId}/ti`),
};