export const colors = {
  primary: '#C2410C',
  primaryDark: '#7C2D12',
  primaryLight: '#FFEDD5',

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

export type StatusKind = 'open' | 'under_investigation' | 'closed';

export const statusColor: Record<StatusKind, { fg: string; bg: string; label: string }> = {
  open: { fg: colors.warning, bg: colors.warningLight, label: 'Open' },
  under_investigation: { fg: colors.info, bg: colors.infoLight, label: 'Under Investigation' },
  closed: { fg: colors.success, bg: colors.successLight, label: 'Closed' },
};

export type SeverityKind = 'Low' | 'Medium' | 'High' | 'Critical';

export const severityColor: Record<SeverityKind, { fg: string; bg: string }> = {
  Low: { fg: colors.success, bg: colors.successLight },
  Medium: { fg: colors.warning, bg: colors.warningLight },
  High: { fg: '#C2410C', bg: '#FFEDD5' },
  Critical: { fg: colors.danger, bg: colors.dangerLight },
};
