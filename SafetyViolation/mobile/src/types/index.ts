export type Role = 'agent' | 'hod';
export type ViolationStatus = 'open' | 'under_review' | 'closed' | 'rejected';

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

export interface ViolationOptions {
  departments: string[];
  violation_types: string[];
  offence_levels: string[];
  corrective_actions: string[];
}

export interface ViolationCreate {
  violation_date?: string;
  company?: string;
  department: string;
  supervisor?: string;
  employee_name?: string;
  employee_code?: string;
  job_title?: string;
  violation_type: string;
  offence: string;
  corrective_actions: string[];
  description?: string;
  explanation?: string;
  photo_url?: string;
  signature_data?: string;
}

export interface Violation {
  id: number;
  violation_no: string;
  agent: User;
  violation_date: string | null;
  company: string | null;
  department: string;
  supervisor: string | null;
  employee_name: string | null;
  employee_code: string | null;
  job_title: string | null;
  violation_type: string;
  offence: string;
  corrective_actions: string[];
  description: string | null;
  explanation: string | null;
  photo_url: string | null;
  signature_data: string | null;
  status: ViolationStatus;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ViolationSummary {
  id: number;
  violation_no: string;
  department: string;
  violation_type: string;
  offence: string;
  status: ViolationStatus;
  employee_name: string | null;
  created_at: string;
}

export interface ViolationRecord extends ViolationSummary {
  agent: User;
}

export interface Notification {
  id: number;
  message: string;
  violation_id: number | null;
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
  total_violations: number;
  open_count: number;
  under_review_count: number;
  reported_this_month: number;
  rejected_count: number;
}
