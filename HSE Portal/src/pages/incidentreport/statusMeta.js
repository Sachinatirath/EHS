export const STATUS_META = {
  open: { label: 'Open', pill: 'pill-amber' },
  under_investigation: { label: 'Under Investigation', pill: 'pill-blue' },
  closed: { label: 'Closed', pill: 'pill-green' },
};

export const SEVERITY_META = {
  Low: { pill: 'pill-green' },
  Medium: { pill: 'pill-amber' },
  High: { pill: 'pill-orange' },
  Critical: { pill: 'pill-red' },
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString();
}
