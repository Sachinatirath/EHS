import { apiClient } from './client';
import type { Observation, ObservationCreate, ObservationOptions, ObservationRecord, ObservationSummary } from '@/types';

export function observationOptions() {
  return apiClient.get<ObservationOptions>('/observations/options').then((res) => res.data);
}

export function createObservation(payload: ObservationCreate) {
  return apiClient.post<Observation>('/observations', payload).then((res) => res.data);
}

export function myObservations() {
  return apiClient.get<ObservationSummary[]>('/observations/mine').then((res) => res.data);
}

/** Plant-wide observation list (HOD only) — every observation filed by every agent. */
export function allObservations(status?: string) {
  return apiClient
    .get<ObservationRecord[]>('/observations', { params: status ? { status } : undefined })
    .then((res) => res.data);
}

export function getObservation(observationId: number) {
  return apiClient.get<Observation>(`/observations/${observationId}`).then((res) => res.data);
}

export function updateStatus(observationId: number, status: 'under_review' | 'closed', resolutionNote?: string) {
  return apiClient
    .post<Observation>(`/observations/${observationId}/status`, { status, resolution_note: resolutionNote })
    .then((res) => res.data);
}
