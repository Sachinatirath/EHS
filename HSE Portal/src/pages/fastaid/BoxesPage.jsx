import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import { IconEye, IconFirstAid, IconPlus, IconSearch } from '../../components/icons';
import { apiFetch } from './store';
import { outcomeKind, formatDate } from './statusMeta';

// Same fields/placeholders as the mobile AddBoxModal.
const FIELDS = [
  { key: 'box_number', label: 'Box Number', placeholder: 'e.g. FAB-401' },
  { key: 'department', label: 'Department', placeholder: 'e.g. Assembly Line 2' },
  { key: 'area', label: 'Area', placeholder: 'e.g. Zone F' },
  { key: 'location', label: 'Location', placeholder: 'e.g. Near Emergency Exit' },
];

const EMPTY = { box_number: '', department: '', area: '', location: '' };

function AddBoxModal({ open, onClose, onCreated }) {
  const [values, setValues] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const ready = FIELDS.every((f) => values[f.key].trim().length > 0);

  const handleClose = () => {
    if (submitting) return;
    setValues(EMPTY);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiFetch('/boxes', {
        method: 'POST',
        body: JSON.stringify({
          box_number: values.box_number.trim(),
          department: values.department.trim(),
          area: values.area.trim(),
          location: values.location.trim(),
        }),
      });
      onCreated(created);
      setValues(EMPTY);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not add box. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Add First Aid Box" onClose={handleClose} width={440}>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'var(--slate-500)' }}>
        Register a new box for inspection and monitoring
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            <input
              value={values[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: f.key === 'box_number' ? e.target.value.toUpperCase() : e.target.value }))}
            />
          </div>
        ))}
      </div>
      {error ? <div style={{ fontSize: 12.5, color: 'var(--red-600)', marginTop: 12 }}>{error}</div> : null}
      <div className="btn-row" style={{ marginTop: 18 }}>
        <button type="button" className="btn btn-outline" disabled={submitting} onClick={handleClose}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={!ready || submitting} onClick={handleSubmit}>
          <IconPlus size={14} /> {submitting ? 'Adding…' : 'Add Box'}
        </button>
      </div>
    </Modal>
  );
}

const valueStyle = { color: 'var(--slate-900)', fontWeight: 700 };

// Box details + inspection history (latest first).
function BoxDetailModal({ box, onClose, pushToast }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/boxes/${box.id}/inspections`)
      .then((list) => { if (!cancelled) setHistory(list); })
      .catch((err) => { pushToast(err.message, 'error'); if (!cancelled) setHistory([]); });
    return () => { cancelled = true; };
  }, [box.id, pushToast]);

  const latest = history?.[0] ?? null;

  return (
    <Modal open title={`Box ${box.box_number}`} onClose={onClose} width={640}>
      <div className="split-row"><span>Box Number</span><span style={valueStyle}>{box.box_number}</span></div>
      <div className="split-row"><span>Department</span><span style={valueStyle}>{box.department}</span></div>
      <div className="split-row"><span>Area</span><span style={valueStyle}>{box.area}</span></div>
      <div className="split-row"><span>Location</span><span style={valueStyle}>{box.location}</span></div>
      <div className="split-row">
        <span>Status</span>
        {!history ? <Skeleton width={90} height={18} /> : latest ? <StatusPill kind={outcomeKind(latest.outcome)} /> : <span style={{ color: 'var(--slate-500)' }}>Not yet inspected</span>}
      </div>

      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '18px 0 10px', color: 'var(--slate-900)' }}>Inspection History</h4>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Inspector</th><th>Date</th><th>Outcome</th></tr>
          </thead>
          <tbody>
            {!history ? (
              [0, 1].map((i) => <tr key={i}><td colSpan={3}><Skeleton height={18} /></td></tr>)
            ) : history.length ? history.map((h) => (
              <tr key={h.id}>
                <td>{h.inspector.name}</td>
                <td>{formatDate(h.created_at)}</td>
                <td><StatusPill kind={outcomeKind(h.outcome)} /></td>
              </tr>
            )) : (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: 'var(--slate-500)' }}>No inspections recorded for this box yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default function BoxesPage({ pushToast }) {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewBox, setViewBox] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/boxes')
      .then((list) => { if (!cancelled) setBoxes(list); })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const closeView = useCallback(() => setViewBox(null), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boxes;
    return boxes.filter((b) => (
      b.box_number.toLowerCase().includes(q)
      || b.department.toLowerCase().includes(q)
      || b.area.toLowerCase().includes(q)
    ));
  }, [boxes, query]);

  const handleCreated = (box) => {
    setBoxes((list) => [box, ...list]);
    pushToast(`Box ${box.box_number} added.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="First Aid Boxes"
        subtitle={loading ? 'Loading…' : `${boxes.length} box${boxes.length === 1 ? '' : 'es'} under monitoring`}
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Add
          </button>
        )}
      />

      <div className="field" style={{ marginBottom: 16 }}>
        <label><IconSearch size={13} /> Search</label>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search box number, department or area" />
      </div>

      {loading ? (
        <div className="two-col">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={72} radius={16} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body" style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>
            <div style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: 4 }}>No boxes found</div>
            <div style={{ fontSize: 13 }}>Try a different search, or add a new box.</div>
          </div>
        </div>
      ) : (
        <div className="two-col">
          {filtered.map((box) => (
            <div key={box.id} className="panel" style={{ margin: 0, cursor: 'pointer' }} onClick={() => setViewBox(box)}>
              <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconFirstAid size={19} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{box.box_number}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{box.department} · {box.area}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 1 }}>{box.location}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '5px 12px', flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); setViewBox(box); }}
                >
                  <IconEye size={14} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewBox ? <BoxDetailModal box={viewBox} onClose={closeView} pushToast={pushToast} /> : null}
      <AddBoxModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
