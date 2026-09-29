import { useEffect, useRef, useState } from 'react';
import { PORTAL_NAV } from '../data/navConfig';
import emblem from '../assets/brand/emblem.png';
import {
  IconClipboard, IconCap, IconCalendarCheck, IconAlertTriangle, IconEye,
  IconFlag, IconFirstAid, IconFileText, IconRepeat, IconFlame, IconBookOpen, IconArrowRight,
  IconLayers, IconCheckCircle, IconClock, IconCheckSquare, IconBarChart, IconUsers,
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
      'Equipment registers, online audits and observations with photos',
      'HOD approval, corrective actions, history and management reports',
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
      'Sessions, safety induction and job-specific training',
      'Certificate expiry tracking with reminders',
    ],
  },
  {
    id: 'atp-today',
    title: 'Audit & Training Plan',
    icon: IconCalendarCheck,
    accent: 'var(--info-600)',
    summary: 'Plan and follow up the daily and periodic schedule of audits and training.',
    features: [
      "Today's plan view, also shown as a reminder on login",
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
      'HOD dashboard with every observation and its status',
      'Alerts so nothing stays unattended',
    ],
  },
  {
    id: 'gemba-walk',
    title: 'Gemba Walk',
    icon: IconUsers,
    accent: 'var(--teal-600)',
    summary: 'Log shop-floor walk findings with a target time and automatic Plant Head escalation.',
    features: [
      'Observation log with area, category and assignee',
      'Live SLA countdown on every open item',
      'Overdue items escalate to the Plant Head automatically',
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
      'Attendants run box inspections and log findings',
      'OHC dashboard for boxes, inspections and refill requests',
      'Alerts for missing or expired items',
    ],
  },
  {
    id: 'permits',
    title: 'Permits to Work',
    icon: IconFileText,
    accent: 'var(--cyan-600)',
    summary: 'Issue and monitor work permits for high-risk jobs.',
    features: [
      'Dashboard with pending, approved and rejected counts',
      'General, Work at Height, Hot Work, Confined Space, LOTO and Excavation',
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
      'MOC register, screening, technical review and risk assessment',
      'Action assignment, approval centre and implementation control',
      'Post-change verification and full audit trail',
    ],
  },
  {
    id: 'doc-review',
    title: 'Document Review',
    icon: IconBookOpen,
    accent: 'var(--blue-500)',
    summary: 'Keep controlled HSE documents reviewed, approved and up to date.',
    features: [
      'Submit documents and track pending reviews',
      'Review inbox, assignments, approvals and history',
      'Master register with obsolete / archive handling',
    ],
  },
  {
    id: 'fire-extinguishers',
    title: 'Fire Safety',
    icon: IconFlame,
    accent: 'var(--red-600)',
    summary: 'Complete fire-equipment lifecycle management.',
    features: [
      'Fire asset register and equipment audits',
      'AMC / service, fire pump audits and hydro tests',
      'Expiry & compliance alerts and HOD reports',
    ],
  },
];

const STATS = [
  { value: MODULES.length, label: 'Modules live', icon: IconLayers, accent: 'var(--blue-600)' },
  { value: 11, label: 'Audit types', icon: IconClipboard, accent: 'var(--teal-600)' },
  { value: 6, label: 'Permit types', icon: IconFileText, accent: 'var(--violet-600)' },
  { value: 24, suffix: '/7', label: 'Access, any device', icon: IconClock, accent: 'var(--amber-600)' },
];

const STEPS = [
  { title: 'Record', text: 'Field users log audits, observations, violations, incidents and inspections.', icon: IconClipboard },
  { title: 'Review', text: 'HODs and OHC review submissions, approve or reject, and assign corrective actions.', icon: IconCheckSquare },
  { title: 'Close', text: 'Actions are tracked to closure with full history and audit trail.', icon: IconCheckCircle },
  { title: 'Report', text: 'Dashboards and management reports show status, trends and expiries.', icon: IconBarChart },
];

const ROTATING = ['Audits', 'Permits', 'Training', 'Inspections', 'Reporting'];
const UPCOMING = ['HIRA Review', 'HSSE Certification', 'JSA', 'TPI', 'Stop Call Wait', 'PPE Store'];

