import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PSSR_CHECKLIST, IMPLEMENTATION_QUEUE, STATUS_PILL } from '../../data/mocData';

export default function ImplementationPage({ pushToast }) {
  const [checklist, setChecklist] = useState(PSSR_CHECKLIST);

  const toggle = (idx) => setChecklist((rows) => rows.map((r, i) => (i === idx ? { ...r, checked: !r.checked } : r)));

  const handleSave = () => {
    const done = checklist.filter((r) => r.checked).length;
    pushToast(`PSSR checklist saved — ${done}/${checklist.length} items complete.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Implementation Control"
        subtitle="Approved MOC execution, pre-startup safety review and change implementation checklist"
      />

      <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Pre-Implementation / PSSR Checklist</h3>
          {checklist.map((item, idx) => (
            <div className="check-list-row" key={item.text}>
              <label>
                <input type="checkbox" checked={item.checked} onChange={() => toggle(idx)} />
                {item.text}
              </label>
              <span className="tag-text">{item.tag}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Save PSSR</button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MOC</th><th>Implementation Date</th><th>Responsible</th>
                <th>PSSR</th><th>Execution Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {IMPLEMENTATION_QUEUE.map((r) => (
                <tr key={r.mocId}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.mocId}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{r.title}</div>
                  </td>
                  <td>{r.date}</td>
                  <td>{r.responsible}</td>
                  <td><span className={`pill ${STATUS_PILL[r.pssr]}`}>{r.pssr}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.execution]}`}>{r.execution}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Opened ${r.mocId}.`, 'info')}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
