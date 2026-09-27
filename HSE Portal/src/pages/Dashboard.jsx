import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import { IconFileText, IconClock, IconCheckCircle, IconAlertTriangle } from '../components/icons';

const PERMITS = [
  { no: 1, id: 'PTW-2026-001', type: 'Hot Work', dept: 'Maintenance', desc: 'Welding repair on pipeline', loc: 'Area A', contact: '+971-50-1234567', status: 'Pending', remark: 'Awaiting approval' },
  { no: 2, id: 'PTW-2026-002', type: 'Work at Height', dept: 'Projects', desc: 'Scaffolding installation', loc: 'Building B', contact: '+971-50-2345678', status: 'Approved', remark: 'All controls in place' },
  { no: 3, id: 'PTW-2026-003', type: 'LOTO', dept: 'Electrical', desc: 'Panel maintenance', loc: 'Substation C', contact: '+971-50-3456789', status: 'Approved', remark: '' },
  { no: 4, id: 'PTW-2026-004', type: 'Confined Space', dept: 'Operations', desc: 'Tank cleaning', loc: 'Tank Farm', contact: '+971-50-4567890', status: 'Rejected', remark: 'Incomplete documents' },
  { no: 5, id: 'PTW-2026-005', type: 'General Permit', dept: 'Civil', desc: 'Concrete pouring', loc: 'Site D', contact: '+971-50-5678901', status: 'Pending', remark: '' },
];

const STATUS_PILL = {
  Pending: 'pill-amber',
  Approved: 'pill-green',
  Rejected: 'pill-red',
};

export default function Dashboard() {
  return (
    <div className="page-enter">
      <h1 className="page-title">Permits Dashboard</h1>

      <div className="stat-grid">
        <StatCard value={245} label="Total Permits" variant="blue" icon={<IconFileText size={19} />} delay={0} />
        <StatCard value={18} label="Pending" variant="amber" icon={<IconClock size={19} />} delay={60} />
        <StatCard value={210} label="Approved" variant="green" icon={<IconCheckCircle size={19} />} delay={120} />
        <StatCard value={17} label="Rejected" variant="red" icon={<IconAlertTriangle size={19} />} delay={180} />
      </div>

      <Panel title="Recent Work Permits" icon={<IconFileText size={17} />} bodyStyle={{ paddingTop: 16 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SL No</th><th>Permit No</th><th>Type</th><th>Dept</th>
                <th>Work Description</th><th>Location</th><th>E. Contact Number</th>
                <th>Status</th><th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {PERMITS.map((p) => (
                <tr key={p.id}>
                  <td>{p.no}</td>
                  <td>{p.id}</td>
                  <td>{p.type}</td>
                  <td>{p.dept}</td>
                  <td>{p.desc}</td>
                  <td>{p.loc}</td>
                  <td>{p.contact}</td>
                  <td><span className={`pill ${STATUS_PILL[p.status]}`}>{p.status}</span></td>
                  <td>{p.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
