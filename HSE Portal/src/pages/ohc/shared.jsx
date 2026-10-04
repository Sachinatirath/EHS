import { useId, useState } from 'react';
import { IconPrinter, IconDownload, IconFileText } from '../../components/icons';
import { printPage } from './ohcExport';
import { STAGES, findEmployee, fmtTime, vitalFlags, bmi, useOhc } from './store';

/** Print + PDF + Excel buttons for a page header. Missing handlers hide that button. */
export function ExportBar({ onPdf, onExcel, pushToast, pdfLabel = 'PDF', excelLabel = 'Excel' }) {
  const [busy, setBusy] = useState(null);
  const run = (kind, fn) => async () => {
    setBusy(kind);
    try {
      await fn();
      pushToast?.(`${kind === 'pdf' ? 'PDF' : 'Excel file'} downloaded`, 'success');
    } catch (err) {
      pushToast?.(err.message || 'Download failed', 'error');
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="ohc-export no-print">
      <button type="button" className="btn btn-outline" onClick={printPage}><IconPrinter size={15} /> Print</button>
      {onPdf ? (
        <button type="button" className="btn btn-outline" disabled={!!busy} onClick={run('pdf', onPdf)}>
          <IconFileText size={15} /> {busy === 'pdf' ? 'Preparing…' : pdfLabel}
        </button>
      ) : null}
      {onExcel ? (
        <button type="button" className="btn btn-outline" disabled={!!busy} onClick={run('excel', onExcel)}>
          <IconDownload size={15} /> {busy === 'excel' ? 'Preparing…' : excelLabel}
        </button>
      ) : null}
    </div>
  );
}

export const Pill = ({ meta }) => <span className={`pill ${meta.pill}`}>{meta.label}</span>;
export const StagePill = ({ stage }) => <Pill meta={STAGES[stage]} />;

export function Empty({ title, children }) {
  return (
    <div className="ohc-empty">
      <div className="ohc-empty-title">{title}</div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

/** Employee ID input with suggestions; shows who it resolved to. */
export function EmployeeField({ value, onChange, label = 'Employee ID', required, autoFocus }) {
  const { employees } = useOhc();
  const listId = useId();
  const emp = findEmployee(value);
  return (
    <div className={`field${value && !emp ? ' has-error' : ''}`}>
      <label>{label}{required ? <span className="req">*</span> : null}</label>
      <input
        list={listId}
        value={value}
        autoFocus={autoFocus}
        placeholder="Type ID or name, e.g. EMP-1042"
        onChange={(e) => {
          const v = e.target.value;
          // Picking "EMP-1042 — Ravi Kumar" from the list keeps just the ID.
          onChange(v.includes(' — ') ? v.split(' — ')[0] : v);
        }}
      />
      <datalist id={listId}>
        {employees.map((e) => <option key={e.id} value={`${e.id} — ${e.name}`}>{e.department}</option>)}
      </datalist>
      {value && !emp ? <span className="error-text">No employee with this ID</span> : null}
    </div>
  );
}

/** Pick-a-patient list for the nurse / doctor / pharmacy queues. */
export function QueueList({ visits, selectedId, onSelect, empty }) {
  if (!visits.length) return <Empty title="Queue is clear">{empty}</Empty>;
  return (
    <div className="ohc-queue">
      {visits.map((v, i) => {
        const emp = findEmployee(v.employee_id);
        return (
          <button
            key={v.id}
            type="button"
            className={`ohc-queue-item${v.id === selectedId ? ' is-active' : ''}`}
            style={{ animationDelay: `${i * 45}ms` }}
            onClick={() => onSelect(v.id)}
          >
            <span className="ohc-token">{v.token}</span>
            <span className="ohc-queue-main">
              <span className="ohc-queue-name">{emp?.name || v.employee_id}</span>
              <span className="ohc-queue-sub">{v.employee_id} • {v.complaint} • {fmtTime(v.created_at)}</span>
            </span>
            {v.priority !== 'Normal' ? <span className="pill pill-red">Priority</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function VitalsGrid({ vitals }) {
  if (!vitals) return null;
  const flags = vitalFlags(vitals);
  const items = [
    ['BP', `${vitals.bp_sys}/${vitals.bp_dia}`, 'mmHg'],
    ['Temp', vitals.temp, '°F'],
    ['Pulse', vitals.pulse, 'bpm'],
    ['SpO₂', vitals.spo2, '%'],
    ['Weight', vitals.weight, 'kg'],
    ['BMI', bmi(vitals) || '—', ''],
  ];
  return (
    <div>
      <div className="ohc-vitals">
        {items.map(([k, v, u]) => (
          <div key={k} className="ohc-vital">
            <span>{k}</span>
            <b>{v}<small> {u}</small></b>
          </div>
        ))}
      </div>
      <div className="ohc-flags">
        {flags.length ? flags.map((f) => <span key={f} className="pill pill-red">{f}</span>) : <span className="pill pill-green">Vitals normal</span>}
        {vitals.allergy && !/^(none|no known)/i.test(vitals.allergy) ? <span className="pill pill-orange">Allergy: {vitals.allergy}</span> : null}
      </div>
    </div>
  );
}

/** Horizontal labelled bars (share of total) — used for complaints / departments. */
export function BarList({ rows, color = 'var(--blue-600)', suffix = '' }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="ohc-barlist">
      {rows.map((r, i) => (
        <div key={r.label} className="ohc-barlist-row">
          <span className="ohc-barlist-label">{r.label}</span>
          <span className="ohc-barlist-track">
            <span className="ohc-barlist-fill" style={{ width: `${(r.value / max) * 100}%`, background: color, animationDelay: `${i * 60}ms` }} />
          </span>
          <b>{r.value}{suffix}</b>
        </div>
      ))}
    </div>
  );
}
