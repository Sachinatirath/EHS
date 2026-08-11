export type Role = 'agent' | 'hod';
export type ObservationStatus = 'open' | 'under_review' | 'closed';

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

export interface ObservationOptions {
  categories: string[];
  severity_levels: string[];
}

export interface ObservationCreate {
  observer_name?: string;
  observer_employee_code?: string;
  department?: string;
  observation_date?: string;
  plant?: string;
  area?: string;
  location?: string;
  observation_time?: string;
  category: string;
  description?: string;
  severity: string;
  corrective_action?: string;
  photo_url?: string;
}

export interface Observation {
  id: number;
  observation_no: string;
  agent: User;
  observer_name: string | null;
  observer_employee_code: string | null;
  department: string | null;
  observation_date: string | null;
  plant: string | null;
  area: string | null;
  location: string | null;
  observation_time: string | null;
  category: string;
  description: string | null;
  severity: string;
  corrective_action: string | null;
  photo_url: string | null;
  status: ObservationStatus;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ObservationSummary {
  id: number;
  observation_no: string;
  department: string | null;
  category: string;
  severity: string;
  status: ObservationStatus;
  created_at: string;
}

export interface ObservationRecord extends ObservationSummary {
  agent: User;
}

export interface Notification {
  id: number;
  message: string;
  observation_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface AgentSummary {
  total_created: number;
  open_count: number;
  under_review_count: number;
  closed_this_month: number;
}

export interface HodSummary {
  total_observations: number;
  open_count: number;
  under_review_count: number;
  reported_this_month: number;
  closed_count: number;
}
