// Solid two-tone icons for the login feature tiles, drawn to match the SafeNexG login artwork.
const NAVY = ['#2a63c4', '#0b2a66'];
const GREEN = ['#6cc24a', '#1e8a3c'];

function Grad({ id, colors }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor={colors[0]} />
      <stop offset="1" stopColor={colors[1]} />
    </linearGradient>
  );
}

export const WorkPermitIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <defs><Grad id="lf-wp" colors={NAVY} /></defs>
    <rect x="7" y="6" width="28" height="36" rx="4" fill="url(#lf-wp)" />
    <rect x="14" y="3" width="14" height="7" rx="2.5" fill="#0b2a66" stroke="#fff" strokeWidth="1.5" />
    <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M11.5 17l1.8 1.8 3-3.2M20 17.5h10" />
      <path d="M11.5 24.5l1.8 1.8 3-3.2M20 25h10" />
      <path d="M11.5 32l1.8 1.8 3-3.2M20 32.5h6" />
    </g>
    <circle cx="35" cy="36" r="8.5" fill="#0b2a66" stroke="#fff" strokeWidth="2" />
    <path d="M31 36.2l2.7 2.7 5.3-5.6" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SafetyAuditIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <defs><Grad id="lf-sa" colors={GREEN} /></defs>
    <path d="M24 3l17 6.5v11.8c0 11-7.3 19.6-17 23.7C14.3 40.9 7 32.3 7 21.3V9.5L24 3z" fill="url(#lf-sa)" />
    <path d="M24 8.6l12.2 4.7v8.3c0 8-5 14.5-12.2 17.8-7.2-3.3-12.2-9.8-12.2-17.8v-8.3L24 8.6z" fill="none" stroke="#fff" strokeWidth="2" />
    <path d="M17.5 23.5l4.6 4.6 8.6-9" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IncidentIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <defs><Grad id="lf-ir" colors={NAVY} /></defs>
    <path d="M20.6 6.2c1.5-2.6 5.3-2.6 6.8 0l17 29.6c1.5 2.6-.4 5.9-3.4 5.9H7c-3 0-4.9-3.3-3.4-5.9l17-29.6z" fill="url(#lf-ir)" />
    <rect x="21.6" y="15" width="4.8" height="14" rx="2.4" fill="#fff" />
    <circle cx="24" cy="34.6" r="2.9" fill="#fff" />
  </svg>
);

export const TrainingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <defs>
      <Grad id="lf-tr" colors={GREEN} />
      <linearGradient id="lf-tr2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#58b847" />
        <stop offset="1" stopColor="#2f8f3f" />
      </linearGradient>
    </defs>
    <circle cx="11" cy="15" r="5.2" fill="url(#lf-tr2)" />
    <path d="M2 36c0-6.3 4-10.4 9-10.4s9 4.1 9 10.4v1H2v-1z" fill="url(#lf-tr2)" />
    <circle cx="37" cy="15" r="5.2" fill="url(#lf-tr2)" />
    <path d="M28 36c0-6.3 4-10.4 9-10.4s9 4.1 9 10.4v1H28v-1z" fill="url(#lf-tr2)" />
    <circle cx="24" cy="13" r="6.6" fill="url(#lf-tr)" stroke="#fff" strokeWidth="1.6" />
    <path d="M12.5 40c0-8 5.1-13.2 11.5-13.2S35.5 32 35.5 40v1.5h-23V40z" fill="url(#lf-tr)" stroke="#fff" strokeWidth="1.6" />
  </svg>
);

export const ComplianceIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <defs>
      <Grad id="lf-cp" colors={GREEN} />
      <linearGradient id="lf-cp2" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fd05a" />
        <stop offset="1" stopColor="#3a9c40" />
      </linearGradient>
    </defs>
    <path d="M22 43C9 41 3.5 30.5 6 17c9.5 1 16.8 6.8 18 15.5.6 4.2-.4 7.8-2 10.5z" fill="url(#lf-cp2)" />
    <path d="M23 43c-2.8-12 3-26 19.5-33 3.4 17-4.4 30.6-19.5 33z" fill="url(#lf-cp)" />
    <path d="M23 43c2-9 7.5-17.5 15-25" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M21.5 42.5C17.5 36 13 30 8.5 21" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
  </svg>
);

export const AnalyticsIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <defs><Grad id="lf-an" colors={NAVY} /></defs>
    <rect x="6" y="26" width="9" height="17" rx="2" fill="url(#lf-an)" />
    <rect x="19.5" y="16" width="9" height="27" rx="2" fill="url(#lf-an)" />
    <rect x="33" y="5" width="9" height="38" rx="2" fill="url(#lf-an)" />
  </svg>
);
