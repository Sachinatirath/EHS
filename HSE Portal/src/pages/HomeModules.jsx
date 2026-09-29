import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconArrowRight, IconCheckCircle, IconChevronLeft, IconGrid, IconLayers } from '../components/icons';

const AUTOPLAY_MS = 4000;

// Each module gets its own card gradient: [deep shade, bright shade].
const CARD_THEMES = {
  'ehs-audit': ['#0b2a66', '#2d62b8'],
  training: ['#2e1065', '#7c3aed'],
  'atp-today': ['#0c4a6e', '#0891b2'],
  'safety-violation': ['#7f1d1d', '#dc2626'],
  'safety-observation': ['#78350f', '#d97706'],
  'gemba-walk': ['#134e4a', '#0d9488'],
  'incident-report': ['#7c2d12', '#ea580c'],
  'fast-aid': ['#14532d', '#16a34a'],
  permits: ['#1e3a8a', '#0ea5e9'],
  moc: ['#831843', '#db2777'],
  'doc-review': ['#1e1b4b', '#4f46e5'],
  'fire-extinguishers': ['#881337', '#f43f5e'],
};
const DEFAULT_THEME = ['#0b2a66', '#2d62b8'];

const themeVars = (id) => {
  const [c1, c2] = CARD_THEMES[id] || DEFAULT_THEME;
  return { '--c1': c1, '--c2': c2 };
};

const reduceMotion = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const IconChevronRight = ({ size = 18 }) => <IconChevronLeft size={size} style={{ transform: 'rotate(180deg)' }} />;

/** Artwork side of a carousel card: module icon in a halo with its top features as floating glass chips. */
function CardArt({ module }) {
  const Icon = module.icon;
  return (
    <div className="hc-art">
      <span className="hc-art-ring hc-art-ring-1" />
      <span className="hc-art-ring hc-art-ring-2" />
      <span className="hc-art-icon"><Icon size={46} /></span>
      <div className="hc-art-chips">
        {module.features.slice(0, 2).map((f) => (
          <span key={f} className="hc-art-chip">
            <IconCheckCircle size={15} /> <span>{f}</span>
          </span>
        ))}
      </div>
      <span className="hc-art-name">{module.title}</span>
    </div>
  );
}

/**
 * Endless centre-focus carousel. The list is rendered three times and the view is kept in
 * the middle copy (silently re-centred after each scroll settles), so there are always
 * cards on both sides. Auto-advances every AUTOPLAY_MS and pauses on hover / touch / focus.
 */
const IconPause = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" />
  </svg>
);
const IconPlay = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);

const pad2 = (v) => String(v).padStart(2, '0');

/**
 * Details for every module, stacked in one grid cell. Only the current one is shown; switching
 * cross-fades old -> new at the same time, and the panel height never changes (tallest wins).
 */
