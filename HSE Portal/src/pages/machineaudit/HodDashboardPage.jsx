import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import Skeleton from '../safetyviolation/Skeleton';
import { IconClipboard, IconCheckCircle, IconClock, IconTool, IconAlertTriangle } from '../../components/icons';
import { MACHINE_DEPARTMENTS, listAudits, summarizeMachines, useMachineAuditAuth } from './store';
import AuditedMachines from './AuditedMachines';
import { formatDate } from './statusMeta';

const monthKeyOf = (iso) => iso.slice(0, 7);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

/**
 * HOD (read-only): which machines were audited in a month, which are fully
 * audited (all in-charges done and closed), and which have not been audited yet.
 */
export default function HodDashboardPage({ pushToast }) {
  const { user } = useMachineAuditAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(thisMonth);
  const [dept, setDept] = useState('all');

  useEffect(() => {
    let cancelled = false;
    listAudits()
      .then((list) => { if (!cancelled) setAudits(list); })
      .catch((err) => { if (!cancelled) pushToast(err.message, 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  if (!user) return null;

  const inDept = (a) => dept === 'all' || a.department === dept;
  const monthAudits = audits.filter((a) => monthKeyOf(a.created_at) === month && inDept(a));
  const machines = summarizeMachines(monthAudits);
  const fullyAudited = machines.filter((m) => m.history.every((a) => a.status === 'closed'));
  // Machines audited before but not in the selected month.
  const auditedNow = new Set(machines.map((m) => m.key));
  const notAudited = summarizeMachines(audits.filter(inDept)).filter((m) => !auditedNow.has(m.key));

  return (
    <div className="page-enter">
      <PageHeader title="HOD Dashboard" subtitle={`${user.name} · HOD · machine audits for ${monthLabel(month)}`} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div className="field" style={{ width: 200 }}>
          <label>Month</label>
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </div>
        <div className="field" style={{ width: 200 }}>
          <label>Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">All departments</option>
            {MACHINE_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={machines.length} label="Machines Audited" variant="violet" icon={<IconTool size={18} />} delay={0} />
          <StatCard value={fullyAudited.length} label="Fully Audited (Closed)" variant="green" icon={<IconCheckCircle size={18} />} delay={40} />
          <StatCard value={monthAudits.filter((a) => a.status === 'pending_incharge').length} label="With In-charges" variant="amber" icon={<IconClock size={18} />} delay={80} />
          <StatCard value={monthAudits.filter((a) => a.status === 'ready_to_close').length} label="Ready to Close" variant="blue" icon={<IconClipboard size={18} />} delay={120} />
          <StatCard value={machines.filter((m) => m.nonCompliance).length} label="With Non-compliance" variant="red" icon={<IconAlertTriangle size={18} />} delay={160} />
        </div>
      )}

      <Panel title={`Machines Audited — ${monthLabel(month)}`} icon={<IconTool size={17} />}>
        <AuditedMachines audits={monthAudits} loading={loading} showDepartmentFilter={false} />
      </Panel>

      <Panel title={`Not Audited in ${monthLabel(month)}`} icon={<IconAlertTriangle size={17} />}>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr><th>Machine ID</th><th>Last Audited</th><th>Machine</th><th>Department</th><th>Location</th><th>Total Audits</th></tr>
            </thead>
            <tbody>
              {notAudited.map((m) => (
                <tr key={m.key}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{m.machine_id || '—'}</td>
                  <td>{formatDate(m.last.created_at)}</td>
                  <td>{m.machine_name}</td>
                  <td>{m.department}</td>
                  <td>{m.location || '—'}</td>
                  <td>{m.total}</td>
                </tr>
              ))}
              {!notAudited.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--green-600)', fontWeight: 600 }}>Every known machine has been audited this month.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
