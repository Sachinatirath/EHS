import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { VERIFICATION_CHECKLIST, VERIFICATION_RESULTS, VERIFICATION_QUEUE, STATUS_PILL } from '../../data/mocData';

export default function PostChangeVerificationPage({ pushToast }) {
  const [checklist, setChecklist] = useState(() => VERIFICATION_CHECKLIST.map((c) => ({ ...c, checked: false })));
  const [result, setResult] = useState(VERIFICATION_RESULTS[0]);
  const [comments, setComments] = useState('');

  const toggle = (idx) => setChecklist((rows) => rows.map((r, i) => (i === idx ? { ...r, checked: !r.checked } : r)));

  const handleSubmit = () => {
    pushToast(`Verification submitted — ${result}.`, 'success');
    setComments('');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Post-Change Verification & Closure"
        subtitle="Confirm that the change achieved its intended result without introducing unacceptable new risk"
      />

      <div className="two-col">
        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--blue-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Post-Change Verification Checklist</h3>
            {checklist.map((item, idx) => (
              <div className="check-list-row" key={item.text}>
                <label>
                  <input type="checkbox" checked={item.checked} onChange={() => toggle(idx)} />
                  {item.text}
                </label>
                <span className="tag-text">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Closure Decision</h3>
            <div className="field">
              <label>Verification Result</label>
              <select value={result} onChange={(e) => setResult(e.target.value)}>
                {VERIFICATION_RESULTS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Verification Comments</label>
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Mention field verification, observations, test results and remaining actions..." />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Evidence</label>
              <input type="file" multiple />
            </div>
            <button type="button" className="btn btn-success" style={{ width: '100%', marginTop: 8 }} onClick={handleSubmit}>
              Submit for Closure
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MOC</th><th>Change</th><th>Verification</th><th>Open Actions</th>
                <th>Owner</th><th>Closure</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {VERIFICATION_QUEUE.map((r) => (
                <tr key={r.mocId}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.mocId}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td><span className={`pill ${STATUS_PILL[r.verification]}`}>{r.verification}</span></td>
                  <td>{r.openActions}</td>
                  <td>{r.owner}</td>
                  <td>{r.closure}</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`${r.verification === 'APPROVED' ? 'Viewing' : 'Verifying'} ${r.mocId}.`, 'info')}>
                      {r.verification === 'APPROVED' ? 'View' : 'Verify'}
                    </button>
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