function ModulePanels({ modules, current, onOpen }) {
  return (
    <div className="hc-panel">
      {modules.map((m, index) => {
        const Icon = m.icon;
        const on = index === current;
        return (
          <div key={m.id} className={`hc-slide${on ? ' is-current' : ''}`} style={themeVars(m.id)} aria-hidden={!on}>
            <div className="hc-panel-main">
              <p className="hc-panel-kicker">Module {pad2(index + 1)} <span>/ {pad2(modules.length)}</span></p>
              <div className="hc-panel-title">
                <span className="hc-panel-icon"><Icon size={22} /></span>
                <h3>{m.title}</h3>
              </div>
              <p className="hc-panel-summary">{m.summary}</p>
              <ul className="hc-panel-features">
                {m.features.map((f) => (
                  <li key={f}><IconCheckCircle size={16} /> <span>{f}</span></li>
                ))}
              </ul>
            </div>
            <div className="hc-panel-side">
              <button type="button" className="hc-primary" onClick={() => onOpen(m.id)} tabIndex={on ? 0 : -1}>
                <span>Open {m.title}</span> <IconArrowRight size={18} />
              </button>
              {m.links ? (
                <>
                  <p className="hc-side-label">Jump to</p>
                  <div className="hc-links">
                    {m.links.map((l) => (
                      <button key={l.id} type="button" className="hc-link" onClick={() => onOpen(l.id)} tabIndex={on ? 0 : -1}>
                        <span>{l.label}</span> <IconArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="hc-side-note">Dashboards, forms, approvals and alerts for {m.title.toLowerCase()} are all inside this module.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ModuleCarousel({ modules, onOpen }) {
  const n = modules.length;
  const slides = [...modules, ...modules, ...modules];
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(n); // first card of the middle copy
  const k = active % n; // module index of the active slide
  // Slide we silently jumped to (same module, other copy): it skips its intro animation.
  const [quiet, setQuiet] = useState(-1);
  useEffect(() => { if (quiet !== -1 && active !== quiet) setQuiet(-1); }, [active, quiet]);
  const activeRef = useRef(n);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const resumeTimer = useRef(null);
  const rootRef = useRef(null);
  // Staged entrance state lives in React (not a DOM class), so re-renders such as pausing
  // on hover can never wipe it and leave the carousel blank.
  const [staged, setStaged] = useState(() => reduceMotion());

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduceMotion() || !('IntersectionObserver' in window)) { setStaged(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      const fillsView = e.rootBounds && e.intersectionRect.height >= e.rootBounds.height * 0.4;
      if (e.intersectionRatio >= 0.3 || fillsView) setStaged(true);
      else if (!e.isIntersecting) setStaged(false);
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Card entrance animations run only in this window, never on later card changes.
  const [entering, setEntering] = useState(false);
  useEffect(() => {
    if (!staged || reduceMotion()) return undefined;
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 1400);
    return () => clearTimeout(t);
  }, [staged]);

  const scrollToIndex = useCallback((i, smooth = true) => {
    const track = trackRef.current;
    const card = cardRefs.current[i];
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: smooth && !reduceMotion() ? 'smooth' : 'auto',
    });
  }, []);

  // Start centred on the middle copy before the first paint.
  useLayoutEffect(() => { scrollToIndex(n, false); }, [n, scrollToIndex]);

  // Track the card nearest the centre; once scrolling settles, jump back into the middle copy.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let raf = 0;
    let settle = 0;
    const nearest = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = activeRef.current;
      let bestDist = Infinity;
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = nearest();
        activeRef.current = i;
        setActive(i);
      });
      clearTimeout(settle);
      settle = setTimeout(() => {
        const i = nearest();
        if (i < n || i >= 2 * n) {
          const j = n + (i % n);
          // Same card in the middle copy: swap instantly with transitions off so nothing flickers.
          track.classList.add('is-jumping');
          activeRef.current = j;
          setQuiet(j);
          setActive(j);
          scrollToIndex(j, false);
          requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('is-jumping')));
        }
      }, 160);
    };
    const onResize = () => scrollToIndex(activeRef.current, false);
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [n, scrollToIndex]);

  // Autoplay: restart whenever the module changes or the pause state flips.
  useEffect(() => {
    if (paused || stopped || reduceMotion()) return undefined;
    const id = setTimeout(() => {
      if (!document.hidden) scrollToIndex(activeRef.current + 1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [k, paused, stopped, scrollToIndex]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const pause = () => { clearTimeout(resumeTimer.current); setPaused(true); };
  const resumeSoon = (ms = 2500) => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), ms);
  };

  const step = (delta) => scrollToIndex(activeRef.current + delta);
  const goTo = (k) => scrollToIndex(n + k); // k = module index

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'Enter' && e.target === trackRef.current) onOpen(modules[active % n].id);
  };

  const current = modules[k];

  return (
    <div
      ref={rootRef}
      className={`hc${staged ? ' is-staged' : ''}${entering ? ' is-entering' : ''}${paused || stopped ? ' is-paused' : ''}`}
      style={themeVars(current.id)}
      onMouseEnter={pause}
      onMouseLeave={() => resumeSoon(800)}
      onTouchStart={pause}
      onTouchEnd={() => resumeSoon(4000)}
    >
      <div className="hc-stage">
        <span className="hc-badge" aria-hidden="true">
          <span key={current.id} className="hc-badge-icon"><current.icon size={26} /></span>
        </span>

        <div
          ref={trackRef}
          className="hc-track"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="SafeNexG modules"
          onKeyDown={onKeyDown}
          onFocus={pause}
          onBlur={() => resumeSoon(1500)}
        >
          {slides.map((m, i) => (
            <div
              key={`${Math.floor(i / n)}-${m.id}`}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`hc-card${i === active ? ' active' : ''}${Math.abs(i - active) === 1 ? ' near' : ''}${i === active - 1 ? ' is-prev' : ''}${i === active + 1 ? ' is-next' : ''}${i === quiet ? ' quiet' : ''}`}
              style={themeVars(m.id)}
              role="group"
              aria-roledescription="slide"
              aria-hidden={i < n || i >= 2 * n ? true : undefined}
              aria-label={`${(i % n) + 1} of ${n}: ${m.title}`}
              onClick={() => (i === active ? onOpen(m.id) : scrollToIndex(i))}
            >
              <CardArt module={m} />
            </div>
          ))}
        </div>
      </div>

      <div className="hc-panel-wrap" aria-live="polite">
        <ModulePanels modules={modules} current={k} onOpen={onOpen} />
      </div>

      <div className="hc-controls">
        <button type="button" className="hc-ctrl" aria-label="Previous module" onClick={() => step(-1)}>
          <IconChevronLeft size={18} />
        </button>
        <div className="hc-dots" role="tablist" aria-label="Choose module">
          {modules.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === k}
              aria-label={m.title}
              className={`hc-dot${i === k ? ' active' : ''}`}
              onClick={() => goTo(i)}
            >
              {i === k ? <span key={k} className="hc-dot-fill" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} /> : null}
            </button>
          ))}
        </div>
        <button type="button" className="hc-ctrl" aria-label="Next module" onClick={() => step(1)}>
          <IconChevronRight size={18} />
        </button>
        <span className="hc-counter">{pad2(k + 1)} / {pad2(n)}</span>
        <button
          type="button"
          className={`hc-play${stopped ? ' stopped' : ''}`}
          onClick={() => setStopped((v) => !v)}
          aria-label={stopped ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          {stopped ? <IconPlay size={14} /> : <IconPause size={14} />}
          <span>{stopped ? 'Play' : 'Pause'}</span>
        </button>
      </div>
    </div>
  );
}

/** "Featured" / "View all" toggle shown in the section header. */
export function ViewToggle({ mode, onChange }) {
  return (
    <div className="hv-toggle" role="group" aria-label="Module view">
      <button type="button" className={mode === 'carousel' ? 'active' : ''} onClick={() => onChange('carousel')}>
        <IconLayers size={15} /> Featured
      </button>
      <button type="button" className={mode === 'grid' ? 'active' : ''} onClick={() => onChange('grid')}>
        <IconGrid size={15} /> View all
      </button>
    </div>
  );
}

export { themeVars };
