import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import { IconPlus, IconRepeat, IconClock, IconCheckCircle, IconAlertTriangle } from '../../components/icons';
import { listRequests, useShiftAuth } from './store';
import { RequestModal, RequestsTable } from './shared';

/** Employee's own shift requests (and swaps that name them), with their HOD decision. */
export default function MyRequestsPage({ onNavigate, pushToast }) {
  const { user } = useShiftAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => listRequests().then(setRows).catch((err) => pushToast(err.message, 'error')), [pushToast]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load, user?.id]);

  if (!user) return null;
  const count = (s) => rows.filter((r) => r.status === s).length;

  return (
    <div className="page-enter">
      <PageHeader
        title="My Shift Requests"
        subtitle={`${user.name} · ${user.id} · ${user.department}`}
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('ss-emp-new')}>
            <IconPlus size={15} /> New Request
          </button>
        )}
      />
      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <StatCard value={rows.length} label="Total Requests" variant="slate" icon={<IconRepeat size={18} />} delay={0} />
        <StatCard value={count('pending')} label="Pending HOD" variant="amber" icon={<IconClock size={18} />} delay={40} />
        <StatCard value={count('approved')} label="Approved" variant="green" icon={<IconCheckCircle size={18} />} delay={80} />
        <StatCard value={count('rejected')} label="Rejected" variant="red" icon={<IconAlertTriangle size={18} />} delay={120} />
      </div>
      <Panel title="Requests" icon={<IconRepeat size={17} />}>
        <RequestsTable rows={rows} loading={loading} onOpen={setSelected} empty="You have not raised any shift requests yet." />
      </Panel>
      <RequestModal request={selected} onClose={() => setSelected(null)} pushToast={pushToast} />
    </div>
  );
}
