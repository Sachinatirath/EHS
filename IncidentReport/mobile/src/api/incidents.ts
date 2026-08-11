import { apiClient } from './client';
import type { Incident, IncidentCreate, IncidentOptions, IncidentRecord, IncidentSummary } from '@/types';

export function incidentOptions() {
  return apiClient.get<IncidentOptions>('/incidents/options').then((res) => res.data);
}

export function createIncident(payload: IncidentCreate) {
  return apiClient.post<Incident>('/incidents', payload).then((res) => res.data);
}

export function myIncidents() {
  return apiClient.get<IncidentSummary[]>('/incidents/mine').then((res) => res.data);
}

/** Plant-wide incident list (HOD only) — every incident reported by every agent. */
export function allIncidents(status?: string) {
  return apiClient
    .get<IncidentRecord[]>('/incidents', { params: status ? { status } : undefined })
    .then((res) => res.data);
}

export function getIncident(incidentId: number) {
  return apiClient.get<Incident>(`/incidents/${incidentId}`).then((res) => res.data);
}

export function updateStatus(incidentId: number, status: 'under_investigation' | 'closed', resolutionNote?: string) {
  return apiClient
    .post<Incident>(`/incidents/${incidentId}/status`, { status, resolution_note: resolutionNote })
    .then((res) => res.data);
}
