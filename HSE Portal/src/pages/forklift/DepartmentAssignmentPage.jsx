import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import ObservationModal from '../../components/ObservationModal';
import { IconPlus } from '../../components/icons';
import { OBSERVATIONS, OBS_STATUS_PILL, PRIORITY_PILL, OBSERVATION_WORKFLOW, nextObservationId } from '../../data/forkliftData';

export default function DepartmentAssignmentPage({ pushToast }) {
  const [rows, setRows] = useState(OBSERVATIONS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = (data) => {
    const row = {
      id: nextObservationId(),
      forklift: data.forklift,
      finding: data.finding,
      dept: data.department,
      hod: data.hod || `${data.department} HOD`,
      due: data.dueDate || '—',
      priority: data.priority,
      status: 'OPEN',
    };
    setRows((r) => [row, ...r]);
    setModalOpen(false);
    pushToast(`${row.id} assigned to ${row.dept}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Concern Department Assignment"
        subtitle="Safety observation → responsible department → HOD → corrective action → verification → closure"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Assign New Concern
          </button>
        )}
      />

      <Panel bodyStyle={{ borderLeft: '3px solid var(--amber-500)' }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 14 }}>Recommended Workflow</h3>
        <div className="workflow-grid">
          {OBSERVATION_WORKFLOW.map((step, idx) => (
            <div className="workflow-step" key={step.title}>
              <div className="step-index">Step {idx + 1}</div>
              <div className="step-title">{step.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginTop: 4 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Observation</th><th>Forklift</th><th>Finding</th><th>Concern Department</th>
                <th>HOD / Owner</th><th>Due Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.forklift}</td>
                  <td>{r.finding}</td>
                  <td>
                    {r.dept} <span className={`pill ${PRIORITY_PILL[r.priority]}`} style={{ marginLeft: 6 }}>{r.priority}</span>
                  </td>
                  <td>{r.hod}</td>
                  <td>{r.due}</td>
                  <td><span className={`pill ${OBS_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setModalOpen(true)}>Reassign</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ObservationModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
