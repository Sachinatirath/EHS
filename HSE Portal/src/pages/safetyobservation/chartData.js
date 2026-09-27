const STATUS_SERIES = ['open', 'escalated_manager', 'under_review', 'escalated', 'closed', 'rejected'];
const STATUS_META = {
  open: { label: 'Open', color: '#d97706' },
  under_review: { label: 'Reassigned', color: '#2563eb' },
  escalated_manager: { label: 'To Manager', color: '#7c3aed' },
  escalated: { label: 'Escalated', color: '#ea580c' },
  closed: { label: 'Closed', color: '#16a34a' },
  rejected: { label: 'Rejected', color: '#dc2626' },
};

const CATEGORY_PALETTE = ['#1d4ed8', '#2563eb', '#d97706', '#16a34a', '#dc2626', '#1e3a8a', '#7c3aed'];

/** Groups observations by department, split into a series per status —
 * feeds a grouped bar chart of where observations are coming from and how
 * they're progressing through review. Mirrors the mobile app's
 * buildDepartmentBreakdown in src/utils/observationCharts.ts. */
export function buildDepartmentBreakdown(observations) {
  const departments = Array.from(new Set(observations.map((o) => o.department ?? 'Unspecified'))).sort();
  const series = STATUS_SERIES.map((status) => ({
    status,
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
    values: departments.map(
      (dept) => observations.filter((o) => (o.department ?? 'Unspecified') === dept && o.status === status).length,
    ),
  }));
  return { departments, series };
}

/** Counts observations by category for the donut breakdown — which kinds of
 * observations are most common plant-wide. Mirrors the mobile app's
 * buildCategoryBreakdown. */
export function buildCategoryBreakdown(observations) {
  const counts = new Map();
  observations.forEach((o) => counts.set(o.category, (counts.get(o.category) ?? 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }));
}

/** Observations reported per month, for the last `months` months (oldest
 * first) — trend of reporting volume over time. Mirrors the mobile app's
 * buildMonthlyTrend. */
export function buildMonthlyTrend(observations, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString(undefined, { month: 'short' }), value: 0 });
  }
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  observations.forEach((o) => {
    const created = new Date(o.created_at);
    if (created < startOfWindow) return;
    const diff = (created.getFullYear() - startOfWindow.getFullYear()) * 12 + (created.getMonth() - startOfWindow.getMonth());
    if (diff >= 0 && diff < months) buckets[diff].value += 1;
  });
  return buckets;
}
