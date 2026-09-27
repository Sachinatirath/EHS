import Panel from '../../components/Panel';
import StatusPill from './StatusPill';
import { IconClipboard, IconUser } from '../../components/icons';
import { outcomeKind, formatDateTime } from './statusMeta';
import PhotoPreview from '../../components/PhotoPreview';

const valueStyle = { color: 'var(--slate-900)', fontWeight: 700 };

/* Read-only inspection markup shared by My Inspections (Area Incharge detail)
   and Records (OHC detail modal). */

export function InspectionInfoPanel({ inspection }) {
  const { box } = inspection;
  return (
    <Panel title="Inspection Detail" icon={<IconClipboard size={17} />}>
      <div className="split-row"><span>Box Number</span><span style={valueStyle}>{box.box_number}</span></div>
      <div className="split-row"><span>Department</span><span style={valueStyle}>{box.department}</span></div>
      <div className="split-row"><span>Area</span><span style={valueStyle}>{box.area}</span></div>
      <div className="split-row"><span>Location</span><span style={valueStyle}>{box.location}</span></div>
      <div className="split-row"><span>Inspector</span><span style={valueStyle}>{inspection.inspector.name}</span></div>
      <div className="split-row"><span>Date</span><span style={valueStyle}>{formatDateTime(inspection.created_at)}</span></div>
      <div className="split-row" style={{ marginBottom: 0 }}><span>Outcome</span><StatusPill kind={outcomeKind(inspection.outcome)} /></div>
    </Panel>
  );
}

export function RefillStatusPanel({ refillRequest }) {
  if (!refillRequest) return null;
  return (
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>Refill Request {refillRequest.request_code}</span>
        <StatusPill kind={refillRequest.status} />
      </div>
    </Panel>
  );
}

export function ChecklistPanel({ items }) {
  return (
    <Panel title="Checklist Items" icon={<IconClipboard size={17} />}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ padding: '10px 0', borderTop: idx === 0 ? 'none' : '1px solid var(--slate-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--slate-900)' }}>{item.item_name}</span>
            <StatusPill kind={item.status} />
          </div>
          {item.note ? <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginTop: 4 }}>{item.note}</div> : null}
          {item.photo_url ? <div style={{ marginTop: 6 }}><PhotoPreview src={item.photo_url} alt="Evidence" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} /></div> : null}
        </div>
      ))}
    </Panel>
  );
}

export function SignaturePanel({ signature }) {
  if (!signature) return null;
  return (
    <Panel title="Digital Signature" icon={<IconUser size={17} />}>
      <div style={{ border: '1px solid var(--slate-200)', borderRadius: 12, background: 'var(--slate-50)', padding: 8 }}>
        <img src={signature} alt="Inspector signature" style={{ display: 'block', height: 120, maxWidth: '100%', margin: '0 auto', objectFit: 'contain' }} />
      </div>
    </Panel>
  );
}
