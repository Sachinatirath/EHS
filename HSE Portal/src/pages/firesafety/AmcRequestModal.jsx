import { useState } from 'react';
import Modal from '../../components/Modal';
import { FIRE_ASSET_TYPES, COMPLAINT_TYPES, nextServiceId } from '../../data/fireSafetyData';

const EMPTY = { client: '', contact: '', assetId: '', equipment: FIRE_ASSET_TYPES[0], complaint: COMPLAINT_TYPES[0], spareId: '', engineer: 'AMC Service Team', targetReturn: '', observation: '' };

export default function AmcRequestModal({ open, onClose, onSave }) {
  const [serviceId] = useState(() => nextServiceId());
  const [form, setForm] = useState(EMPTY);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.client.trim() || !form.assetId.trim()) {
      return;
    }
    onSave({ id: serviceId, ...form });
    setForm(EMPTY);
  };

  return (
    <Modal open={open} title="New Client AMC Service Request" onClose={onClose} width={720}>
      <form onSubmit={handleSubmit}>
        <div className="info-callout">
          <strong>Example:</strong>&nbsp;Client reports pressure drop → spare extinguisher installed → defective extinguisher goes to workshop → repair/refill/test → original returned and reinstalled → spare collected → client closure.
        </div>

        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Service Request No.</label>
            <input value={serviceId} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
          </div>
          <div className="field">
            <label>Client Name</label>
            <input value={form.client} onChange={set('client')} placeholder="Client / company name" />
          </div>
          <div className="field">
            <label>Client Contact</label>
            <input value={form.contact} onChange={set('contact')} placeholder="Name / phone / email" />
          </div>
          <div className="field">
            <label>Original Fire Asset ID</label>
            <input value={form.assetId} onChange={set('assetId')} placeholder="FE-PRD-044" />
          </div>
          <div className="field">
            <label>Equipment</label>
            <select value={form.equipment} onChange={set('equipment')}>
              {FIRE_ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Complaint Type</label>
            <select value={form.complaint} onChange={set('complaint')}>
              {COMPLAINT_TYPES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Temporary Spare Asset ID</label>
            <input value={form.spareId} onChange={set('spareId')} placeholder="FE-SP-012" />
          </div>
          <div className="field">
            <label>Service Engineer</label>
            <input value={form.engineer} onChange={set('engineer')} />
          </div>
          <div className="field">
            <label>Target Return Date</label>
            <input type="date" value={form.targetReturn} onChange={set('targetReturn')} />
          </div>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Client Complaint / Field Observation</label>
          <textarea value={form.observation} onChange={set('observation')} placeholder="Exact complaint and field condition..." />
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Before Replacement Evidence</label>
          <input type="file" multiple />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="submit" className="btn btn-primary">Create Service Request</button>
        </div>
      </form>
    </Modal>
  );
}
