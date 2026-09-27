export const STATUS_META = {
  open: { label: 'Open', pill: 'pill-amber' },
  under_review: { label: 'Reassigned to Agent', pill: 'pill-blue' },
  closed: { label: 'Closed', pill: 'pill-green' },
  rejected: { label: 'Rejected', pill: 'pill-red' },
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString();
}
