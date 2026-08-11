import type { ObservationRecord, ObservationStatus } from '@/types';
import { colors, statusColor } from '@/theme';

const STATUS_SERIES: ObservationStatus[] = ['open', 'under_review', 'closed'];

const CATEGORY_PALETTE = [colors.primary, colors.info, colors.warning, colors.success, colors.danger, colors.primaryDark, '#7C3AED'];

export interface DepartmentSeries {
  status: ObservationStatus;
  label: string;
  color: string;
  values: number[];
}

export interface DepartmentBreakdown {
  departments: string[];
  series: DepartmentSeries[];
}

/** Groups observations by department, split into a series per status —
 * feeds a grouped bar chart of where observations are coming from and how
 * they're progressing through review. */
export function buildDepartmentBreakdown(observations: ObservationRecord[]): DepartmentBreakdown {
  const departments = Array.from(new Set(observations.map((o) => o.department ?? 'Unspecified'))).sort();
  const series: DepartmentSeries[] = STATUS_SERIES.map((status) => ({
    status,
    label: statusColor[status].label,
    color: statusColor[status].fg,
    values: departments.map(
      (dept) => observations.filter((o) => (o.department ?? 'Unspecified') === dept && o.status === status).length,
    ),
  }));
  return { departments, series };
}

export interface CategorySlice {
  label: string;
  value: number;
  color: string;
}

/** Counts observations by category for the donut breakdown — which kinds of
 * observations are most common plant-wide. */
export function buildCategoryBreakdown(observations: ObservationRecord[]): CategorySlice[] {
  const counts = new Map<string, number>();
  for (const o of observations) {
    counts.set(o.category, (counts.get(o.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }));
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

/** Observations reported per month, for the last `months` months (oldest
 * first) — trend of reporting volume over time. */
export function buildMonthlyTrend(observations: ObservationRecord[], months = 6): MonthlyPoint[] {
  const now = new Date();
  const buckets: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString(undefined, { month: 'short' }), value: 0 });
  }
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  for (const o of observations) {
    const created = new Date(o.created_at);
    if (created < startOfWindow) continue;
    const diff =
      (created.getFullYear() - startOfWindow.getFullYear()) * 12 + (created.getMonth() - startOfWindow.getMonth());
    if (diff >= 0 && diff < months) buckets[diff].value += 1;
  }
  return buckets;
}
