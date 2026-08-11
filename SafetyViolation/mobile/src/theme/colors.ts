export const colors = {
  primary: '#B91C1C',
  primaryDark: '#7F1D1D',
  primaryLight: '#FEE2E2',

  success: '#16A34A',
  successLight: '#DCFCE7',

  warning: '#D97706',
  warningLight: '#FEF3C7',

  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  info: '#2563EB',
  infoLight: '#DBEAFE',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  overlay: 'rgba(15, 23, 42, 0.55)',
} as const;

export type StatusKind = 'open' | 'under_review' | 'closed' | 'rejected';

export const statusColor: Record<StatusKind, { fg: string; bg: string; label: string }> = {
  open: { fg: colors.warning, bg: colors.warningLight, label: 'Open' },
  under_review: { fg: colors.info, bg: colors.infoLight, label: 'Under Review' },
  closed: { fg: colors.success, bg: colors.successLight, label: 'Closed' },
  rejected: { fg: colors.danger, bg: colors.dangerLight, label: 'Rejected' },
};
