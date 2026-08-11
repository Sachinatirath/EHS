import type { IncidentRecord, IncidentStatus } from '@/types';
import { colors, statusColor } from '@/theme';

const STATUS_SERIES: IncidentStatus[] = ['open', 'under_investigation', 'closed'];

const TYPE_PALETTE = [colors.primary, colors.info, colors.warning, colors.success, colors.danger, colors.primaryDark, '#7C3AED'];

export interface DepartmentSeries {
  status: IncidentStatus;
  label: string;
  color: string;
  values: number[];
}

export interface DepartmentBreakdown {
  departments: string[];
  series: DepartmentSeries[];
}

/** Groups incidents by department, split into a series per status — feeds
 * a grouped bar chart of where incidents are coming from and how they're
 * progressing through investigation. */
export function buildDepartmentBreakdown(incidents: IncidentRecord[]): DepartmentBreakdown {
  const departments = Array.from(new Set(incidents.map((i) => i.department ?? 'Unspecified'))).sort();
  const series: DepartmentSeries[] = STATUS_SERIES.map((status) => ({
    status,
    label: statusColor[status].label,
    color: statusColor[status].fg,
    values: departments.map(
      (dept) => incidents.filter((i) => (i.department ?? 'Unspecified') === dept && i.status === status).length,
    ),
  }));
  return { departments, series };
}

export interface TypeSlice {
  label: string;
  value: number;
  color: string;
}

/** Counts incidents by type for the donut breakdown — which kinds of
 * incidents are most common plant-wide. */
export function buildTypeBreakdown(incidents: IncidentRecord[]): TypeSlice[] {
  const counts = new Map<string, number>();
  for (const i of incidents) {
    counts.set(i.incident_type, (counts.get(i.incident_type) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], idx) => ({ label, value, color: TYPE_PALETTE[idx % TYPE_PALETTE.length] }));
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

/** Incidents reported per month, for the last `months` months (oldest
 * first) — trend of reporting volume over time. */
export function buildMonthlyTrend(incidents: IncidentRecord[], months = 6): MonthlyPoint[] {
  const now = new Date();
  const buckets: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString(undefined, { month: 'short' }), value: 0 });
  }
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  for (const i of incidents) {
    const created = new Date(i.created_at);
    if (created < startOfWindow) continue;
    const diff =
      (created.getFullYear() - startOfWindow.getFullYear()) * 12 + (created.getMonth() - startOfWindow.getMonth());
    if (diff >= 0 && diff < months) buckets[diff].value += 1;
  }
  return buckets;
}
