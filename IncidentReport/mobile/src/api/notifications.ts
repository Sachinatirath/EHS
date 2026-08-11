import { apiClient } from './client';
import type { Notification } from '@/types';

export function listNotifications() {
  return apiClient.get<Notification[]>('/notifications').then((res) => res.data);
}

export function markNotificationRead(notificationId: number) {
  return apiClient
    .post<Notification>(`/notifications/${notificationId}/read`)
    .then((res) => res.data);
}
