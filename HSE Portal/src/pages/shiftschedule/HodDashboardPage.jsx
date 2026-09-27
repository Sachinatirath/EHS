import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import { IconClock, IconCheckCircle, IconAlertTriangle, IconRepeat, IconUsers } from '../../components/icons';
import { dateKey, planDate } from '../../data/auditPlan';
import { SHIFTS, listRequests, scheduleFor, useShiftAuth } from './store';
import { RequestModal, RequestsTable, ShiftPill } from './shared';

/** HOD: pending approvals, decision counts and today's crew per shift for the department. */
export default function HodDashboardPage({ onNavigate, pushToast }) {
  const { user } = useShiftAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => listRequests().then(setRows).catch((err) => pushToast(err.message, 'error')), [pushToast]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load, user?.department]);

  if (!user) return null;

  const today = dateKey(planDate());
  const crew = scheduleFor(today, user.department);
  const pending = rows.filter((r) => r.status === 'pending');
  const count = (s) => rows.filter((r) => r.status === s).length;

  return (
    <div className="page-enter">
      <PageHeader
        title="Shift Schedule — HOD Dashboard"
        subtitle={`${user.name} · HOD · ${user.department}`}
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('ss-hod-requests')}>
            <IconRepeat size={15} /> All Requests
          </button>
        )}
      />

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <StatCard value={count('pending')} label="Pending Approval" variant="amber" icon={<IconClock size={18} />} delay={0} />
        <StatCard value={count('approved')} label="Approved" variant="green" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={count('rejected')} label="Rejected" variant="red" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={crew.length} label="Employees in Department" variant="slate" icon={<IconUsers size={18} />} delay={120} />
      </div>

      <Panel title="Pending Shift Requests" icon={<IconClock size={17} />}>
        <RequestsTable rows={pending} loading={loading} onOpen={setSelected} showEmployee empty="No requests waiting for your approval." />
      </Panel>

      <Panel title={`Today's Crew — ${user.department}`} icon={<IconUsers size={17} />}>
        <div className="atp-shift-grid">
          {SHIFTS.map((s) => {
            const people = crew.filter((c) => c.shift === s.id);
            return (
              <div key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ShiftPill id={s.id} />
                  <span style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{s.time} · {people.length} on shift</span>
                </div>
                {people.length ? people.map((p) => (
                  <div key={p.id} style={{ fontSize: 13, padding: '4px 0' }}>
                    {p.name} <span style={{ color: 'var(--slate-500)' }}>({p.id})</span>
                    {p.changed ? <span className="pill pill-blue" style={{ marginLeft: 6 }}>Changed</span> : null}
                  </div>
                )) : <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>Nobody scheduled.</div>}
              </div>
            );
          })}
        </div>
      </Panel>

      <RequestModal
        request={selected}
        canDecide
        onClose={() => setSelected(null)}
        onDecided={(u) => { setSelected(u); load(); }}
        pushToast={pushToast}
      />
    </div>
  );
}
