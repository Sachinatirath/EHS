import { useCallback, useEffect, useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import { InspectionInfoPanel, RefillStatusPanel, ChecklistPanel, SignaturePanel } from './InspectionPanels';
import { IconCheckCircle, IconChevronLeft, IconClose, IconEye, IconRepeat, IconSearch } from '../../components/icons';
import { apiFetch, peekPendingTarget, clearPendingTarget } from './store';
import { outcomeKind, formatDate } from './statusMeta';
import PhotoPreview from '../../components/PhotoPreview';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const VIEW = 'fa-ai-inspections';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ok', label: 'OK' },
  { key: 'refill_requested', label: 'Refill Requested' },
  { key: 'closed_ok', label: 'Closed' },
];

/* ---------- Re-verification (mobile ReVerificationScreen) ---------- */

function ReVerification({ refillId, pushToast, onChanged }) {
  const [refill, setRefill] = useState(null);
  const [stage, setStage] = useState('review'); // review | rejecting | closed | rejected
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/refills/${refillId}`)
      .then((r) => { if (!cancelled) setRefill(r); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [refillId]);

  const decide = async (decision) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/refills/${refillId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason: decision === 'reject' ? reason || undefined : undefined }),
      });
      setStage(decision === 'accept' ? 'closed' : 'rejected');
      pushToast(decision === 'accept' ? 'Inspection closed successfully.' : 'Returned to OHC for refill.', 'success');
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!refill && !error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
        <Skeleton height={120} radius={14} />
        <Skeleton height={120} radius={14} />
      </div>
    );
  }

  if (stage === 'closed') {
    return (
      <div className="panel" style={{ background: 'var(--green-100)', borderColor: 'var(--green-600)' }}>
        <div className="panel-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-700)' }}>Inspection Closed Successfully</div>
          <div style={{ fontSize: 13.5, color: 'var(--slate-500)', marginTop: 4 }}>
            Box {refill?.inspection.box.box_number} has been refilled and verified.
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'rejected') {
    return (
      <div className="panel" style={{ background: 'var(--amber-100)', borderColor: 'var(--amber-600)' }}>
        <div className="panel-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--amber-600)' }}>Returned to OHC for Refill</div>
          <div style={{ fontSize: 13.5, color: 'var(--slate-500)', marginTop: 4 }}>
            The OHC team has been notified and will resubmit the refill.
          </div>
        </div>
      </div>
    );
  }

  const flaggedItems = refill?.inspection.items.filter((i) => i.status !== 'ok') ?? [];

  return (
    <Panel title={`Re-Verify Refill — ${refill?.request_code ?? ''}`} icon={<IconRepeat size={17} />}>
      <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--slate-500)' }}>
        Box {refill?.inspection.box.box_number} · Compare what was flagged against what OHC refilled.
      </p>

      {error ? <div style={{ color: 'var(--red-600)', fontSize: 13.5, marginBottom: 10 }}>{error}</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {flaggedItems.map((item) => {
          const detail = refill.refill_items.find((r) => r.inspection_item.id === item.id);
          return (
            <div key={item.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)', marginBottom: 10 }}>{item.item_name}</div>
              <div className="form-grid">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red-600)', marginBottom: 4 }}>BEFORE — {item.status.toUpperCase()}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{item.note || 'No note provided'}</div>
                  {item.photo_url ? <div style={{ marginTop: 6 }}><PhotoPreview src={item.photo_url} alt="Before" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} /></div> : null}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-600)', marginBottom: 4 }}>AFTER — OHC REFILL</div>
                  <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{detail?.replacement_note || 'No note provided'}</div>
                  {detail?.photo_url ? <div style={{ marginTop: 6 }}><PhotoPreview src={detail.photo_url} alt="After" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} /></div> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stage === 'rejecting' ? (
        <div style={{ marginTop: 16 }}>
          <div className="field">
            <label>Why are you rejecting this refill?</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Gloves still missing, wrong size supplied" />
          </div>
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-outline" disabled={submitting} onClick={() => setStage('review')}>Cancel</button>
            <button type="button" className="btn btn-ghost" disabled={submitting} onClick={() => decide('reject')}>
              {submitting ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      ) : (
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-ghost" disabled={submitting} onClick={() => setStage('rejecting')}>
            <IconClose size={12} /> Reject
          </button>
          <button type="button" className="btn btn-success" disabled={submitting} onClick={() => decide('accept')}>
            <IconCheckCircle size={14} /> {submitting ? 'Accepting…' : 'Accept'}
          </button>
        </div>
      )}
    </Panel>
  );
}

/* ---------- Inspection detail (mobile InspectionDetailScreen) ---------- */

function InspectionDetail({ inspectionId, onBack, pushToast, onChanged }) {
  const [inspection, setInspection] = useState(null);
  const [version, setVersion] = useState(0);
  // Once the verifier has appeared it stays mounted so its accepted/rejected
  // confirmation is visible even after the refetch moves the status on.
  const [showVerifier, setShowVerifier] = useState(false);

  const needsVerification = inspection?.refill_request?.status === 'awaiting_verification';
  useEffect(() => {
    if (needsVerification) setShowVerifier(true);
  }, [needsVerification]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/inspections/${inspectionId}`)
      .then((i) => { if (!cancelled) setInspection(i); })
      .catch((err) => pushToast(err.message, 'error'));
    return () => { cancelled = true; };
  }, [inspectionId, version, pushToast]);

  const handleChanged = () => {
    setVersion((v) => v + 1);
    onChanged();
  };

  if (!inspection) {
    return (
      <div>
        <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', marginBottom: 12 }} onClick={onBack}>
          <IconChevronLeft size={14} /> Back to inspections
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={170} radius={16} />
          <Skeleton height={240} radius={16} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', marginBottom: 12 }} onClick={onBack}>
        <IconChevronLeft size={14} /> Back to inspections
      </button>

      <InspectionInfoPanel inspection={inspection} />

      <RefillStatusPanel refillRequest={inspection.refill_request} />

      {showVerifier && inspection.refill_request ? (
        <ReVerification refillId={inspection.refill_request.id} pushToast={pushToast} onChanged={handleChanged} />
      ) : null}

      <ChecklistPanel items={inspection.items} />

      <SignaturePanel signature={inspection.signature_data} />
    </div>
  );
}

