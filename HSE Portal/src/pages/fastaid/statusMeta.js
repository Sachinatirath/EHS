// Keep in sync with FastAid/mobile/src/constants/checklist.ts
export const CHECKLIST_ITEMS = [
  'First Aid Box Clean Condition',
  'Box Accessible',
  'Box Lock/Seal Condition',
  'Medicine Availability',
  'Bandages Available',
  'Cotton Available',
  'Antiseptic Solution Available',
  'Gloves Available',
  'Scissors/Forceps Available',
  'Burn Dressing Available',
  'Emergency Contact Sheet Available',
  'Expiry Date Verification',
];

// Same labels/colour roles as FastAid/mobile/src/theme/colors.ts `statusColor`.
export const STATUS_META = {
  ok: { label: 'OK', pill: 'pill-green' },
  expired: { label: 'Expired', pill: 'pill-amber' },
  missing: { label: 'Missing', pill: 'pill-red' },
  pending: { label: 'Pending Refill', pill: 'pill-amber' },
  awaiting_verification: { label: 'Awaiting Your Review', pill: 'pill-blue' },
  closed: { label: 'Closed', pill: 'pill-green' },
  rejected: { label: 'Rejected', pill: 'pill-red' },
};

// Inspection outcome -> status badge, exactly as MyInspectionsScreen / RecordsScreen map it.
export function outcomeKind(outcome) {
  if (outcome === 'refill_requested') return 'pending';
  if (outcome === 'closed_ok') return 'closed';
  return 'ok';
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString();
}

export function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
