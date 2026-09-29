import { useEffect, useState } from 'react';

// Every screen shows a skeleton of its layout for this long when it opens.
export const PAGE_LOAD_MS = 1000;

function Bone({ w = '100%', h = 14, r = 8, style }) {
  return <span className="sk-bone" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

function StatRow() {
  return (
    <div className="stat-grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="sk-card sk-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Bone w={70} h={30} r={8} />
            <Bone w={40} h={40} r={12} />
          </div>
          <Bone w="55%" h={12} />
        </div>
      ))}
    </div>
  );
}

function TableCard({ rows = 6 }) {
  return (
    <div className="sk-card">
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <Bone w={220} h={40} r={12} />
        <Bone w={160} h={40} r={12} />
        <Bone w={150} h={40} r={12} />
      </div>
      <Bone h={38} r={10} style={{ marginBottom: 10 }} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="sk-row">
          <Bone w="14%" h={13} />
          <Bone w="12%" h={13} />
          <Bone w="22%" h={13} />
          <Bone w="16%" h={13} />
          <Bone w={78} h={22} r={999} />
          <Bone w={64} h={28} r={10} />
        </div>
      ))}
    </div>
  );
}

function FormCard({ fields = 4 }) {
  return (
    <div className="sk-card">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22 }}>
        <Bone w={30} h={30} r={8} />
        <Bone w={180} h={16} />
      </div>
      <div className="form-grid">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Bone w="40%" h={12} />
            <Bone h={42} r={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder for a screen while it "loads": dashboard, list or form layout. */
export function PageSkeleton({ variant = 'table' }) {
  return (
    <div className="sk-page" aria-busy="true" aria-label="Loading">
      <div className="sk-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bone w={280} h={26} r={10} />
          <Bone w={180} h={12} />
        </div>
        <Bone w={130} h={40} r={12} />
      </div>
      {variant === 'form' ? (
        <>
          <FormCard fields={4} />
          <FormCard fields={2} />
        </>
      ) : (
        <>
          <StatRow />
          {variant === 'dashboard' ? (
            <div className="two-col" style={{ marginBottom: 22 }}>
              <div className="sk-card"><Bone h={200} r={12} /></div>
              <div className="sk-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Bone w={170} h={170} r={999} /></div>
            </div>
          ) : null}
          <TableCard rows={variant === 'dashboard' ? 4 : 6} />
        </>
      )}
    </div>
  );
}

/** Pick a skeleton layout from a view id. */
export function skeletonVariant(viewId = '') {
  if (/(^|-)(home|dashboard|welcome)$/.test(viewId) || viewId.endsWith('-dashboard')) return 'dashboard';
  if (/(create|new|inspect$|submit|profile|gw-log|permits-(general|height|hotwork|confined|loto|excavation)|ehs-(powertools|outside|substation|boiler|battery|canteen)|atp-plan)/.test(viewId)) return 'form';
  return 'table';
}

/**
 * Shows the skeleton (and a top loading bar) for PAGE_LOAD_MS every time
 * `viewKey` changes, then fades the real screen in.
 */
export default function PageLoader({ viewKey, variant, children }) {
  const [readyKey, setReadyKey] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setReadyKey(viewKey), PAGE_LOAD_MS);
    return () => clearTimeout(t);
  }, [viewKey]);

  const loading = readyKey !== viewKey;
  return (
    <>
      <div className={`page-progress${loading ? ' active' : ''}`} key={`bar-${viewKey}`} aria-hidden="true" />
      {loading ? <PageSkeleton variant={variant} /> : <div className="page-reveal">{children}</div>}
    </>
  );
}
