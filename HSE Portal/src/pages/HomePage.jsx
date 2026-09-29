import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PORTAL_NAV } from '../data/navConfig';
import emblem from '../assets/brand/emblem.png';
import { ModuleCarousel, ViewToggle, themeVars } from './HomeModules';
import HomeToday from './HomeToday';
import {
  IconClipboard, IconCap, IconCalendarCheck, IconAlertTriangle, IconEye,
  IconFlag, IconFirstAid, IconFileText, IconRepeat, IconFlame, IconBookOpen, IconArrowRight,
  IconCheckCircle, IconClock, IconCheckSquare, IconBarChart, IconUsers,
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
    summary: 'Complete fire-equipment lifecycle management.',
    features: [
      'Fire asset register and equipment audits',
      'AMC / service, fire pump audits and hydro tests',
      'Expiry & compliance alerts and HOD reports',
    ],
  },
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

/**
 * Toggles `is-visible` on every [data-reveal] element inside the ref as it enters / leaves the
 * viewport, so the entrance animations replay each time a section is scrolled back into view.
 */
function useReveal(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const nodes = root?.querySelectorAll('[data-reveal], [data-card]') || [];
    if (!('IntersectionObserver' in window) || reduceMotion()) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        e.target.classList.toggle('is-visible', e.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Writes the page scroll (px) and progress (0–1) into CSS vars for the parallax hero and progress bar. */
function useScrollVars(ref, barRef, cueRef) {
  useEffect(() => {
    if (reduceMotion()) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty('--sy', String(Math.round(window.scrollY)));
      barRef.current?.style.setProperty('--sp', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      // "Scroll to explore" only while at the top of a page that has more below.
      cueRef.current?.classList.toggle('show', window.scrollY < 60 && max > 160);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, barRef, cueRef]);
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

export default function HomePage({ onNavigate, onOpenTask }) {
  const [view, setView] = useState('carousel');
  // Re-scan when the module view changes, so the grid cards get their scroll entrance too.
  const rootRef = useReveal([view]);
  const barRef = useRef(null);
  const cueRef = useRef(null);
  const modulesRef = useRef(null);
  useScrollVars(rootRef, barRef, cueRef);

  // Hover spotlight: the glow follows the pointer across a grid card.
  const spotlight = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const scrollToModules = () => {
    const el = modulesRef.current;
    if (!el) return;
    const header = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 64;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - 16, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  const renderActions = (m) => (m.links ? m.links.map((l) => (
    <button key={l.id} type="button" className="hx-chip" onClick={(e) => { e.stopPropagation(); go(onNavigate, l.id); }}>
      {l.label}
    </button>
  )) : (
    <button type="button" className="hx-open" onClick={(e) => { e.stopPropagation(); go(onNavigate, m.id); }}>
      Open module <IconArrowRight size={15} />
    </button>
  ));
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const titleWords = ['Welcome', 'to', 'SafeNexG'];

  return (
    <div className="page-enter hx" ref={rootRef}>
      {/* Portalled to <body>: the page wrapper's entrance transform would break position: fixed. */}
      {createPortal(<div ref={barRef} className="hx-progress" aria-hidden="true" />, document.body)}
      {createPortal(
        <button ref={cueRef} type="button" className="hx-cue" onClick={scrollToModules}>
          <span>Scroll to explore</span>
          <span className="hx-cue-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </button>,
        document.body,
      )}
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

      {/* ---------- your day: live task overview ---------- */}
      <HomeToday onOpenTask={onOpenTask} onViewAll={() => go(onNavigate, 'my-tasks')} />

      {/* ---------- modules: featured carousel / full grid ---------- */}
      <section className="hx-block" data-reveal ref={modulesRef}>
        <div className="hx-section-head">
          <div>
            <p className="hx-kicker">Everything in one place</p>
            <h2>Explore modules</h2>
          </div>
          <ViewToggle mode={view} onChange={setView} />
        </div>

        {view === 'carousel' ? (
          <ModuleCarousel modules={MODULES} onOpen={(id) => go(onNavigate, id)} />
        ) : (
          <div className="hx-grid">
            {MODULES.map((m, idx) => {
              const Icon = m.icon;
              return (
                <article
                  key={m.id}
                  className="hx-card"
                  data-card
                  style={{ ...themeVars(m.id), '--accent': 'var(--c2)', '--d': `${(idx % 3) * 110}ms` }}
                  onMouseMove={spotlight}
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
                  <div className="hx-card-actions">{renderActions(m)}</div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- how it works ---------- */}
      <section className="hx-flow" data-reveal="left">
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
      <section className="hx-soon" data-reveal="right">
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
