// Ported 1:1 from FastAid/mobile/src/data/dashboardCharts.ts — illustrative
// sample data (the app doesn't expose historical/breakdown analytics), using
// the same values and the same colours (mobile theme/colors.ts).
const PRIMARY = '#0F766E';
const WARNING = '#D97706';
const SUCCESS = '#16A34A';
const DANGER = '#DC2626';
const TEXT_MUTED = '#94A3B8';

export const REFILLS_BY_DEPARTMENT = {
  months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  series: [
    { key: 'Production', color: PRIMARY, values: [6, 8, 7, 9, 7, 6] },
    { key: 'Maintenance', color: '#2DD4BF', values: [4, 3, 6, 5, 7, 5] },
    { key: 'Warehouse', color: WARNING, values: [3, 5, 3, 2, 6, 4] },
    { key: 'Lab', color: SUCCESS, values: [1, 0, 4, 3, 3, 5] },
  ],
};

export const EXPIRED_MISSING_BREAKDOWN = [
  { label: 'Antiseptic Solution', value: 28, color: PRIMARY },
  { label: 'Bandages', value: 22, color: '#2DD4BF' },
  { label: 'Gloves', value: 18, color: WARNING },
  { label: 'Burn Dressing', value: 14, color: DANGER },
  { label: 'Cotton', value: 10, color: SUCCESS },
  { label: 'Other', value: 8, color: TEXT_MUTED },
];

export const COMPLETION_RATE_TREND = {
  months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  values: [78, 80, 79, 86, 88, 92],
};
