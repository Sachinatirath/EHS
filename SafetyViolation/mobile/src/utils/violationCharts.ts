import type { ViolationRecord, ViolationStatus } from '@/types';
import { colors, statusColor } from '@/theme';

const STATUS_SERIES: ViolationStatus[] = ['open', 'under_review', 'closed', 'rejected'];

const TYPE_PALETTE = [colors.primary, colors.info, colors.warning, colors.success, colors.danger, colors.primaryDark];

export interface DepartmentSeries {
  status: ViolationStatus;
  label: string;
  color: string;
  values: number[];
}

export interface DepartmentBreakdown {
  departments: string[];
  series: DepartmentSeries[];
}

/** Groups violations by department, split into a series per status — feeds
 * a grouped bar chart of where violations are coming from and how they're
 * progressing through review. */
export function buildDepartmentBreakdown(violations: ViolationRecord[]): DepartmentBreakdown {
  const departments = Array.from(new Set(violations.map((v) => v.department))).sort();
  const series: DepartmentSeries[] = STATUS_SERIES.map((status) => ({
    status,
    label: statusColor[status].label,
    color: statusColor[status].fg,
    values: departments.map(
      (dept) => violations.filter((v) => v.department === dept && v.status === status).length,
    ),
  }));
  return { departments, series };
}

export interface TypeSlice {
  label: string;
  value: number;
  color: string;
}

/** Counts violations by type for the donut breakdown — which kinds of
 * violations are most common plant-wide. */
export function buildTypeBreakdown(violations: ViolationRecord[]): TypeSlice[] {
  const counts = new Map<string, number>();
  for (const v of violations) {
    counts.set(v.violation_type, (counts.get(v.violation_type) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: TYPE_PALETTE[i % TYPE_PALETTE.length] }));
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

/** Violations reported per month, for the last `months` months (oldest
 * first) — trend of reporting volume over time. */
export function buildMonthlyTrend(violations: ViolationRecord[], months = 6): MonthlyPoint[] {
  const now = new Date();
  const buckets: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString(undefined, { month: 'short' }), value: 0 });
  }
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  for (const v of violations) {
    const created = new Date(v.created_at);
    if (created < startOfWindow) continue;
    const diff =
      (created.getFullYear() - startOfWindow.getFullYear()) * 12 + (created.getMonth() - startOfWindow.getMonth());
    if (diff >= 0 && diff < months) buckets[diff].value += 1;
  }
  return buckets;
}