function go(onNavigate, id) {
  const item = NAV_ITEMS[id];
  if (!item) return;
  // Parent groups (e.g. EHS Audit, Permits) aren't pages; open their first child instead.
  const target = item.children ? item.children[0] : item;
  onNavigate(target.id, target);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const reduceMotion = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Adds `is-visible` to every [data-reveal] element inside the ref once it scrolls into view. */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll('[data-reveal]') || [];
    if (!('IntersectionObserver' in window) || reduceMotion()) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Counts from 0 to `to` once the element is on screen. */
function CountUp({ to, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(() => (reduceMotion() ? to : 0));
  useEffect(() => {
    if (reduceMotion()) return undefined;
    let raf;
    const run = () => {
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / 1200);
        setN(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Cycles through ROTATING, sliding each word up into place. */
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduceMotion()) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hx-rotator" aria-live="polite">
      <span key={ROTATING[i]} className="hx-rotator-word">{ROTATING[i]}</span>
    </span>
  );
}

export default function HomePage({ onNavigate }) {
  const rootRef = useReveal();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const titleWords = ['Welcome', 'to', 'SafeNexG'];

  return (
    <div className="page-enter hx" ref={rootRef}>
      {/* ---------- hero ---------- */}
      <section className="hx-hero">
        <span className="hx-orb hx-orb-a" aria-hidden="true" />
        <span className="hx-orb hx-orb-b" aria-hidden="true" />
        <span className="hx-grid-lines" aria-hidden="true" />

        <div className="hx-hero-copy">
          <p className="hx-eyebrow">
            <span className="hx-dot" /> {greeting()} · {today}
          </p>
          <h1 className="hx-title">
            {titleWords.map((w, idx) => (
              <span key={w} className={`hx-word${w === 'SafeNexG' ? ' hx-word-brand' : ''}`} style={{ '--i': idx }}>
                {w === 'SafeNexG' ? <>SafeNex<em>G</em></> : w}
              </span>
            ))}
          </h1>
          <p className="hx-tagline">
            Smarter <RotatingWord /> for a safer workplace.
          </p>
          <p className="hx-lead">
            One Environment, Health &amp; Safety platform for the whole plant: audits, training, incident and
            violation reporting, permits, change management, document control and fire safety, so safety
            teams, HODs and management work from the same live data.
          </p>
          <div className="hx-cta">
            <button type="button" className="hx-btn hx-btn-primary" onClick={() => go(onNavigate, 'my-tasks')}>
              <IconCheckSquare size={17} /> Open My Tasks
            </button>
            <button type="button" className="hx-btn hx-btn-ghost" onClick={() => go(onNavigate, 'atp-today')}>
              <IconCalendarCheck size={17} /> Today&apos;s Plan <IconArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="hx-hero-art" aria-hidden="true">
          <span className="hx-ring" />
          <span className="hx-ring hx-ring-2" />
          <img src={emblem} alt="" className="hx-emblem" />
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <div className="hx-stats">
        {STATS.map(({ value, suffix, label, icon: Icon, accent }, idx) => (
          <div key={label} className="hx-stat" data-reveal style={{ '--accent': accent, '--d': `${idx * 90}ms` }}>
            <span className="hx-stat-icon"><Icon size={20} /></span>
            <div className="hx-stat-text">
              <strong><CountUp to={value} suffix={suffix} /></strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- modules ---------- */}
      <div className="hx-section-head" data-reveal>
        <div>
          <p className="hx-kicker">Everything in one place</p>
          <h2>What&apos;s available</h2>
        </div>
        <p className="hx-section-sub">Pick a module to jump straight in. Every card opens the same page as the sidebar.</p>
      </div>

      <div className="hx-grid">
        {MODULES.map((m, idx) => {
          const Icon = m.icon;
          return (
            <article
              key={m.id}
              className="hx-card"
              data-reveal
              style={{ '--accent': m.accent, '--d': `${(idx % 3) * 90}ms` }}
            >
              <span className="hx-card-glow" aria-hidden="true" />
              <div className="hx-card-head">
                <span className="hx-card-icon"><Icon size={22} /></span>
                <h3>{m.title}</h3>
              </div>
              <p className="hx-card-summary">{m.summary}</p>
              <ul className="hx-card-list">
                {m.features.map((f) => (
                  <li key={f}><IconCheckCircle size={15} /> <span>{f}</span></li>
                ))}
              </ul>
              <div className="hx-card-actions">
                {m.links ? m.links.map((l) => (
                  <button key={l.id} type="button" className="hx-chip" onClick={() => go(onNavigate, l.id)}>
                    {l.label}
                  </button>
                )) : (
                  <button type="button" className="hx-open" onClick={() => go(onNavigate, m.id)}>
                    Open module <IconArrowRight size={15} />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ---------- how it works ---------- */}
      <section className="hx-flow" data-reveal>
        <div className="hx-section-head hx-section-head-tight">
          <div>
            <p className="hx-kicker">Workflow</p>
            <h2>How it works</h2>
          </div>
        </div>
        <ol className="hx-steps">
          {STEPS.map(({ title, text, icon: Icon }, idx) => (
            <li key={title} className="hx-step" style={{ '--d': `${200 + idx * 160}ms` }}>
              <span className="hx-step-badge"><Icon size={20} /><em>{idx + 1}</em></span>
              <h4>{title}</h4>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- coming soon ---------- */}
      <section className="hx-soon" data-reveal>
        <div>
          <p className="hx-kicker">On the roadmap</p>
          <h2>Coming soon</h2>
        </div>
        <div className="hx-soon-chips">
          {UPCOMING.map((u, idx) => (
            <span key={u} className="hx-soon-chip" style={{ '--d': `${idx * 120}ms` }}>
              <IconClock size={14} /> {u}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
