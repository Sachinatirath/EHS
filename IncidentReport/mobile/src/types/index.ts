export type Role = 'agent' | 'hod';
export type IncidentStatus = 'open' | 'under_investigation' | 'closed';

export interface User {
  id: number;
  employee_id: string;
  name: string;
  role: Role;
  department: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface IncidentOptions {
  departments: string[];
  incident_types: string[];
  severity_levels: string[];
}

export interface IncidentCreate {
  incident_date?: string;
  incident_time?: string;
  reported_by?: string;
  department?: string;
  location?: string;
  description?: string;
  incident_type: string;
  severity: string;
  corrective_action?: string;
  root_cause?: string;
  preventive_action?: string;
  photo_url?: string;
}

export interface Incident {
  id: number;
  incident_no: string;
  agent: User;
  incident_date: string | null;
  incident_time: string | null;
  reported_by: string | null;
  department: string | null;
  location: string | null;
  description: string | null;
  incident_type: string;
  severity: string;
  corrective_action: string | null;
  root_cause: string | null;
  preventive_action: string | null;
  photo_url: string | null;
  status: IncidentStatus;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentSummary {
  id: number;
  incident_no: string;
  department: string | null;
  incident_type: string;
  severity: string;
  status: IncidentStatus;
  created_at: string;
}

export interface IncidentRecord extends IncidentSummary {
  agent: User;
}

export interface Notification {
  id: number;
  message: string;
  incident_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface AgentSummary {
  total_created: number;
  open_count: number;
  under_investigation_count: number;
  closed_this_month: number;
}

export interface HodSummary {
  total_incidents: number;
  open_count: number;
  under_investigation_count: number;
  reported_this_month: number;
  closed_count: number;
}
