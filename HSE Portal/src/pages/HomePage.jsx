import Panel from '../components/Panel';
import { PORTAL_NAV } from '../data/navConfig';
import {
  IconShieldCheck, IconClipboard, IconCap, IconCalendarCheck, IconAlertTriangle, IconEye,
  IconFlag, IconFirstAid, IconFileText, IconRepeat, IconFlame, IconBookOpen, IconArrowRight,
  IconLayers, IconCheckCircle, IconClock,
} from '../components/icons';

// Flat lookup of every portal nav item (top-level + children) so a card can
// navigate exactly like clicking the same entry in the sidebar.
const NAV_ITEMS = Object.fromEntries(
  PORTAL_NAV.flatMap((g) => g.items)
    .flatMap((item) => [item, ...(item.children || [])])
    .map((item) => [item.id, item]),
);

const MODULES = [
  {
    id: 'ehs-audit',
    title: 'EHS Audit',
    icon: IconClipboard,
    accent: 'var(--blue-600)',
    summary: 'Structured, checklist-based safety audits for equipment and facilities across the plant.',
    features: [
      'Dedicated audit apps for Machine, ForkLift, Web Sling, Hoist & EOT Crane and Fire Safety',
      'Equipment master registers, online audits and observation capture with photos',
      'HOD approval, corrective-action tracking, audit history and management reports',
      'Quick checklist forms for Power Tools, Outside Vehicles, Sub Station, Boiler, Battery Charging and Canteen',
    ],
    links: [
      { id: 'ehs-machine', label: 'Machine' },
      { id: 'ehs-forklift', label: 'ForkLift' },
      { id: 'ehs-web-sling', label: 'Web Sling' },
      { id: 'ehs-hoist', label: 'Hoist' },
      { id: 'ehs-fire-safety', label: 'Fire Safety' },
      { id: 'ehs-powertools', label: "Power Tool's" },
    ],
  },
  {
    id: 'training',
    title: 'Training Management',
    icon: IconCap,
    accent: 'var(--violet-600)',
    summary: 'End-to-end management of employee safety training, inductions and certifications.',
    features: [
      'Employee master with individual training profiles',
      'Training sessions, safety induction and special / job-specific training',
      'Certificate expiry tracking with reminders and notifications',
      'Incident communication, HOD approval and HOD training reports',
    ],
  },
  {
    id: 'atp-today',
    title: 'Audit & Training Plan',
    icon: IconCalendarCheck,
    accent: 'var(--info-600)',
    summary: 'Plan and follow up the daily and periodic schedule of audits and training.',
    features: [
      "Today's plan view, also surfaced as a pop-up reminder on login",
      'Full audit & training calendar for planning ahead',
    ],
    links: [
      { id: 'atp-today', label: "Today's Plan" },
      { id: 'atp-plan', label: 'Full Plan' },
    ],
  },
  {
    id: 'safety-violation',
    title: 'Safety Violation',
    icon: IconAlertTriangle,
    accent: 'var(--red-600)',
    summary: 'Report unsafe acts and rule violations and drive them to closure.',
    features: [
      'Safety agents raise violations with details and evidence',
      'HOD dashboard to review, action and close violations',
      'Alerts for new and pending violations',
    ],
  },
  {
    id: 'safety-observation',
    title: 'Safety Observation',
    icon: IconEye,
    accent: 'var(--amber-600)',
    summary: 'Capture safe and unsafe observations on the shop floor before they become incidents.',
    features: [
      'Quick observation logging by field agents',
      'HOD dashboard with all observations and their status',
      'Alerts so nothing stays unattended',
    ],
  },
  {
    id: 'incident-report',
    title: 'Incident Report',
    icon: IconFlag,
    accent: 'var(--orange-600)',
    summary: 'Record incidents and near-misses and track investigation and follow-up.',
    features: [
      'Structured incident reporting form',
      'HOD view of all incidents with review workflow',
      'Alerts and per-user incident history',
    ],
  },
  {
    id: 'fast-aid',
    title: 'FastAid',
    icon: IconFirstAid,
    accent: 'var(--green-600)',
    summary: 'Inspection and refill management for first-aid boxes across the site.',
    features: [
      'First-aid attendants run box inspections and log findings',
      'OHC dashboard for all boxes, inspection records and refill requests',
      'Alerts for missing or expired items',
    ],
  },
  {
    id: 'permits',
    title: 'Permits to Work',
    icon: IconFileText,
    accent: 'var(--teal-600)',
    summary: 'Issue and monitor work permits for high-risk jobs.',
    features: [
      'Permits dashboard with pending, approved and rejected counts',
      'Permit forms for General, Work at Height, Hot Work, Confined Space, LOTO and Excavation',
    ],
    links: [
      { id: 'permits-dashboard', label: 'Dashboard' },
      { id: 'permits-general', label: 'General' },
      { id: 'permits-hotwork', label: 'Hot Work' },
      { id: 'permits-height', label: 'Work at Height' },
    ],
  },
  {
    id: 'moc',
    title: 'Management of Change',
    icon: IconRepeat,
    accent: 'var(--pink-600)',
    summary: 'Control technical and process changes from request to verified closure.',
    features: [
      'MOC register and new MOC requests',
      'Screening, technical review and risk assessment',
      'Action assignment, approval centre and implementation control',
      'Post-change verification, audit trail and management reports',
    ],
  },
  {
    id: 'doc-review',
    title: 'Document Review',
    icon: IconBookOpen,
    accent: 'var(--cyan-600)',
    summary: 'Keep controlled HSE documents reviewed, approved and up to date.',
    features: [
      'Submit documents for review and track pending reviews',
      'Review inbox, assignments, approvals and review history',
      'Master document register with obsolete / archive handling',
    ],
  },
  {
    id: 'fire-extinguishers',
    title: 'Fire Safety',
    icon: IconFlame,
    accent: 'var(--red-600)',
    summary: 'Complete fire-equipment lifecycle management.',
    features: [
      'Fire asset register and equipment audits with observations',
      'AMC / service requests, fire pump audits and refilling / hydro tests',
      'Expiry & compliance alerts, corrective actions and HOD reports',
    ],
  },
];

