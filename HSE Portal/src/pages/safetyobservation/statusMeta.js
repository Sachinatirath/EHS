export const STATUS_META = {
  open: { label: 'Open', pill: 'pill-amber' },
  under_review: { label: 'Reassigned to Agent', pill: 'pill-blue' },
  escalated_manager: { label: 'Escalated to Manager', pill: 'pill-red' },
  escalated: { label: 'Escalated (SLA missed)', pill: 'pill-orange' },
  closed: { label: 'Closed', pill: 'pill-green' },
  rejected: { label: 'Rejected', pill: 'pill-red' },
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString();
}

export const SLA_OPTIONS = [
  { key: '1', label: '1 hour', hours: 1 },
  { key: '4', label: '4 hours', hours: 4 },
  { key: '8', label: '8 hours', hours: 8 },
  { key: '24', label: '24 hours (default)', hours: 24 },
  { key: '48', label: '48 hours (2 days)', hours: 48 },
  { key: '72', label: '72 hours (3 days)', hours: 72 },
  { key: 'custom', label: 'Custom date & time…' },
];

/** Live countdown text like "23:59:41" (or "1d 02:03:04" beyond a day). */
export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const hh = String(Math.floor((total % 86400) / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${d ? `${d}d ` : ''}${hh}:${mm}:${ss}`;
}

/** SLA state for an observation the agent has to close by `due_at`. */
export function slaInfo(o, now = Date.now()) {
  if (o.status === 'open' && o.hod_due_at) {
    const left = Date.parse(o.hod_due_at) - now;
    return left > 0
      ? { text: `HOD: ${formatCountdown(left)} left`, tone: left < 3600000 ? 'warn' : 'ok', left }
      : { text: 'HOD overdue', tone: 'bad' };
  }
  if (o.status === 'escalated_manager') return { text: 'HOD SLA missed', tone: 'bad' };
  if (!o.due_at) return null;
  const left = Date.parse(o.due_at) - now;
  if (o.status === 'under_review') {
    return left > 0
      ? { text: `${formatCountdown(left)} left`, tone: left < 3600000 ? 'warn' : 'ok', left }
      : { text: 'Overdue', tone: 'bad' };
  }
  if (o.status === 'escalated') return { text: 'SLA missed', tone: 'bad' };
  if (o.status === 'closed') {
    const at = o.closed_at ? Date.parse(o.closed_at) : now;
    return at <= Date.parse(o.due_at) ? { text: 'Met SLA', tone: 'ok' } : { text: 'Missed SLA', tone: 'bad' };
  }
  return null;
}

export const SLA_COLORS = { ok: 'var(--green-600)', warn: 'var(--amber-600)', bad: 'var(--red-600)' };
