// Lightweight inline SVG icon set — no external icon library required.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export const IconHome = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
  </svg>
);

export const IconGrid = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.4" />
    <rect x="14" y="3" width="7" height="7" rx="1.4" />
    <rect x="3" y="14" width="7" height="7" rx="1.4" />
    <rect x="14" y="14" width="7" height="7" rx="1.4" />
  </svg>
);

export const IconClipboard = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <path d="M9 11h6M9 15h6M9 19h3" />
  </svg>
);

export const IconChevronDown = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} {...base} {...p}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const IconCap = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" />
    <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
    <path d="M21 10v5" />
  </svg>
);

export const IconCalendarCheck = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M8.5 15.2 10.7 17l4.3-4.6" />
  </svg>
);

export const IconAlertTriangle = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path d="M12 10v4.2" />
    <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconEye = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M3.5 3.5l17 17" />
    <path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.2 0 10 7 10 7a15.5 15.5 0 0 1-3.4 4.1M6.6 6.6C4 8.3 2 12 2 12s3.8 7 10 7c1.3 0 2.5-.3 3.5-.7" />
    <path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const IconFlag = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M5 3v18" />
    <path d="M5 4h13l-3 4 3 4H5" />
  </svg>
);

export const IconFileText = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
    <path d="M14 2v5h5" />
    <path d="M8.5 13h7M8.5 16.5h7M8.5 9.5H11" />
  </svg>
);

export const IconRepeat = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M4 7h13l-3-3M20 17H7l3 3" />
  </svg>
);

export const IconCheckSquare = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 12.3 10.8 15 16 9.5" />
  </svg>
);

export const IconShieldCheck = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M12 3 4.5 6v6c0 4.8 3.2 8 7.5 9 4.3-1 7.5-4.2 7.5-9V6L12 3Z" />
    <path d="M9 12.3 11.2 14.5 15.5 10" />
  </svg>
);

export const IconLayers = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" />
    <path d="M2.5 12.2 12 17.2l9.5-5" />
    <path d="M2.5 16.2 12 21.2l9.5-5" />
  </svg>
);

export const IconTool = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M14.5 6.5a4 4 0 0 1-5 5L4 17l3 3 5.5-5.5a4 4 0 0 1 5-5L14.5 6.5Z" />
  </svg>
);

export const IconForklift = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="10" width="6" height="6" rx="1" />
    <path d="M9 16v-9M9 7h4l2 4" />
    <circle cx="6" cy="19" r="1.6" />
    <circle cx="15" cy="19" r="1.6" />
    <path d="M15 19h4v-5h-2" />
  </svg>
);

export const IconTruck = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="1.5" y="7" width="12" height="9" rx="1.4" />
    <path d="M13.5 10h4l3 3v3h-7z" />
    <circle cx="5.5" cy="18" r="1.6" />
    <circle cx="16.5" cy="18" r="1.6" />
  </svg>
);

export const IconSling = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M4 6c4 6 12 6 16 0" />
    <path d="M4 6l-1.5-1.5M4 6l1.7-1M20 6l1.5-1.5M20 6l-1.7-1" />
    <path d="M12 12v7" />
    <path d="M9 19h6" />
  </svg>
);

export const IconHoist = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M4 4h16" />
    <path d="M8 4v6M16 4v6" />
    <path d="M12 10v6" />
    <rect x="9" y="16" width="6" height="4" rx="1" />
  </svg>
);

export const IconSubstation = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const IconBoiler = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="6" y="4" width="12" height="16" rx="3" />
    <path d="M10 9h4M10 13h4" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconBattery = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="2" y="8" width="17" height="8" rx="2" />
    <path d="M21 10.5v3" />
    <path d="M6 12h3l-1 2 4-3h-3l1-2" />
  </svg>
);

