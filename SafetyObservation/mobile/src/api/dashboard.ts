import { apiClient } from './client';
import type { AgentSummary, HodSummary } from '@/types';

export function myDashboardSummary() {
  return apiClient.get<AgentSummary>('/dashboard/my-summary').then((res) => res.data);
}

export function hodDashboardSummary() {
  return apiClient.get<HodSummary>('/dashboard/summary').then((res) => res.data);
}
