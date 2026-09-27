// Ported from IncidentReport/mobile/src/utils/incidentCharts.ts — same
// grouping logic and the same colors as the mobile app's theme.
const STATUS_SERIES = ['open', 'under_investigation', 'closed'];
const STATUS_META = {
  open: { label: 'Open', color: '#D97706' },
  under_investigation: { label: 'Under Investigation', color: '#2563EB' },
  closed: { label: 'Closed', color: '#16A34A' },
};

const TYPE_PALETTE = ['#C2410C', '#2563EB', '#D97706', '#16A34A', '#DC2626', '#7C2D12', '#7C3AED'];

/** Groups incidents by department, split into a series per status. */
export function buildDepartmentBreakdown(incidents) {
  const departments = Array.from(new Set(incidents.map((i) => i.department ?? 'Unspecified'))).sort();
  const series = STATUS_SERIES.map((status) => ({
    status,
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
    values: departments.map(
      (dept) => incidents.filter((i) => (i.department ?? 'Unspecified') === dept && i.status === status).length,
    ),
  }));
  return { departments, series };
}

/** Counts incidents by type for the donut breakdown. */
export function buildTypeBreakdown(incidents) {
  const counts = new Map();
  incidents.forEach((i) => counts.set(i.incident_type, (counts.get(i.incident_type) ?? 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], idx) => ({ label, value, color: TYPE_PALETTE[idx % TYPE_PALETTE.length] }));
}

/** Incidents reported per month for the last `months` months (oldest first). */
export function buildMonthlyTrend(incidents, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString(undefined, { month: 'short' }), value: 0 });
  }
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  incidents.forEach((i) => {
    const created = new Date(i.created_at);
    if (created < startOfWindow) return;
    const diff = (created.getFullYear() - startOfWindow.getFullYear()) * 12 + (created.getMonth() - startOfWindow.getMonth());
    if (diff >= 0 && diff < months) buckets[diff].value += 1;
  });
  return buckets;
}
