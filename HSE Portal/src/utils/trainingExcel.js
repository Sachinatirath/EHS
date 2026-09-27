import { employeeTrainingProfile, sessionAttendeeDetails, SHIFT_OPTIONS } from '../data/trainingData';

const HEADER_COLOR = 'FF1D4ED8';
const STATUS_FILL = {
  Valid: 'FFDCFCE7',
  Compliant: 'FFDCFCE7',
  'Expiring Soon': 'FFFEF3C7',
  'Training Due': 'FFFEF3C7',
  Expired: 'FFFEE2E2',
  'Action Required': 'FFDBEAFE',
  'Not Attended': 'FFF1F5F9',
  Absent: 'FFFEE2E2',
  Registered: 'FFDBEAFE',
  'Pending Certificate': 'FFFEF3C7',
};

// ISO (YYYY-MM-DD) → Date at UTC midnight so Excel shows the same calendar day.
const toDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

function addSheet(wb, name, columns, rows) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 16, style: c.date ? { numFmt: 'dd-mmm-yyyy' } : undefined }));

  const header = ws.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });

  rows.forEach((r) => {
    const row = ws.addRow(r);
    row.alignment = { vertical: 'top', wrapText: true };
    columns.forEach((c) => {
      const fill = c.status && STATUS_FILL[r[c.key]];
      if (fill) {
        const cell = row.getCell(c.key);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
        cell.font = { bold: true };
      }
    });
  });

  if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return ws;
}

/** Exports one training session's attendees (dates, certificate, expiry, status) to .xlsx. */
export async function exportSessionAttendeesExcel(session, attendees) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  addSheet(wb, session.id, [
    { header: 'Employee ID', key: 'empId', width: 13 },
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Training', key: 'training', width: 22 },
    { header: 'Attendance', key: 'attendance', width: 12 },
    { header: 'Started On', key: 'startDate', width: 13, date: true },
    { header: 'Completed On', key: 'completedOn', width: 13, date: true },
    { header: 'Score %', key: 'score', width: 9 },
    { header: 'Certificate No.', key: 'certNo', width: 14 },
    { header: 'Certificate Expiry', key: 'expiry', width: 14, date: true },
    { header: 'Days Left', key: 'daysLeft', width: 10 },
    { header: 'Status', key: 'status', width: 18, status: true },
  ], attendees.map((a) => ({
    ...a,
    training: session.topic,
    startDate: toDate(a.startDate),
    completedOn: toDate(a.completedOn),
    expiry: toDate(a.expiry),
    score: a.score ?? '',
    certNo: a.certNo || '',
    daysLeft: a.daysLeft ?? '',
  })));
  await download(wb, `${session.id}-attendees.xlsx`);
}

