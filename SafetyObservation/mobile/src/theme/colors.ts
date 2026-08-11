export const colors = {
  primary: '#1D4ED8',
  primaryDark: '#1E3A8A',
  primaryLight: '#DBEAFE',

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

export type StatusKind = 'open' | 'under_review' | 'closed';

export const statusColor: Record<StatusKind, { fg: string; bg: string; label: string }> = {
  open: { fg: colors.warning, bg: colors.warningLight, label: 'Open' },
  under_review: { fg: colors.info, bg: colors.infoLight, label: 'Under Review' },
  closed: { fg: colors.success, bg: colors.successLight, label: 'Closed' },
};

export type SeverityKind = 'Low' | 'Medium' | 'High' | 'Critical';

export const severityColor: Record<SeverityKind, { fg: string; bg: string }> = {
  Low: { fg: colors.success, bg: colors.successLight },
  Medium: { fg: colors.warning, bg: colors.warningLight },
  High: { fg: '#C2410C', bg: '#FFEDD5' },
  Critical: { fg: colors.danger, bg: colors.dangerLight },
};