export const IconCanteen = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M4 3v7a3 3 0 0 0 3 3v8" />
    <path d="M4 3v5M7 3v5" />
    <path d="M14 3c-1.5 0-2.5 1.5-2.5 4s1 4 2.5 4v10" />
  </svg>
);

export const IconMOC = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M15 16l4-4-4-4" />
    <path d="M19 12H9" />
  </svg>
);

export const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconGauge = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M4 15a8 8 0 1 1 16 0" />
    <path d="M12 15 15.5 9" />
    <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCheckCircle = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.3 10.6 15 16 9.5" />
  </svg>
);

export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconPercent = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M5 19 19 5" />
    <circle cx="7" cy="7" r="2.3" />
    <circle cx="17" cy="17" r="2.3" />
  </svg>
);

export const IconArrowUpRight = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconInfo = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconDownload = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} {...base} {...p}>
    <path d="M12 3v12" />
    <path d="M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 19.5h16" />
  </svg>
);

export const IconTablet = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} {...base} {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2.2" />
    <path d="M11.7 18.2h.6" />
  </svg>
);

export const IconQrCode = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
  </svg>
);

export const IconPrinter = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} {...base} {...p}>
    <path d="M7 8V3h10v5" />
    <rect x="4" y="8" width="16" height="8" rx="1.6" />
    <path d="M7 16v5h10v-5" />
  </svg>
);

export const IconUsers = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
    <path d="M16 8.4a3 3 0 1 1 3.3 5.5" />
    <path d="M21.5 20c0-2.9-1.9-5.1-4.5-5.9" />
  </svg>
);

export const IconBell = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
    <path d="M10 19a2.2 2.2 0 0 0 4 0" />
  </svg>
);

export const IconAward = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <circle cx="12" cy="8" r="5.5" />
    <path d="M8.5 12.8 7 21l5-2.6L17 21l-1.5-8.2" />
  </svg>
);

export const IconBookOpen = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M12 6.5C10.3 5.2 7.7 4.5 4 4.5v14c3.7 0 6.3.7 8 2 1.7-1.3 4.3-2 8-2v-14c-3.7 0-6.3.7-8 2Z" />
    <path d="M12 6.5v14" />
  </svg>
);

export const IconMegaphone = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M3 10v4a1.5 1.5 0 0 0 1.5 1.5H6l1 5h2l-.8-5h1.3l8.5 4V6L9.5 10H4.5A1.5 1.5 0 0 0 3 10Z" />
    <path d="M20 8.5v7" />
  </svg>
);

export const IconSend = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M21 3 3 10.5l7.5 3L13.5 21 21 3Z" />
    <path d="M10.5 13.5 21 3" />
  </svg>
);

export const IconFlame = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M12 2.5c1 3-3 4.5-3 8a3 3 0 0 0 6 0c0-1-.5-1.8-1-2.5.8 1 3 3 3 6a5 5 0 0 1-10 0c0-5 3-7 5-11.5Z" />
  </svg>
);

export const IconMail = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 6.5 12 13l8-6.5" />
  </svg>
);

export const IconHardHat = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M4 15.5a8 8 0 0 1 16 0" />
    <path d="M12 6v3.5" />
    <rect x="2" y="15.5" width="20" height="3" rx="1.5" />
  </svg>
);

export const IconFirstAid = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="5" width="18" height="15" rx="2.5" />
    <path d="M12 9.5v6M9 12.5h6" />
  </svg>
);

export const IconSettings = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.4M12 18.1v2.4M4.4 7.2l2.1 1.2M17.5 15.6l2.1 1.2M4.4 16.8l2.1-1.2M17.5 8.4l2.1-1.2M3.5 12h2.4M18.1 12h2.4" />
  </svg>
);

export const IconArchive = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
    <path d="M4.5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V8.5" />
    <path d="M10 13h4" />
  </svg>
);

export const IconLock = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    <path d="M12 14.5v3" />
  </svg>
);

export const IconArrowRight = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M4 12h16" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);
