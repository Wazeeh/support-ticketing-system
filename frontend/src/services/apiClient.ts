import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '../store/authStore';

const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  '/api/v1';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshed =
          await useAuthStore
            .getState()
            .refreshAccessToken();

        const newAccessToken =
          useAuthStore.getState().accessToken;

        if (refreshed && newAccessToken) {
          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          return apiClient(originalRequest);
        }
      } catch {
        // Logout is handled below.
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);