export { formatDate, formatDateTime } from '../safetyviolation/statusMeta';

export const STATUS_META = {
  pending_incharge: { label: 'With In-charges', pill: 'pill-amber' },
  ready_to_close: { label: 'Ready to Close', pill: 'pill-blue' },
  closed: { label: 'Closed', pill: 'pill-green' },
};

export const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  ...Object.entries(STATUS_META).map(([key, meta]) => ({ key, label: meta.label })),
];
