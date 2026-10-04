import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import { IconPill, IconAlertTriangle, IconClock, IconCheckCircle, IconSearch, IconPlus } from '../../components/icons';
import {
  useOhc, addStock, issueMedicineDirect, medicineStatus, findEmployee, todayKey, dayKey, fmtDate, fmtDateTime, MED_CATEGORIES,
} from './store';
import { ExportBar, EmployeeField, Pill, Empty } from './shared';
import { inventoryPdf, inventoryExcel } from './reports';
import './ohc.css';

function StockModal({ initialId, onClose, pushToast }) {
  const { medicines } = useOhc();
  const [f, setF] = useState({ medicine_id: initialId || '', name: '', category: MED_CATEGORIES[0], unit: 'tabs', reorder: 20, batch: '', expiry: '', qty: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const isNew = !f.medicine_id;
  const save = (e) => {
    e.preventDefault();
    try {
      addStock(f);
      pushToast(`Stock updated: +${f.qty} ${isNew ? f.name : medicines.find((m) => m.id === f.medicine_id).name}`, 'success');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Modal open title="Add Stock / Goods Receipt" onClose={onClose} width={600}>
      <form onSubmit={save}>
        <div className="form-grid">
          <div className="field span-2"><label>Medicine</label>
            <select value={f.medicine_id} onChange={set('medicine_id')}>
              <option value="">＋ New medicine item</option>
              {medicines.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.stock} {m.unit} in stock</option>)}
            </select>
          </div>
          {isNew ? (
            <>
              <div className="field"><label>Medicine Name<span className="req">*</span></label><input value={f.name} onChange={set('name')} autoFocus /></div>
              <div className="field"><label>Category</label><select value={f.category} onChange={set('category')}>{MED_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="field"><label>Unit</label><input value={f.unit} onChange={set('unit')} placeholder="tabs / bottles / tubes" /></div>
              <div className="field"><label>Reorder Level</label><input type="number" min="0" value={f.reorder} onChange={set('reorder')} /></div>
            </>
          ) : null}
          <div className="field"><label>Batch No.</label><input value={f.batch} onChange={set('batch')} placeholder={isNew ? '' : 'Keep current batch'} /></div>
          <div className="field"><label>Expiry Date<span className="req">*</span></label><input type="date" min={todayKey()} value={f.expiry} onChange={set('expiry')} /></div>
          <div className="field"><label>Quantity Received<span className="req">*</span></label><input type="number" min="1" value={f.qty} onChange={set('qty')} /></div>
        </div>
        {error ? <div className="ohc-error">{error}</div> : null}
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Stock</button>
        </div>
      </form>
    </Modal>
  );
}

function IssueModal({ medicine, onClose, pushToast }) {
  const { settings } = useOhc();
  const [f, setF] = useState({ qty: 1, employee_id: '', note: '' });
  const [error, setError] = useState('');
  const save = (e) => {
    e.preventDefault();
    try {
      issueMedicineDirect({ medicine_id: medicine.id, ...f, by: settings.pharmacist });
      pushToast(`${f.qty} ${medicine.unit} of ${medicine.name} issued`, 'success');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Modal open title={`Issue ${medicine.name}`} onClose={onClose} width={480}>
      <form onSubmit={save}>
        <div className="info-callout">Available: <strong>{medicine.stock} {medicine.unit}</strong> • Batch {medicine.batch} • Exp {fmtDate(medicine.expiry)}</div>
        <div className="form-grid">
          <div className="field"><label>Quantity<span className="req">*</span></label><input type="number" min="1" max={medicine.stock} value={f.qty} onChange={(e) => setF((s) => ({ ...s, qty: e.target.value }))} autoFocus /></div>
          <EmployeeField label="Issued To (optional)" value={f.employee_id} onChange={(v) => setF((s) => ({ ...s, employee_id: v }))} />
          <div className="field span-2"><label>Note</label><input value={f.note} onChange={(e) => setF((s) => ({ ...s, note: e.target.value }))} placeholder="e.g. First aid box refill — Production" /></div>
        </div>
        {error ? <div className="ohc-error">{error}</div> : null}
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Issue</button>
        </div>
      </form>
    </Modal>
  );
}

const FILTERS = [['', 'All'], ['low', 'Low Stock'], ['expiring', 'Expiring'], ['expired', 'Expired'], ['ok', 'Available']];

export default function MedicinesPage({ pushToast }) {
  const { medicines, issues } = useOhc();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [stockFor, setStockFor] = useState(null); // null | '' (new) | id
  const [issueFor, setIssueFor] = useState(null);

  const withStatus = medicines.map((m) => ({ ...m, st: medicineStatus(m) }));
  const count = (k) => withStatus.filter((m) => (k === 'low' ? ['low', 'out'].includes(m.st.key) : m.st.key === k)).length;
  const issuedToday = issues.filter((i) => dayKey(i.at) === todayKey());
  const list = withStatus.filter((m) => {
    const hay = `${m.name} ${m.batch} ${m.category}`.toLowerCase();
    const okStatus = !status || (status === 'low' ? ['low', 'out'].includes(m.st.key) : m.st.key === status);
    return (!q || hay.includes(q.toLowerCase())) && okStatus;
  });

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="Medicine Inventory" subtitle="Stock, batch, expiry, issue and reorder control" actions={<ExportBar pushToast={pushToast} onPdf={inventoryPdf} onExcel={inventoryExcel} />} />

      <div className="stat-grid">
        <StatCard value={medicines.length} label="Total Medicines • active items" variant="blue" icon={<IconPill size={18} />} />
        <StatCard value={String(count('low')).padStart(2, '0')} label="Low Stock • reorder" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
        <StatCard value={String(count('expiring') + count('expired')).padStart(2, '0')} label="Expiring ≤30 days / expired" variant="red" icon={<IconClock size={18} />} delay={80} />
        <StatCard value={issuedToday.length} label={`Issued Today • ${issuedToday.reduce((s, i) => s + i.qty, 0)} units`} variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
      </div>

      <div className="filter-bar no-print">
        <div className="search-field">
          <IconSearch />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicine, batch or category" />
        </div>
        <div className="ohc-seg">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" className={status === k ? 'is-active' : ''} onClick={() => setStatus(k)}>{label}</button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setStockFor('')}><IconPlus size={15} /> Add Stock</button>
      </div>

      <div className="two-col">
        <Panel noMargin>
          {list.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Medicine</th><th>Batch</th><th>Expiry</th><th>Available</th><th>Reorder</th><th>Status</th><th className="no-print">Action</th></tr></thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.id}>
                      <td><b>{m.name}</b><div className="ohc-muted">{m.category}</div></td>
                      <td>{m.batch}</td>
                      <td>{fmtDate(m.expiry)}</td>
                      <td>
                        <b>{m.stock}</b> <span className="ohc-muted">{m.unit}</span>
                        <div className="ohc-stockbar"><span style={{ width: `${Math.min(100, (m.stock / Math.max(1, m.reorder * 2)) * 100)}%`, background: m.stock <= m.reorder ? 'var(--amber-500)' : 'var(--green-500)' }} /></div>
                      </td>
                      <td>{m.reorder}</td>
                      <td><Pill meta={m.st} /></td>
                      <td className="no-print" style={{ whiteSpace: 'nowrap' }}>
                        <button type="button" className="btn btn-outline btn-sm" disabled={['expired', 'out'].includes(m.st.key)} onClick={() => setIssueFor(m)}>Issue</button>{' '}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStockFor(m.id)}>Restock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty title="No medicines match">Change the search or filter.</Empty>}
        </Panel>
        <Panel title="Recent Issues" plain noMargin>
          <div className="ohc-mini-list">
            {issues.slice(0, 12).map((i) => {
              const m = medicines.find((x) => x.id === i.medicine_id);
              return (
                <div key={i.id}>
                  <span className="ohc-mini-main"><b>{m?.name} × {i.qty}</b><small>{i.employee_id ? findEmployee(i.employee_id)?.name : (i.note || 'Direct issue')} • {fmtDateTime(i.at)}</small></span>
                </div>
              );
            })}
            {!issues.length ? <p className="ohc-muted">No issues recorded.</p> : null}
          </div>
        </Panel>
      </div>

      {stockFor !== null ? <StockModal initialId={stockFor} onClose={() => setStockFor(null)} pushToast={pushToast} /> : null}
      {issueFor ? <IssueModal medicine={issueFor} onClose={() => setIssueFor(null)} pushToast={pushToast} /> : null}
    </div>
  );
}
