import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import { InspectionInfoPanel, RefillStatusPanel, ChecklistPanel, SignaturePanel } from './InspectionPanels';
import { IconEye, IconSearch } from '../../components/icons';
import { apiFetch, setPendingTarget } from './store';
import { outcomeKind, formatDate } from './statusMeta';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const OUTCOME_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'ok', label: 'OK' },
  { key: 'refill_requested', label: 'Refill Requested' },
  { key: 'closed_ok', label: 'Closed' },
];

const MODES = ['table', 'timeline'];

// Read-only detail for any record (with or without a refill request).
function RecordDetailModal({ id, onClose, onOpenRefill, pushToast }) {
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/inspections/${id}`)
      .then((i) => { if (!cancelled) setInspection(i); })
      .catch((err) => { pushToast(err.message, 'error'); onClose(); });
    return () => { cancelled = true; };
  }, [id, onClose, pushToast]);

  return (
    <Modal open title={inspection ? `Inspection #${inspection.id} · Box ${inspection.box.box_number}` : 'Inspection Detail'} onClose={onClose} width={720}>
      {!inspection ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Skeleton height={150} radius={16} />
          <Skeleton height={200} radius={16} />
        </div>
      ) : (
        <div>
          <InspectionInfoPanel inspection={inspection} />
          <RefillStatusPanel refillRequest={inspection.refill_request} />
          <ChecklistPanel items={inspection.items} />
          <SignaturePanel signature={inspection.signature_data} />
          <div className="btn-row" style={{ marginTop: 4 }}>
            {inspection.refill_request ? (
              <button type="button" className="btn btn-outline" onClick={() => onOpenRefill(inspection.refill_request.id)}>Open Refill Request</button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function RecordsPage({ onNavigate, pushToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('table');
  const [outcome, setOutcome] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/inspections')
      .then((list) => { if (!cancelled) setRecords(list); })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => (
      (outcome === 'all' || r.outcome === outcome)
      && inDateRange(r.created_at, from, to)
      && (!q
        || r.box.box_number.toLowerCase().includes(q)
        || r.box.department.toLowerCase().includes(q)
        || r.inspector.name.toLowerCase().includes(q))
    ));
  }, [records, query, outcome, from, to]);

  const closeDetail = useCallback(() => setSelectedId(null), []);

  const openRefill = (refillId) => {
    setPendingTarget('fa-ohc-refills', { refillId });
    onNavigate('fa-ohc-refills');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Records" subtitle="Every inspection across all boxes and departments" />

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters
            statusLabel="Outcome"
            statusOptions={OUTCOME_OPTIONS}
            status={outcome}
            onStatus={setOutcome}
            from={from}
            to={to}
            onFrom={setFrom}
            onTo={setTo}
          >
            <div className="field" style={{ width: 210 }}>
              <label><IconSearch size={13} /> Search</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search box, department or inspector" />
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label>View as</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ textTransform: 'capitalize' }}>
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </ListFilters>

          {mode === 'table' ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Inspection</th><th>Date</th><th>Box</th><th>Department</th><th>Inspector</th><th>Outcome</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    [0, 1, 2, 3].map((i) => (
                      <tr key={i}><td colSpan={7}><Skeleton height={18} /></td></tr>
                    ))
                  ) : (
                    <>
                      {filtered.map((item) => (
                        <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(item.id)}>
                          <td style={{ color: 'var(--slate-400)' }}>#{item.id}</td>
                          <td>{formatDate(item.created_at)}</td>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.box.box_number}</td>
                          <td>{item.box.department}</td>
                          <td>{item.inspector.name}</td>
                          <td><StatusPill kind={outcomeKind(item.outcome)} /></td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '5px 12px' }}
                              onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                            >
                              <IconEye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filtered.length && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No records found. Try a different search.</td></tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[0, 1, 2].map((i) => <Skeleton key={i} height={52} radius={12} />)}
            </div>
          ) : (
            <div>
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', gap: 14, cursor: 'pointer' }}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--blue-600)', marginTop: 5 }} />
                    {idx < filtered.length - 1 ? <span style={{ flex: 1, width: 2, background: 'var(--slate-200)', marginTop: 4 }} /> : null}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 20 }}>
                    <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 2 }}>{formatDate(item.created_at)}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{item.box.box_number}</span>
                      <StatusPill kind={outcomeKind(item.outcome)} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginTop: 2 }}>
                      {item.box.department} · inspected by {item.inspector.name}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '5px 12px', marginTop: 8 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                    >
                      <IconEye size={14} /> View
                    </button>
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <p style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)', margin: 0 }}>No records found. Try a different search.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedId ? <RecordDetailModal id={selectedId} onClose={closeDetail} onOpenRefill={openRefill} pushToast={pushToast} /> : null}
    </div>
  );
}