async function download(wb, filename) {
  const buffer = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const shiftLabel = (v) => SHIFT_OPTIONS.find((o) => o.value === v)?.label || v || '';

/** Exports the training register: one sheet of sessions and one of every attendee per session. */
export async function exportTrainingRegisterExcel(sessions, filename = 'training-register.xlsx') {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  const withAttendees = sessions.map((session) => ({ session, attendees: sessionAttendeeDetails(session, session.extraParticipants) }));

  addSheet(wb, 'Training Sessions', [
    { header: 'Session ID', key: 'id', width: 12 },
    { header: 'Training', key: 'topic', width: 24 },
    { header: 'Started On', key: 'startDate', width: 13, date: true },
    { header: 'Completed On', key: 'endDate', width: 13, date: true },
    { header: 'Trainer', key: 'trainer', width: 18 },
    { header: 'Location', key: 'location', width: 18 },
    { header: 'Shift', key: 'shift', width: 12 },
    { header: 'Certificate Validity (Months)', key: 'validity', width: 13 },
    { header: 'Nominated', key: 'nominated', width: 11 },
    { header: 'Attended', key: 'present', width: 10 },
    { header: 'Absent', key: 'absent', width: 9 },
    { header: 'Certificates Issued', key: 'certified', width: 12 },
    { header: 'Training Status', key: 'status', width: 13 },
    { header: 'HOD Review', key: 'hodReview', width: 20 },
    { header: 'Employees Attended', key: 'names', width: 40 },
  ], withAttendees.map(({ session, attendees }) => {
    const present = attendees.filter((a) => a.attendance === 'Present');
    return {
      id: session.id,
      topic: session.topic,
      startDate: toDate(session.startDate),
      endDate: toDate(session.endDate || session.startDate),
      trainer: session.trainer || '',
      location: session.location || '',
      shift: shiftLabel(session.shift),
      validity: session.validity || '',
      nominated: attendees.length,
      present: present.length,
      absent: attendees.filter((a) => a.attendance === 'Absent').length,
      certified: present.filter((a) => a.certNo).length,
      status: session.status,
      hodReview: session.hodReview,
      names: present.map((a) => `${a.name} (${a.empId})`).join(', '),
    };
  }));

  addSheet(wb, 'Session Attendees', [
    { header: 'Session ID', key: 'sessionId', width: 12 },
    { header: 'Training', key: 'training', width: 24 },
    { header: 'Trainer', key: 'trainer', width: 18 },
    { header: 'Location', key: 'location', width: 18 },
    { header: 'Shift', key: 'shift', width: 12 },
    { header: 'Employee ID', key: 'empId', width: 13 },
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Attendance', key: 'attendance', width: 12 },
    { header: 'Started On', key: 'startDate', width: 13, date: true },
    { header: 'Completed On', key: 'completedOn', width: 13, date: true },
    { header: 'Score %', key: 'score', width: 9 },
    { header: 'Certificate No.', key: 'certNo', width: 14 },
    { header: 'Certificate Expiry', key: 'expiry', width: 14, date: true },
    { header: 'Days Left', key: 'daysLeft', width: 10 },
    { header: 'Status', key: 'status', width: 18, status: true },
  ], withAttendees.flatMap(({ session, attendees }) => attendees.map((a) => ({
    ...a,
    sessionId: session.id,
    training: session.topic,
    trainer: session.trainer || '',
    location: session.location || '',
    shift: shiftLabel(session.shift),
    startDate: toDate(a.startDate),
    completedOn: toDate(a.completedOn),
    expiry: toDate(a.expiry),
    score: a.score ?? '',
    certNo: a.certNo || '',
    daysLeft: a.daysLeft ?? '',
  }))));

  await download(wb, filename);
}

/** Exports the employee training tracker (summary, attended trainings with expiry, not-attended) to .xlsx. */
export async function exportEmployeeTrackerExcel(employees, filename = 'employee-training-tracker.xlsx') {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  const profiles = employees.map((e) => employeeTrainingProfile(e));

  addSheet(wb, 'Employee Tracker', [
    { header: 'Employee ID', key: 'id', width: 13 },
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Employee Type', key: 'type', width: 13 },
    { header: 'Date of Joining', key: 'joined', width: 14, date: true },
    { header: 'HOD / Manager', key: 'hod', width: 16 },
    { header: 'Status', key: 'status', width: 16, status: true },
    { header: 'Compliance %', key: 'compliance', width: 12 },
    { header: 'Trainings Attended', key: 'attended', width: 11 },
    { header: 'Valid', key: 'valid', width: 8 },
    { header: 'Expiring ≤ 30 Days', key: 'expiring', width: 11 },
    { header: 'Expired', key: 'expired', width: 9 },
    { header: 'Not Attended', key: 'pending', width: 10 },
    { header: 'Next Expiring Training', key: 'nextTraining', width: 20 },
    { header: 'Next Expiry Date', key: 'nextExpiry', width: 14, date: true },
    { header: 'Mandatory Trainings Not Attended', key: 'pendingList', width: 34 },
  ], profiles.map(({ details, summary, pending, nextExpiry }) => ({
    id: details.id,
    name: details.name,
    department: details.department,
    role: details.role,
    type: details.type || '',
    joined: toDate(details.joined),
    hod: details.hod || '',
    status: details.status,
    compliance: Number(details.compliance) || 0,
    ...summary,
    nextTraining: nextExpiry?.training || '',
    nextExpiry: toDate(nextExpiry?.expiry),
    pendingList: pending.join(', '),
  })));

  addSheet(wb, 'Training Records', [
    { header: 'Employee ID', key: 'empId', width: 13 },
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Training', key: 'training', width: 22 },
    { header: 'Session ID', key: 'sessionId', width: 11 },
    { header: 'Attended On', key: 'date', width: 13, date: true },
    { header: 'Trainer', key: 'trainer', width: 18 },
    { header: 'Score %', key: 'score', width: 9 },
    { header: 'Certificate No.', key: 'certNo', width: 14 },
    { header: 'Validity (Months)', key: 'validity', width: 10 },
    { header: 'Expiry Date', key: 'expiry', width: 13, date: true },
    { header: 'Days Left', key: 'daysLeft', width: 10 },
    { header: 'Status', key: 'status', width: 15, status: true },
  ], profiles.flatMap(({ details, records }) => records.map((r) => ({
    ...r,
    name: details.name,
    department: details.department,
    date: toDate(r.date),
    expiry: toDate(r.expiry),
  }))));

  addSheet(wb, 'Not Attended', [
    { header: 'Employee ID', key: 'id', width: 13 },
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'HOD / Manager', key: 'hod', width: 16 },
    { header: 'Mandatory Training', key: 'training', width: 24 },
    { header: 'Status', key: 'status', width: 14, status: true },
  ], profiles.flatMap(({ details, pending }) => pending.map((training) => ({
    id: details.id,
    name: details.name,
    department: details.department,
    role: details.role,
    hod: details.hod || '',
    training,
    status: 'Not Attended',
  }))));

  await download(wb, filename);
}