/* ---------- List ---------- */

export default function MyInspectionsPage({ pushToast }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  // A notification / dashboard row can hand off a specific record to open.
  const [target] = useState(() => peekPendingTarget(VIEW));
  const [selectedId, setSelectedId] = useState(() => target?.inspectionId ?? null);

  const load = useCallback(() => {
    return apiFetch('/inspections/mine')
      .then(setInspections)
      .catch((err) => pushToast(err.message, 'error'));
  }, [pushToast]);

  useEffect(() => {
    clearPendingTarget(VIEW);
    let cancelled = false;
    load().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load]);

  // Opened from a refill notification: resolve the refill to its inspection.
  useEffect(() => {
    if (!target?.refillId || target.inspectionId) return undefined;
    let cancelled = false;
    apiFetch(`/refills/${target.refillId}`)
      .then((r) => { if (!cancelled) setSelectedId(r.inspection.id); })
      .catch((err) => pushToast(err.message, 'error'));
    return () => { cancelled = true; };
  }, [target, pushToast]);

  const filtered = useMemo(() => inspections.filter((i) => {
    if (filter !== 'all' && i.outcome !== filter) return false;
    if (!inDateRange(i.created_at, from, to)) return false;
    if (search && !i.box.box_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [inspections, filter, search, from, to]);

  if (selectedId) {
    return (
      <div className="page-enter">
        <PageHeader title="My Inspections" subtitle="Inspection detail" />
        <InspectionDetail
          inspectionId={selectedId}
          onBack={() => setSelectedId(null)}
          pushToast={pushToast}
          onChanged={load}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader title="My Inspections" subtitle={loading ? ' ' : `${inspections.length} inspection${inspections.length === 1 ? '' : 's'} by you`} />

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <div className="field" style={{ marginBottom: 14 }}>
            <label><IconSearch size={13} /> Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by box number..." />
          </div>

          <ListFilters statusLabel="Outcome" statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo} disabled={loading} />

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Box</th><th>Date</th><th>Department</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <tr key={i}><td colSpan={5}><Skeleton height={18} /></td></tr>
                  ))
                ) : (
                  <>
                    {filtered.map((item) => (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(item.id)}>
                        <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.box.box_number}</td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>{item.box.department}</td>
                        <td><StatusPill kind={outcomeKind(item.outcome)} /></td>
                        <td>
                          <button
                            type="button"
                            className={`btn ${item.refill_request?.status === 'awaiting_verification' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '5px 12px' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                          >
                            <IconEye size={14} /> {item.refill_request?.status === 'awaiting_verification' ? 'View & Review' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>
                          {inspections.length === 0 ? 'Inspections you complete will show up here.' : 'No inspections found. Try a different filter or search term.'}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
