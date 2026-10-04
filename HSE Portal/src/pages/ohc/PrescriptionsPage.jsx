import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Modal from '../../components/Modal';
import { IconSearch, IconFileText, IconPill } from '../../components/icons';
import { useOhc, findEmployee, issuePrescription, takePending, fmtDateTime, todayKey } from './store';
import { ExportBar, Empty } from './shared';
import { downloadPdf } from './ohcExport';
import { prescriptionPdf, prescriptionsExcel } from './reports';
import './ohc.css';

function IssueModal({ rx, onClose, pushToast }) {
  const { medicines, settings } = useOhc();
  const [by, setBy] = useState(settings.pharmacist);
  const [error, setError] = useState('');
  const emp = findEmployee(rx.employee_id);
  const short = rx.items.some((i) => (medicines.find((m) => m.id === i.medicine_id)?.stock ?? 0) < i.qty);
  const confirm = () => {
    try {
      issuePrescription(rx.id, by);
      pushToast(`${rx.rx_no} issued to ${emp?.name}. Stock deducted.`, 'success');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Modal open title={`Issue ${rx.rx_no}`} onClose={onClose} width={560}>
      <div className="info-callout"><span><strong>{emp?.id} • {emp?.name}</strong> — {rx.diagnosis}. Allergy: {emp?.allergy}</span></div>
      <div className="table-wrap">
        <table className="data-table compact">
          <thead><tr><th>Medicine</th><th>Dose</th><th>Qty</th><th>In Stock</th></tr></thead>
          <tbody>
            {rx.items.map((i) => {
              const stock = medicines.find((m) => m.id === i.medicine_id)?.stock ?? 0;
              return (
                <tr key={i.medicine_id}>
                  <td><b>{i.name}</b></td><td>{i.dose} • {i.duration}</td><td>{i.qty}</td>
                  <td><span className={`pill ${stock >= i.qty ? 'pill-green' : 'pill-red'}`}>{stock}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="field" style={{ marginTop: 14 }}><label>Issued By</label><input value={by} onChange={(e) => setBy(e.target.value)} /></div>
      {error ? <div className="ohc-error">{error}</div> : null}
      <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-success" disabled={short} onClick={confirm}>{short ? 'Insufficient Stock' : 'Confirm Issue & Deduct Stock'}</button>
      </div>
    </Modal>
  );
}

const TABS = [['pending', 'Pending Issue'], ['issued', 'Issued'], ['', 'All']];

export default function PrescriptionsPage({ pushToast }) {
  const { prescriptions } = useOhc();
  const [focusId] = useState(() => takePending('dm-prescriptions')?.rxId || null);
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [issuing, setIssuing] = useState(() => (focusId ? prescriptions.find((r) => r.id === focusId && r.status === 'pending') || null : null));

  const list = prescriptions.filter((r) => {
    const hay = `${r.rx_no} ${r.employee_id} ${findEmployee(r.employee_id)?.name} ${r.diagnosis} ${r.items.map((i) => i.name).join(' ')}`.toLowerCase();
    return (!tab || r.status === tab) && (!q || hay.includes(q.toLowerCase()));
  });
  const shown = list.slice(0, 100);
  const pendingCount = prescriptions.filter((r) => r.status === 'pending').length;

  const pdf = () => downloadPdf({
    title: 'Prescription & Pharmacy Register',
    filename: `OHC-prescriptions-${todayKey()}.pdf`,
    landscape: true,
    blocks: [{ heading: `${list.length} prescriptions`, columns: ['Rx No.', 'Date', 'Employee', 'Doctor', 'Diagnosis', 'Medicines', 'Status'], widths: [1, 1.6, 2, 1.8, 2, 3, 1.1], rows: list.map((r) => [r.rx_no, fmtDateTime(r.created_at), `${r.employee_id} ${findEmployee(r.employee_id)?.name}`, r.doctor, r.diagnosis, r.items.map((i) => `${i.name} × ${i.qty}`).join(', '), r.status === 'issued' ? 'Issued' : 'Pending']) }],
  });

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="Prescription & Pharmacy" subtitle="Prescription and pharmacy issue tracking" actions={<ExportBar pushToast={pushToast} onPdf={pdf} onExcel={() => prescriptionsExcel(list)} />} />

      <div className="filter-bar no-print">
        <div className="ohc-seg">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>
              {label}{k === 'pending' && pendingCount ? <span className="ohc-seg-badge">{pendingCount}</span> : null}
            </button>
          ))}
        </div>
        <div className="search-field">
          <IconSearch />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Rx no., employee, diagnosis or medicine" />
        </div>
      </div>

      <Panel noMargin>
        {shown.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Rx No.</th><th>Date</th><th>Employee</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Status</th><th className="no-print">Action</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className={r.id === focusId ? 'row-flash' : ''}>
                    <td><b>{r.rx_no}</b></td>
                    <td>{fmtDateTime(r.created_at)}</td>
                    <td>{findEmployee(r.employee_id)?.name}<div className="ohc-muted">{r.employee_id}</div></td>
                    <td>{r.doctor}</td>
                    <td>{r.diagnosis}</td>
                    <td>{r.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</td>
                    <td><span className={`pill ${r.status === 'issued' ? 'pill-green' : 'pill-amber'}`}>{r.status === 'issued' ? 'Issued' : 'Pending Issue'}</span></td>
                    <td className="no-print" style={{ whiteSpace: 'nowrap' }}>
                      {r.status === 'pending' ? <button type="button" className="btn btn-primary btn-sm" onClick={() => setIssuing(r)}><IconPill size={14} /> Issue</button> : null}{' '}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => prescriptionPdf(r)} title="Download prescription"><IconFileText size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > shown.length ? <p className="ohc-muted" style={{ textAlign: 'center' }}>Showing 100 of {list.length} — refine the search or export to Excel.</p> : null}
          </div>
        ) : <Empty title={tab === 'pending' ? 'Nothing waiting at pharmacy' : 'No prescriptions found'} />}
      </Panel>

      {issuing ? <IssueModal rx={issuing} onClose={() => setIssuing(null)} pushToast={pushToast} /> : null}
    </div>
  );
}
