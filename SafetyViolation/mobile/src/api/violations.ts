import { apiClient } from './client';
import type { Violation, ViolationCreate, ViolationOptions, ViolationRecord, ViolationSummary } from '@/types';

export function violationOptions() {
  return apiClient.get<ViolationOptions>('/violations/options').then((res) => res.data);
}

export function createViolation(payload: ViolationCreate) {
  return apiClient.post<Violation>('/violations', payload).then((res) => res.data);
}

export function myViolations() {
  return apiClient.get<ViolationSummary[]>('/violations/mine').then((res) => res.data);
}

/** Plant-wide violation list (HOD only) — every notice filed by every agent. */
export function allViolations(status?: string) {
  return apiClient
    .get<ViolationRecord[]>('/violations', { params: status ? { status } : undefined })
    .then((res) => res.data);
}

export function getViolation(violationId: number) {
  return apiClient.get<Violation>(`/violations/${violationId}`).then((res) => res.data);
}

export function updateStatus(
  violationId: number,
  status: 'under_review' | 'closed' | 'rejected',
  resolutionNote?: string,
) {
  return apiClient
    .post<Violation>(`/violations/${violationId}/status`, { status, resolution_note: resolutionNote })
    .then((res) => res.data);
}
