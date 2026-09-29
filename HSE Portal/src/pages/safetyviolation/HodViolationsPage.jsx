import { useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import { PhotoButton } from '../../components/PhotoPreview';
import { IconCheckCircle, IconEye } from '../../components/icons';
import { apiFetch } from './store';
import ViolationDetail from './ViolationDetail';
import { STATUS_META, formatDate } from './statusMeta';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_review', label: 'Reassigned' },
  { key: 'closed', label: 'Closed' },
  { key: 'rejected', label: 'Rejected' },
];

export default function HodViolationsPage({ pushToast }) {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('sv-hod-violations', violations.map((x) => x.id), (id) => openDetail({ id }));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch('/violations')
      .then(setViolations)
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [pushToast]);

  const q = query.trim().toLowerCase();
  const rows = violations.filter((v) => (
    (filter === 'all' || v.status === filter)
    && inDateRange(v.created_at, from, to)
    && (!q || (v.employee_code || '').toLowerCase().includes(q) || (v.employee_name || '').toLowerCase().includes(q))
  ));

  const openDetail = async (violation) => {
    try {
      setSelected(await apiFetch(`/violations/${violation.id}`));
      setNote('');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const decide = async (status) => {
    setSaving(true);
    try {
      const updated = await apiFetch(`/violations/${selected.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, resolution_note: note || undefined }),
      });
      setViolations((list) => list.map((v) => (v.id === updated.id ? { ...v, status: updated.status } : v)));
      pushToast(
        status === 'under_review'
          ? `${updated.violation_no} reviewed and reassigned to ${updated.agent.name} to close.`
          : `${updated.violation_no} rejected.`,
        'success',
      );
      setSelected(null);
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title="All Violations" subtitle={`${violations.length} notices across all agents`} />

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo}>
            <div className="field" style={{ width: 210 }}>
              <label>Search employee</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Employee ID or name" />
            </div>
          </ListFilters>

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Violation No</th><th>Emp ID</th><th>Date</th><th>Type</th><th>Observation</th><th>Department</th><th>Status</th><th>Evidence Image</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={9}><Skeleton height={18} /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {rows.map((v) => {
                      const meta = STATUS_META[v.status];
                      return (
                        <tr key={v.id} {...focus.rowProps(v.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(v)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{v.violation_no}</td>
                          <td>{v.employee_code || '—'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(v.created_at)}</td>
                          <td>{v.violation_type}</td>
                          <td style={{ maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.description || ''}>{v.description || '—'}</td>
                          <td>{v.department}</td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td><PhotoButton src={v.photo_url} alt={`${v.violation_no} evidence`} /></td>
                          <td>
                            <button
                              type="button"
                              className={`btn ${v.status === 'open' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '5px 12px' }}
                              onClick={(e) => { e.stopPropagation(); openDetail(v); }}
                            >
                              <IconEye size={14} /> {v.status === 'open' ? 'View & Review' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!rows.length && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>Nothing here.</td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={!!selected} title={selected?.violation_no} onClose={() => setSelected(null)} width={600}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ViolationDetail violation={selected} />
            {selected.status === 'open' ? (
              <>
                <div className="field">
                  <label>HOD Review Remarks</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instructions for the agent to act on before closing…" />
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving} onClick={() => decide('under_review')}>
                    <IconCheckCircle size={14} /> Submit & Reassign to Agent
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
