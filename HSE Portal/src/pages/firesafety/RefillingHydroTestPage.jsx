import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { REFILL_RECORDS, STATUS_PILL } from '../../data/fireSafetyData';

export default function RefillingHydroTestPage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Refilling / Hydro Test Control"
        subtitle="Fire extinguisher refill, cylinder test, service history and return-to-service control"
      />

      <Panel noMargin bodyStyle={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th><th>Last Refill</th><th>Extinguisher Type</th><th>Capacity</th>
                <th>Hydro Test</th><th>Next Due</th><th>Certificate</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {REFILL_RECORDS.map((r) => (
                <tr key={r.assetId}>
                  <td style={{ fontWeight: 700, color: 'var(--blue-700)' }}>{r.assetId}</td>
                  <td>{r.lastRefill}</td>
                  <td>{r.extType}</td>
                  <td>{r.capacity}</td>
                  <td>{r.hydroTest}</td>
                  <td>{r.nextDue}</td>
                  <td>{r.certificate}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
