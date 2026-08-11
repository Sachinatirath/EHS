import { apiClient } from './client';
import type { User } from '@/types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export function login(employeeId: string, password: string) {
  return apiClient
    .post<LoginResponse>('/auth/login', { employee_id: employeeId, password })
    .then((res) => res.data);
}

export function fetchMe() {
  return apiClient.get<User>('/auth/me').then((res) => res.data);
}

export function updateMe(payload: {
  name?: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return apiClient.patch<User>('/auth/me', payload).then((res) => res.data);
}
