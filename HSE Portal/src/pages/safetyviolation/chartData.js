const STATUS_SERIES = ['open', 'under_review', 'closed', 'rejected'];
const STATUS_META = {
  open: { label: 'Open', color: '#d97706' },
  under_review: { label: 'Reassigned', color: '#2563eb' },
  closed: { label: 'Closed', color: '#16a34a' },
  rejected: { label: 'Rejected', color: '#dc2626' },
};

const TYPE_PALETTE = ['#b91c1c', '#2563eb', '#d97706', '#16a34a', '#dc2626', '#7f1d1d'];

export function buildDepartmentBreakdown(violations) {
  const departments = Array.from(new Set(violations.map((v) => v.department))).sort();
  const series = STATUS_SERIES.map((status) => ({
    status,
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
    values: departments.map((dept) => violations.filter((v) => v.department === dept && v.status === status).length),
  }));
  return { departments, series };
}

export function buildTypeBreakdown(violations) {
  const counts = new Map();
  violations.forEach((v) => counts.set(v.violation_type, (counts.get(v.violation_type) ?? 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: TYPE_PALETTE[i % TYPE_PALETTE.length] }));
}

export function buildMonthlyTrend(violations, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleDateString(undefined, { month: 'short' }), value: 0 });
  }
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  violations.forEach((v) => {
    const created = new Date(v.created_at);
    if (created < startOfWindow) return;
    const diff = (created.getFullYear() - startOfWindow.getFullYear()) * 12 + (created.getMonth() - startOfWindow.getMonth());
    if (diff >= 0 && diff < months) buckets[diff].value += 1;
  });
  return buckets;
}
