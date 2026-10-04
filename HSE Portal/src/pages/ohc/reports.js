import { downloadPdf, downloadExcel } from './ohcExport';
import {
  getOhc, findEmployee, todayKey, dayKey, addDays, fmtDate, fmtDateTime, fmtTime, fmtMonth,
  STAGES, medicineStatus, followupStatus, vitalFlags, bmi, DEPARTMENTS, COMPLAINTS,
} from './store';

const name = (id) => findEmployee(id)?.name || '—';
const vitalsText = (n) => (n ? `BP ${n.bp_sys}/${n.bp_dia} • T ${n.temp}°F • P ${n.pulse} • SpO₂ ${n.spo2}%` : '—');
const outcome = (v) => v.doctor?.fitness || (v.stage === 'completed' ? 'Treated by nurse' : STAGES[v.stage].label);
const monthStart = () => `${todayKey().slice(0, 8)}01`;

export const visitsInRange = (from, to) => getOhc().visits.filter((v) => {
  const d = dayKey(v.created_at);
  return d >= from && d <= to;
});

/* ---------- analytics shared by dashboard / reports ---------- */

export function complaintBreakdown(visits) {
  const counts = Object.fromEntries(COMPLAINTS.map((c) => [c, 0]));
  visits.forEach((v) => { counts[v.complaint] = (counts[v.complaint] || 0) + 1; });
  const total = visits.length || 1;
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export function departmentBreakdown(visits) {
  return DEPARTMENTS.map((d) => ({ label: d, value: visits.filter((v) => v.department === d).length }));
}

export function medicineConsumption(from, to) {
  const { issues, medicines } = getOhc();
  const rows = new Map();
  issues.forEach((i) => {
    const d = dayKey(i.at);
    if (d < from || d > to) return;
    const m = medicines.find((x) => x.id === i.medicine_id);
    const r = rows.get(i.medicine_id) || { name: m?.name || '?', unit: m?.unit || '', qty: 0, tx: 0, stock: m?.stock ?? 0 };
    r.qty += i.qty;
    r.tx += 1;
    rows.set(i.medicine_id, r);
  });
  return [...rows.values()].sort((a, b) => b.qty - a.qty);
}

export function monthlyKpis() {
  const { followups } = getOhc();
  const from = monthStart();
  const to = todayKey();
  const visits = visitsInRange(from, to);
  const consults = visits.filter((v) => v.doctor).length;
  const issued = medicineConsumption(from, to).reduce((s, r) => s + r.qty, 0);
  const monthFu = followups.filter((f) => f.review_date >= from && f.review_date <= to);
  const done = monthFu.filter((f) => f.status === 'completed').length;
  const referrals = visits.filter((v) => v.doctor?.referral && v.doctor.referral !== 'No referral').length
    + followups.filter((f) => f.action.startsWith('Referral') && f.created_at.slice(0, 10) >= from && !f.visit_id).length;
  return {
    visits: visits.length,
    consults,
    issued,
    referrals,
    followupRate: monthFu.length ? Math.round((done / monthFu.length) * 100) : 100,
    restAdvised: visits.filter((v) => v.doctor?.fitness === 'Rest Advised').length,
  };
}

/* ---------- PDFs ---------- */

export function opSlipPdf(visit) {
  const emp = findEmployee(visit.employee_id);
  return downloadPdf({
    title: `OP Slip — Token ${visit.token}`,
    subtitle: visit.op_number,
    filename: `${visit.op_number}.pdf`,
    blocks: [
      { heading: 'Registration', kv: [['OP Number', visit.op_number], ['Token', visit.token], ['Employee', `${emp?.id} • ${emp?.name}`], ['Department', visit.department], ['Visit Type', visit.visit_type], ['Priority', visit.priority], ['Registered', fmtDateTime(visit.created_at)], ['Primary Complaint', visit.complaint]] },
      { heading: 'Complaint', text: visit.complaint_text || visit.complaint },
    ],
  });
}

export function visitPdf(visit) {
  const emp = findEmployee(visit.employee_id);
  const n = visit.nurse;
  const d = visit.doctor;
  const rx = getOhc().prescriptions.find((r) => r.id === visit.rx_id);
  const blocks = [
    { heading: 'Patient', kv: [['Employee', `${emp?.id} • ${emp?.name}`], ['Department', visit.department], ['Age / Gender', `${emp?.age ?? '—'} / ${emp?.gender ?? '—'}`], ['Blood Group', emp?.blood_group], ['OP Number', visit.op_number], ['Date', fmtDateTime(visit.created_at)], ['Complaint', visit.complaint], ['Status', STAGES[visit.stage].label]] },
  ];
  if (n) blocks.push({ heading: 'Nurse Assessment', kv: [['Nurse', n.nurse], ['Blood Pressure', `${n.bp_sys}/${n.bp_dia} mmHg`], ['Temperature', `${n.temp} °F`], ['Pulse', `${n.pulse} bpm`], ['SpO₂', `${n.spo2} %`], ['Weight / Height', `${n.weight} kg / ${n.height} cm`], ['BMI', bmi(n) || '—'], ['Allergy', n.allergy], ['Flags', vitalFlags(n).join(', ') || 'None']] }, { text: n.observation });
  if (d) blocks.push({ heading: 'Doctor Consultation', kv: [['Doctor', d.doctor], ['Diagnosis', d.diagnosis], ['Duration', d.duration], ['Fitness', d.fitness], ['Advice', d.advice], ['Referral', d.referral], ['Follow-up', d.follow_up_date ? fmtDate(d.follow_up_date) : 'None']] }, { text: d.notes });
  if (rx) blocks.push({ heading: `Prescription ${rx.rx_no}`, columns: ['Medicine', 'Dose / Frequency', 'Duration', 'Qty'], widths: [3, 3, 1.5, 1], rows: rx.items.map((i) => [i.name, i.dose, i.duration, i.qty]) });
  return downloadPdf({ title: 'OHC Visit Record', subtitle: `${visit.op_number} • ${emp?.name}`, filename: `${visit.op_number}-record.pdf`, blocks });
}

export function prescriptionPdf(rx) {
  const emp = findEmployee(rx.employee_id);
  return downloadPdf({
    title: `Prescription ${rx.rx_no}`,
    subtitle: `${rx.doctor} • ${fmtDateTime(rx.created_at)}`,
    filename: `${rx.rx_no}.pdf`,
    blocks: [
      { heading: 'Patient', kv: [['Employee', `${emp?.id} • ${emp?.name}`], ['Department', emp?.department], ['Age / Gender', `${emp?.age ?? '—'} / ${emp?.gender ?? '—'}`], ['Known Allergy', emp?.allergy], ['Diagnosis', rx.diagnosis], ['Status', rx.status === 'issued' ? `Issued ${fmtDateTime(rx.issued_at)}` : 'Pending issue']] },
      { heading: 'Rx', columns: ['Medicine', 'Dose / Frequency', 'Duration', 'Qty'], widths: [3, 3, 1.5, 1], rows: rx.items.map((i) => [i.name, i.dose, i.duration, i.qty]) },
      { heading: 'Advice', text: rx.advice || '—' },
    ],
  });
}

export function employeeHistoryPdf(empId) {
  const emp = findEmployee(empId);
  const { visits, followups } = getOhc();
  const mine = visits.filter((v) => v.employee_id === emp.id);
  const last = mine.find((v) => v.nurse)?.nurse;
  return downloadPdf({
    title: 'Employee Medical History',
    subtitle: `${emp.id} • ${emp.name} • ${emp.department}`,
    filename: `${emp.id}-medical-history.pdf`,
    blocks: [
      { heading: 'Health Profile', kv: [['Name', emp.name], ['Employee ID', emp.id], ['Department / Role', `${emp.department} / ${emp.role}`], ['Age / Gender', `${emp.age} / ${emp.gender}`], ['Blood Group', emp.blood_group], ['Allergy', emp.allergy], ['Last BP', last ? `${last.bp_sys}/${last.bp_dia}` : '—'], ['Last Weight', last ? `${last.weight} kg` : '—'], ['Total OHC Visits', mine.length], ['Referrals', followups.filter((f) => f.employee_id === emp.id && f.action.startsWith('Referral')).length]] },
      { heading: 'Visit Timeline', columns: ['Date', 'OP No.', 'Complaint', 'Vitals', 'Diagnosis', 'Outcome'], widths: [1.4, 1.5, 1.3, 2.6, 2, 1.4], rows: mine.map((v) => [fmtDate(v.created_at), v.op_number, v.complaint, vitalsText(v.nurse), v.doctor?.diagnosis || '—', outcome(v)]) },
      { heading: 'Follow-ups & Referrals', columns: ['Review Date', 'Reason', 'Action', 'Status', 'Notes'], widths: [1.3, 2, 2, 1.2, 2.5], rows: followups.filter((f) => f.employee_id === emp.id).map((f) => [fmtDate(f.review_date), f.reason, f.action, followupStatus(f).label, f.notes || '—']) },
    ],
  });
}

export function dailyReportPdf(date = todayKey()) {
  const visits = visitsInRange(date, date);
  const meds = medicineConsumption(date, date);
  const { followups } = getOhc();
  return downloadPdf({
    title: 'Daily OHC Report',
    subtitle: fmtDate(date),
    filename: `OHC-daily-${date}.pdf`,
    landscape: true,
    blocks: [
      { heading: 'Summary', kv: [['OP Visits', visits.length], ['Doctor Consultations', visits.filter((v) => v.doctor).length], ['Treated at Nurse Level', visits.filter((v) => v.nurse && !v.doctor && v.stage === 'completed').length], ['Still in Queue', visits.filter((v) => v.stage !== 'completed').length], ['Medicines Issued (units)', meds.reduce((s, r) => s + r.qty, 0)], ['Rest Advised', visits.filter((v) => v.doctor?.fitness === 'Rest Advised').length]] },
      { heading: 'OP Register', columns: ['Token', 'Time', 'OP No.', 'Employee', 'Dept.', 'Complaint', 'Vitals', 'Diagnosis', 'Outcome'], widths: [0.7, 0.8, 1.5, 2, 1.2, 1.2, 2.8, 2, 1.4], rows: [...visits].reverse().map((v) => [v.token, fmtTime(v.created_at), v.op_number, `${v.employee_id} ${name(v.employee_id)}`, v.department, v.complaint, vitalsText(v.nurse), v.doctor?.diagnosis || '—', outcome(v)]) },
      { heading: 'Medicines Issued', columns: ['Medicine', 'Qty', 'Transactions', 'Closing Stock'], widths: [3, 1, 1, 1], rows: meds.map((m) => [m.name, `${m.qty} ${m.unit}`, m.tx, m.stock]) },
      { heading: 'Follow-ups Due', columns: ['Employee', 'Reason', 'Action', 'Review Date', 'Status'], widths: [2, 2, 2, 1.2, 1.2], rows: followups.filter((f) => f.status !== 'completed' && f.review_date <= addDays(date, 1)).map((f) => [`${f.employee_id} ${name(f.employee_id)}`, f.reason, f.action, fmtDate(f.review_date), followupStatus(f).label]) },
    ],
  });
}

/* ---------- Excel ---------- */

const visitColumns = [
  { header: 'OP Number', width: 16 }, { header: 'Token', width: 8 }, { header: 'Date', width: 13 }, { header: 'Time', width: 9 },
  { header: 'Employee ID', width: 12 }, { header: 'Name', width: 18 }, { header: 'Department', width: 14 }, { header: 'Visit Type', width: 18 },
  { header: 'Complaint', width: 14 }, { header: 'BP', width: 10 }, { header: 'Temp °F', width: 9 }, { header: 'Pulse', width: 8 }, { header: 'SpO₂', width: 8 },
  { header: 'Diagnosis', width: 24 }, { header: 'Fitness', width: 14 }, { header: 'Referral', width: 18 }, { header: 'Stage', width: 11 },
];
const visitRow = (v) => [
  v.op_number, v.token, fmtDate(v.created_at), fmtTime(v.created_at), v.employee_id, name(v.employee_id), v.department, v.visit_type,
  v.complaint, v.nurse ? `${v.nurse.bp_sys}/${v.nurse.bp_dia}` : '', v.nurse?.temp ?? '', v.nurse?.pulse ?? '', v.nurse?.spo2 ?? '',
  v.doctor?.diagnosis ?? '', v.doctor?.fitness ?? (v.stage === 'completed' ? 'Treated by nurse' : ''), v.doctor?.referral ?? '', STAGES[v.stage].label,
];

export function visitsExcel(visits, filename) {
  return downloadExcel({ filename, sheets: [{ name: 'OP Visits', columns: visitColumns, rows: visits.map(visitRow) }] });
}

export function monthlyMisExcel() {
  const from = monthStart();
  const to = todayKey();
  const visits = visitsInRange(from, to);
  const k = monthlyKpis();
  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return downloadExcel({
    filename: `OHC-monthly-MIS-${to.slice(0, 7)}.xlsx`,
    sheets: [
      { name: 'KPIs', columns: [{ header: 'KPI', width: 30 }, { header: 'Value', width: 14 }], rows: [['Month', fmtMonth(from)], ['Total OP visits', k.visits], ['Doctor consultations', k.consults], ['Medicines issued (units)', k.issued], ['External referrals', k.referrals], ['Rest advised', k.restAdvised], ['Follow-ups completed', `${k.followupRate}%`]] },
      { name: 'Daily Trend', columns: [{ header: 'Date', width: 14 }, { header: 'OP Visits', width: 12 }, { header: 'Consultations', width: 14 }], rows: days.map((d) => { const dv = visits.filter((v) => dayKey(v.created_at) === d); return [fmtDate(d), dv.length, dv.filter((v) => v.doctor).length]; }) },
      { name: 'Complaints', columns: [{ header: 'Complaint', width: 18 }, { header: 'Visits', width: 10 }, { header: 'Share %', width: 10 }], rows: complaintBreakdown(visits).map((c) => [c.label, c.value, c.pct]) },
      { name: 'Departments', columns: [{ header: 'Department', width: 16 }, { header: 'Visits', width: 10 }], rows: departmentBreakdown(visits).map((d) => [d.label, d.value]) },
      { name: 'OP Register', columns: visitColumns, rows: visits.map(visitRow) },
    ],
  });
}

export function medicineConsumptionExcel() {
  const from = monthStart();
  const to = todayKey();
  const { issues, medicines } = getOhc();
  return downloadExcel({
    filename: `OHC-medicine-consumption-${to.slice(0, 7)}.xlsx`,
    sheets: [
      { name: 'Summary', columns: [{ header: 'Medicine', width: 28 }, { header: 'Qty Issued', width: 12 }, { header: 'Unit', width: 10 }, { header: 'Transactions', width: 13 }, { header: 'Current Stock', width: 14 }], rows: medicineConsumption(from, to).map((r) => [r.name, r.qty, r.unit, r.tx, r.stock]) },
      { name: 'Transactions', columns: [{ header: 'Date', width: 18 }, { header: 'Medicine', width: 26 }, { header: 'Qty', width: 8 }, { header: 'Employee', width: 22 }, { header: 'Against', width: 12 }, { header: 'Issued By', width: 18 }], rows: issues.filter((i) => dayKey(i.at) >= from).map((i) => [fmtDateTime(i.at), medicines.find((m) => m.id === i.medicine_id)?.name, i.qty, i.employee_id ? `${i.employee_id} ${name(i.employee_id)}` : '—', getOhc().prescriptions.find((r) => r.id === i.rx_id)?.rx_no || 'Direct issue', i.by || '—']) },
    ],
  });
}

export function inventoryExcel() {
  return downloadExcel({
    filename: `OHC-medicine-inventory-${todayKey()}.xlsx`,
    sheets: [{
      name: 'Inventory',
      columns: [{ header: 'Medicine', width: 28 }, { header: 'Category', width: 14 }, { header: 'Batch', width: 12 }, { header: 'Expiry', width: 13 }, { header: 'Available', width: 11 }, { header: 'Unit', width: 9 }, { header: 'Reorder Level', width: 13 }, { header: 'Status', width: 14 }],
      rows: getOhc().medicines.map((m) => [m.name, m.category, m.batch, fmtDate(m.expiry), m.stock, m.unit, m.reorder, medicineStatus(m).label]),
    }],
  });
}

export function inventoryPdf() {
  return downloadPdf({
    title: 'Medicine Inventory',
    filename: `OHC-medicine-inventory-${todayKey()}.pdf`,
    blocks: [{ heading: 'Stock Position', columns: ['Medicine', 'Batch', 'Expiry', 'Available', 'Reorder', 'Status'], widths: [3, 1.3, 1.3, 1.2, 1, 1.5], rows: getOhc().medicines.map((m) => [m.name, m.batch, fmtDate(m.expiry), `${m.stock} ${m.unit}`, m.reorder, medicineStatus(m).label]) }],
  });
}

export function employeesExcel(list) {
  const { visits } = getOhc();
  return downloadExcel({
    filename: `OHC-employee-master-${todayKey()}.xlsx`,
    sheets: [{
      name: 'Employees',
      columns: [{ header: 'Employee ID', width: 12 }, { header: 'Name', width: 20 }, { header: 'Department', width: 14 }, { header: 'Role', width: 18 }, { header: 'Gender', width: 9 }, { header: 'Age', width: 6 }, { header: 'Blood Group', width: 11 }, { header: 'Allergy', width: 16 }, { header: 'Phone', width: 13 }, { header: 'OHC Visits', width: 10 }, { header: 'Last Visit', width: 13 }],
      rows: list.map((e) => { const mine = visits.filter((v) => v.employee_id === e.id); return [e.id, e.name, e.department, e.role, e.gender, e.age, e.blood_group, e.allergy, e.phone, mine.length, mine[0] ? fmtDate(mine[0].created_at) : '—']; }),
    }],
  });
}

export function employeeHistoryExcel() {
  const { visits } = getOhc();
  return downloadExcel({
    filename: `OHC-employee-medical-history-${todayKey()}.xlsx`,
    sheets: [
      { name: 'By Employee', columns: [{ header: 'Employee ID', width: 12 }, { header: 'Name', width: 20 }, { header: 'Department', width: 14 }, { header: 'Visits (all)', width: 11 }, { header: 'Consultations', width: 13 }, { header: 'Most Frequent Complaint', width: 22 }, { header: 'Last Visit', width: 13 }], rows: getOhc().employees.map((e) => { const mine = visits.filter((v) => v.employee_id === e.id); const top = complaintBreakdown(mine)[0]; return [e.id, e.name, e.department, mine.length, mine.filter((v) => v.doctor).length, mine.length ? top.label : '—', mine[0] ? fmtDate(mine[0].created_at) : '—']; }) },
      { name: 'All Visits', columns: visitColumns, rows: visits.map(visitRow) },
    ],
  });
}

export function followupsExcel(list = getOhc().followups, filename = `OHC-referral-followup-${todayKey()}.xlsx`) {
  return downloadExcel({
    filename,
    sheets: [{
      name: 'Follow-ups & Referrals',
      columns: [{ header: 'ID', width: 10 }, { header: 'Employee ID', width: 12 }, { header: 'Name', width: 18 }, { header: 'Reason', width: 24 }, { header: 'Action', width: 30 }, { header: 'Review Date', width: 13 }, { header: 'Status', width: 13 }, { header: 'Closure Notes', width: 30 }],
      rows: list.map((f) => [f.id, f.employee_id, name(f.employee_id), f.reason, f.action, fmtDate(f.review_date), followupStatus(f).label, f.notes || '']),
    }],
  });
}

export function prescriptionsExcel(list) {
  return downloadExcel({
    filename: `OHC-prescriptions-${todayKey()}.xlsx`,
    sheets: [{
      name: 'Prescriptions',
      columns: [{ header: 'Rx No.', width: 11 }, { header: 'Date', width: 18 }, { header: 'Employee', width: 22 }, { header: 'Doctor', width: 20 }, { header: 'Diagnosis', width: 24 }, { header: 'Medicines', width: 40 }, { header: 'Status', width: 13 }, { header: 'Issued At', width: 18 }],
      rows: list.map((r) => [r.rx_no, fmtDateTime(r.created_at), `${r.employee_id} ${name(r.employee_id)}`, r.doctor, r.diagnosis, r.items.map((i) => `${i.name} × ${i.qty}`).join(', '), r.status === 'issued' ? 'Issued' : 'Pending Issue', r.issued_at ? fmtDateTime(r.issued_at) : '']),
    }],
  });
}

export function departmentAnalysisExcel() {
  const from = monthStart();
  const to = todayKey();
  const visits = visitsInRange(from, to);
  return downloadExcel({
    filename: `OHC-department-analysis-${to.slice(0, 7)}.xlsx`,
    sheets: [{
      name: 'Department Analysis',
      columns: [{ header: 'Department', width: 16 }, { header: 'OP Visits', width: 11 }, { header: 'Consultations', width: 13 }, { header: 'Injuries', width: 10 }, { header: 'Rest Advised', width: 12 }, { header: 'Top Complaint', width: 18 }],
      rows: DEPARTMENTS.map((d) => { const dv = visits.filter((v) => v.department === d); return [d, dv.length, dv.filter((v) => v.doctor).length, dv.filter((v) => v.complaint === 'Minor Injury').length, dv.filter((v) => v.doctor?.fitness === 'Rest Advised').length, dv.length ? complaintBreakdown(dv)[0].label : '—']; }),
    }],
  });
}
