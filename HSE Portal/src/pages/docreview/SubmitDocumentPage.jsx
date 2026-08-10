import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { DOC_TYPES, DOC_DEPARTMENTS, REVIEW_FREQUENCIES, SUBMISSION_REASONS, nextDocNumber } from '../../data/docReviewData';

const STEPS = ['Document Info', 'Upload', 'Reviewers', 'Submit'];

export default function SubmitDocumentPage({ pushToast, onNavigate }) {
  const [form, setForm] = useState({
    docNumber: 'EHS-', title: '', type: DOC_TYPES[0], department: DOC_DEPARTMENTS[0],
    version: 'Rev 1.0', author: '', frequency: REVIEW_FREQUENCIES[0], nextReview: '',
    relatedDocs: '', reason: SUBMISSION_REASONS[0], changes: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => form.docNumber.trim() !== 'EHS-' && form.title.trim();

  const handleSubmit = () => {
    if (!validate()) {
      pushToast('Document Number and Document Title are required.', 'error');
      return;
    }
    pushToast(`${form.docNumber} submitted for review.`, 'success');
    onNavigate('dr-pending');
  };
  const handleDraft = () => pushToast(`${form.docNumber || nextDocNumber(form.type)} saved as draft.`, 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Submit New Document for Review"
        subtitle="Upload a new or revised controlled document and initiate the review workflow"
        badge={<span className="pill pill-cyan">DRAFT</span>}
      />

      <div className="panel">
        <div className="panel-body">
          <div className="step-progress">
            {STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i === STEPS.length - 1 ? '0 0 auto' : 1 }}>
                <div className={`step${i === 0 ? ' active' : ''}`}>
                  <span className="step-num">{i + 1}</span> {step}
                </div>
                {i < STEPS.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          <div className="info-callout">
            <strong>Document control policy:</strong>&nbsp;All EHS controlled documents must be reviewed at least annually or within 30 days of a relevant process, equipment, regulatory, or organisational change.
          </div>

          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Document Number *</label>
              <input value={form.docNumber} onChange={set('docNumber')} placeholder="EHS-" />
            </div>
            <div className="field">
              <label>Document Title *</label>
              <input value={form.title} onChange={set('title')} placeholder="Enter the full document title" />
            </div>
            <div className="field">
              <label>Document Type *</label>
              <select value={form.type} onChange={set('type')}>
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Department *</label>
              <select value={form.department} onChange={set('department')}>
                {DOC_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Version / Revision No.</label>
              <input value={form.version} onChange={set('version')} />
            </div>
            <div className="field">
              <label>Author / Originator</label>
              <input value={form.author} onChange={set('author')} placeholder="Name of document author" />
            </div>
            <div className="field">
              <label>Review Frequency</label>
              <select value={form.frequency} onChange={set('frequency')}>
                {REVIEW_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Next Review Date</label>
              <input type="date" value={form.nextReview} onChange={set('nextReview')} />
            </div>
            <div className="field">
              <label>Related Documents</label>
              <input value={form.relatedDocs} onChange={set('relatedDocs')} placeholder="SOP-001, POL-003, ..." />
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Purpose / Reason for Submission *</label>
            <select value={form.reason} onChange={set('reason')}>
              {SUBMISSION_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Description of Changes (if revision)</label>
            <textarea value={form.changes} onChange={set('changes')} placeholder="Summarise key changes, sections affected, and rationale..." />
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Upload Document (PDF / DOCX)</label>
            <input type="file" />
          </div>

          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit for Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}