const UPCOMING = ['HIRA Review', 'HSSE Certification', 'JSA', 'TPI', 'Stop Call Wait', 'PPE Store'];

function go(onNavigate, id) {
  const item = NAV_ITEMS[id];
  if (!item) return;
  // Parent groups (e.g. EHS Audit, Permits) aren't pages; open their first child instead.
  const target = item.children ? item.children[0] : item;
  onNavigate(target.id, target);
}

export default function HomePage({ onNavigate }) {
  return (
    <div className="page-enter home-page">
      <section className="home-hero">
        <div className="home-hero-icon"><IconShieldCheck size={30} /></div>
        <div>
          <h1 className="page-title" style={{ marginBottom: 6 }}>Welcome to SafeNextG</h1>
          <p className="home-hero-text">
            SafeNextG is a single Environment, Health &amp; Safety (EHS) portal for the plant. It brings audits,
            training, incident and violation reporting, permits, change management, document control and fire
            safety into one place, so safety teams, HODs and management work from the same data.
          </p>
        </div>
      </section>

      <div className="stat-grid">
        <div className="home-kpi"><IconLayers size={18} /><strong>{MODULES.length}</strong><span>Modules live</span></div>
        <div className="home-kpi"><IconClipboard size={18} /><strong>11</strong><span>Audit types</span></div>
        <div className="home-kpi"><IconCheckCircle size={18} /><strong>HOD</strong><span>Approval workflows</span></div>
        <div className="home-kpi"><IconClock size={18} /><strong>{UPCOMING.length}</strong><span>Modules coming soon</span></div>
      </div>

      <h2 className="home-section-title">What’s available</h2>
      <div className="home-grid">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="home-card" style={{ '--accent': m.accent }}>
              <div className="home-card-head">
                <span className="home-card-icon"><Icon size={20} /></span>
                <h3>{m.title}</h3>
              </div>
              <p className="home-card-summary">{m.summary}</p>
              <ul className="home-card-list">
                {m.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <div className="home-card-actions">
                {m.links ? m.links.map((l) => (
                  <button key={l.id} type="button" className="home-chip" onClick={() => go(onNavigate, l.id)}>
                    {l.label}
                  </button>
                )) : (
                  <button type="button" className="home-open" onClick={() => go(onNavigate, m.id)}>
                    Open module <IconArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Panel title="How it works" icon={<IconRepeat size={17} />}>
        <ol className="home-flow">
          <li><strong>Record</strong> – field users log audits, observations, violations, incidents and inspections.</li>
          <li><strong>Review</strong> – HODs and OHC review submissions, approve or reject, and assign corrective actions.</li>
          <li><strong>Close</strong> – actions are tracked to closure with full history and audit trail.</li>
          <li><strong>Report</strong> – dashboards and management reports show status, trends and expiries.</li>
        </ol>
      </Panel>

      <Panel title="Coming soon" icon={<IconClock size={17} />}>
        <div className="home-card-actions">
          {UPCOMING.map((u) => <span key={u} className="pill pill-slate">{u}</span>)}
        </div>
      </Panel>
    </div>
  );
}
