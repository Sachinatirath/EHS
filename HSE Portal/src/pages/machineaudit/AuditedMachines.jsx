import { useState } from 'react';
import Modal from '../../components/Modal';
import Skeleton from '../safetyviolation/Skeleton';
import { IconEye } from '../../components/icons';
import { INCHARGE_ROLES, MACHINE_DEPARTMENTS, signoffCount, summarizeMachines } from './store';
import { LastInspection, AuditHistoryTable } from './MachineHistory';
import { STATUS_META, formatDate } from './statusMeta';

/**
 * Every audited machine (one row each, from its latest audit) with search,
 * an optional department filter, and a history modal per machine.
 */
export default function AuditedMachines({ audits, loading, showDepartmentFilter = true }) {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [selected, setSelected] = useState(null);

  const q = query.trim().toLowerCase();
  const machines = summarizeMachines(audits).filter((m) => (
    (dept === 'all' || m.department === dept)
    && (!q || [m.machine_name, m.machine_id, m.location].some((f) => (f || '').toLowerCase().includes(q)))
  ));

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
        <div className="field" style={{ width: 240 }}>
          <label>Search machine</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, ID or location" />
        </div>
        {showDepartmentFilter ? (
          <div className="field" style={{ width: 200 }}>
            <label>Department</label>
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="all">All departments</option>
              {MACHINE_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        ) : null}
      </div>

      <div className="table-wrap">
        <table className="data-table compact">
          <thead>
            <tr>
              <th>Machine ID</th><th>Last Audited</th><th>Machine</th><th>Department</th><th>Location</th>
              <th>Audits</th><th>Last Non-compliance</th><th>In-charges Done</th><th>Last Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [0, 1, 2].map((i) => <tr key={i}><td colSpan={10}><Skeleton height={18} /></td></tr>)
            ) : (
              <>
                {machines.map((m) => {
                  const meta = STATUS_META[m.last.status];
                  return (
                    <tr key={m.key} style={{ cursor: 'pointer' }} onClick={() => setSelected(m)}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{m.machine_id || '—'}</td>
                      <td>{formatDate(m.last.created_at)}</td>
                      <td>{m.machine_name}</td>
                      <td>{m.department}</td>
                      <td>{m.location || '—'}</td>
                      <td>
                        {m.total}
                        {m.open ? <span className="pill pill-amber" style={{ marginLeft: 6 }}>{m.open} open</span> : null}
                      </td>
                      <td>{m.nonCompliance ? <span className="pill pill-red">{m.nonCompliance} No</span> : <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>All OK</span>}</td>
                      <td>{signoffCount(m.last)} / {INCHARGE_ROLES.length}</td>
                      <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '5px 12px' }}
                          onClick={(e) => { e.stopPropagation(); setSelected(m); }}
                        >
                          <IconEye size={14} /> History
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!machines.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No audited machines found.</td></tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!selected}
        title={selected ? `${selected.machine_name}${selected.machine_id ? ` · ${selected.machine_id}` : ''}` : ''}
        onClose={() => setSelected(null)}
        width={760}
      >
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>
              {selected.department} · {selected.location || 'No location'} · audited {selected.total} time{selected.total === 1 ? '' : 's'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 8 }}>Last Audit</div>
              <LastInspection last={selected.last} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 8 }}>Audit History</div>
              <AuditHistoryTable history={selected.history} />
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
