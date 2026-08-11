import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/config/env';

export const TOKEN_STORAGE_KEY = 'safety_violation.access_token';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (!error.response) return 'Could not reach the server. Check your network connection.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function toAbsoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiUrl}${path}`;
}
