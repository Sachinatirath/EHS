import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import {
  nextMocId, MOC_CATEGORIES, MOC_DEPARTMENTS, CHANGE_TYPES, IMPACT_AREAS, PROCEDURE_COVERAGE, NEW_MOC_STEPS,
} from '../../data/mocData';

export default function NewMocPage({ pushToast, onNavigate }) {
  const [mocId] = useState(() => nextMocId());
  const [form, setForm] = useState({ category: MOC_CATEGORIES[0], department: MOC_DEPARTMENTS[0], changeType: CHANGE_TYPES[0], impactAreas: IMPACT_AREAS[0], coverage: PROCEDURE_COVERAGE[0] });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => form.title?.trim() && form.existingCondition?.trim() && form.proposedChange?.trim() && form.reason?.trim();

  const handleSubmit = () => {
    if (!validate()) {
      pushToast('Please complete all required fields before submitting.', 'error');
      return;
    }
    pushToast(`${mocId} submitted for screening.`, 'success');
    onNavigate('moc-register');
  };
  const handleDraft = () => pushToast(`${mocId} saved as draft.`, 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Raise New MOC"
        subtitle="Initiate a controlled change request before implementing any significant change"
        badge={<span className="pill pill-amber">DRAFT</span>}
      />

      <div className="panel">
        <div className="panel-body">
          <div className="step-progress">
            {NEW_MOC_STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i === NEW_MOC_STEPS.length - 1 ? '0 0 auto' : 1 }}>
                <div className={`step${i === 0 ? ' active' : ''}`}>
                  <span className="step-num">{i + 1}</span> {step}
                </div>
                {i < NEW_MOC_STEPS.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          <div className="info-callout">
            <strong>Golden rule:</strong>&nbsp;No physical change should be implemented until the required MOC approvals, risk controls and pre-startup checks are completed.
          </div>

          <div className="form-grid form-grid-3">
            <div className="field">
              <label>MOC Number *</label>
              <input value={mocId} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
            </div>
            <div className="field">
              <label>Change Title *</label>
              <input value={form.title || ''} onChange={set('title')} placeholder="Example: EOT capacity upgrade below 20 ton" />
            </div>
            <div className="field">
              <label>Change Category *</label>
              <select value={form.category} onChange={set('category')}>
                {MOC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Department *</label>
              <select value={form.department} onChange={set('department')}>
                {MOC_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Change Type</label>
              <select value={form.changeType} onChange={set('changeType')}>
                {CHANGE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Initiator / Requester</label>
              <input value={form.initiator || ''} onChange={set('initiator')} placeholder="Department Engineer" />
            </div>
            <div className="field">
              <label>Concern HOD</label>
              <input value={form.concernHod || ''} onChange={set('concernHod')} placeholder="Department HOD" />
            </div>
            <div className="field">
              <label>Technical Reviewer</label>
              <input value={form.technicalReviewer || ''} onChange={set('technicalReviewer')} placeholder="Engineering / Process Reviewer" />
            </div>
            <div className="field">
              <label>Safety Reviewer</label>
              <input value={form.safetyReviewer || ''} onChange={set('safetyReviewer')} placeholder="Safety Officer" />
            </div>
            <div className="field">
              <label>Target Implementation Date</label>
              <input type="date" value={form.targetDate || ''} onChange={set('targetDate')} />
            </div>
            <div className="field">
              <label>Expected Duration</label>
              <input value={form.duration || ''} onChange={set('duration')} placeholder="e.g. 3 days" />
            </div>
            <div className="field">
              <label>Related Documents</label>
              <input value={form.relatedDocs || ''} onChange={set('relatedDocs')} placeholder="HIRA / JSA / SOP / WMS / Drawing" />
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Existing Condition / Current State *</label>
            <textarea value={form.existingCondition || ''} onChange={set('existingCondition')} placeholder="Describe the current process, equipment, manpower, material or system..." />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Proposed Change *</label>
            <textarea value={form.proposedChange || ''} onChange={set('proposedChange')} placeholder="What exactly will change? Include capacity, equipment, process, layout, chemical, software, organisation or document changes..." />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Reason / Business &amp; Safety Justification *</label>
            <textarea value={form.reason || ''} onChange={set('reason')} placeholder="Why is the change required? Productivity, safety improvement, reliability, legal requirement, new product, customer requirement, etc." />
          </div>

          <div className="form-grid form-grid-3" style={{ marginTop: 16 }}>
            <div className="field">
              <label>Potential Impact Areas</label>
              <select value={form.impactAreas} onChange={set('impactAreas')}>
                {IMPACT_AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Change is covered by existing procedure?</label>
              <select value={form.coverage} onChange={set('coverage')}>
                {PROCEDURE_COVERAGE.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Temporary change expiry date</label>
              <input type="date" value={form.expiryDate || ''} onChange={set('expiryDate')} />
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Supporting Evidence / Drawings / Photos</label>
            <input type="file" multiple />
          </div>

          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit for Screening</button>
          </div>
        </div>
      </div>
    </div>
  );
}
