import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconRepeat } from '../../components/icons';
import { STATUS_META, listRequests, useShiftAuth } from './store';
import { RequestModal, RequestsTable } from './shared';
import { useFocusTarget, peekFocusTarget } from '../../utils/focusTarget';

/** HOD: every shift request of the department, filterable by status, with approve / reject. */
export default function HodRequestsPage({ pushToast }) {
  const { user } = useShiftAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(() => (peekFocusTarget('ss-hod-requests') != null ? 'all' : 'pending'));
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const focus = useFocusTarget('ss-hod-requests', rows.map((r) => r.id), (id) => setSelected(rows.find((r) => r.id === id) || null));

  const load = useCallback(() => listRequests().then(setRows).catch((err) => pushToast(err.message, 'error')), [pushToast]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load, user?.department]);

  if (!user) return null;

  const q = query.trim().toLowerCase();
  const visible = rows.filter((r) => (status === 'all' || r.status === status)
    && (!q || [r.request_no, r.employee_name, r.employee_id, r.swap_with_name].some((f) => (f || '').toLowerCase().includes(q))));

  return (
    <div className="page-enter">
      <PageHeader title="Shift Requests" subtitle={`${user.department} · approve or reject shift changes and swaps`} />
      <Panel title="Requests" icon={<IconRepeat size={17} />}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div className="field" style={{ width: 220 }}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 240 }}>
            <label>Search</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Request no or employee" />
          </div>
        </div>
        <RequestsTable rows={visible} loading={loading} onOpen={setSelected} showEmployee rowProps={focus.rowProps} empty="No requests match." />
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
