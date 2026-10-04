// Demo data for the OHC module, generated relative to today so the dashboard,
// queue and follow-ups always look current. A fixed-seed PRNG keeps the
// history identical between resets.

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};
const at = (days, hour, min) => {
  const d = shift(days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const monthEnd = (monthsAhead) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthsAhead + 1, 0);
  return dayKey(d);
};

function prng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EMPLOYEES = [
  ['EMP-1042', 'Ravi Kumar', 'Production', 'Operator', 'Male', 34, 'B+', 'None reported'],
  ['EMP-0871', 'Suresh B', 'Maintenance', 'Technician', 'Male', 41, 'O+', 'None reported'],
  ['EMP-0314', 'Mahesh R', 'Warehouse', 'Store Executive', 'Male', 29, 'A+', 'Dust'],
  ['EMP-0655', 'Priya N', 'Production', 'Supervisor', 'Female', 32, 'AB+', 'None reported'],
  ['EMP-0422', 'Arun S', 'Utility', 'Boiler Operator', 'Male', 45, 'B-', 'None reported'],
  ['EMP-0770', 'Kiran P', 'Maintenance', 'Electrician', 'Male', 27, 'O-', 'Penicillin'],
  ['EMP-0518', 'Lakshmi V', 'Quality', 'QC Inspector', 'Female', 30, 'A-', 'None reported'],
  ['EMP-0903', 'Manoj T', 'Production', 'Operator', 'Male', 38, 'B+', 'None reported'],
  ['EMP-0127', 'Anitha K', 'Admin', 'HR Executive', 'Female', 35, 'O+', 'None reported'],
  ['EMP-0689', 'Venkatesh M', 'Warehouse', 'Forklift Operator', 'Male', 43, 'A+', 'Sulfa drugs'],
  ['EMP-0244', 'Deepak J', 'Utility', 'Technician', 'Male', 31, 'B+', 'None reported'],
  ['EMP-0956', 'Sunita R', 'Quality', 'Lab Analyst', 'Female', 28, 'AB-', 'None reported'],
  ['EMP-0381', 'Ganesh H', 'Production', 'Line Leader', 'Male', 39, 'O+', 'None reported'],
  ['EMP-0733', 'Rekha D', 'Production', 'Operator', 'Female', 26, 'B+', 'None reported'],
  ['EMP-0462', 'Prakash L', 'Maintenance', 'Fitter', 'Male', 48, 'A+', 'Aspirin'],
  ['EMP-0599', 'Naveen C', 'Warehouse', 'Loader', 'Male', 24, 'O+', 'None reported'],
  ['EMP-0812', 'Divya S', 'Admin', 'Accounts Officer', 'Female', 33, 'B+', 'None reported'],
  ['EMP-0175', 'Rajesh G', 'Production', 'Operator', 'Male', 36, 'A-', 'None reported'],
  ['EMP-0640', 'Shankar B', 'Utility', 'Chiller Operator', 'Male', 50, 'B+', 'None reported'],
  ['EMP-0298', 'Kavya M', 'Quality', 'QA Engineer', 'Female', 29, 'O+', 'None reported'],
  ['EMP-0887', 'Imran K', 'Maintenance', 'Welder', 'Male', 37, 'AB+', 'None reported'],
  ['EMP-0533', 'Pooja A', 'Production', 'Operator', 'Female', 25, 'A+', 'None reported'],
  ['EMP-0411', 'Ramesh Y', 'Warehouse', 'Supervisor', 'Male', 44, 'O-', 'None reported'],
  ['EMP-0760', 'Sneha T', 'Admin', 'EHS Officer', 'Female', 31, 'B-', 'None reported'],
];

// complaint → [diagnosis, medicine id, dose, qty]
const CLINICAL = {
  Headache: ['Tension-type headache', 'M1', '1 tablet • SOS', 2],
  Cold: ['Common cold', 'M5', '1 tablet • night', 3],
  Fever: ['Viral fever', 'M1', '1 tablet • TDS', 6],
  'Body Pain': ['Myalgia', 'M6', '1 tablet • BD after food', 4],
  'Stomach Pain': ['Gastritis', 'M10', '1 tablet • before food', 3],
  'Minor Injury': ['Superficial abrasion', 'M8', 'Apply & dress', 1],
  'Eye Irritation': ['Foreign body sensation — irrigated', 'M9', '2 drops • QID', 1],
  Dizziness: ['Dehydration', 'M2', '1 sachet in 1 L water', 2],
  Acidity: ['Hyperacidity', 'M3', '2 tsp • after food', 1],
  Other: ['General malaise', 'M4', '1 tablet • OD', 5],
};
const COMPLAINT_WEIGHTS = [['Headache', 24], ['Cold', 11], ['Fever', 9], ['Body Pain', 11], ['Stomach Pain', 7], ['Minor Injury', 10], ['Eye Irritation', 6], ['Dizziness', 6], ['Acidity', 8], ['Other', 8]];

function pickWeighted(rand) {
  const total = COMPLAINT_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [c, w] of COMPLAINT_WEIGHTS) {
    r -= w;
    if (r <= 0) return c;
  }
  return 'Other';
}

const DOCTOR = 'Dr. Priya R. (MBBS)';
const NURSE = 'Nurse Anitha';

export function buildSeed() {
  const rand = prng(20261003);
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

  const employees = EMPLOYEES.map(([id, name, department, role, gender, age, blood_group, allergy]) => ({
    id, name, department, role, gender, age, blood_group, allergy, phone: `98${String(int(10000000, 99999999))}`, created_at: at(-400, 9, 0),
  }));

  const medicines = [
    { id: 'M1', name: 'Paracetamol 500 mg', category: 'Analgesic', unit: 'tabs', batch: 'PCM2408', expiry: monthEnd(10), stock: 85, reorder: 100 },
    { id: 'M2', name: 'ORS Sachet', category: 'Electrolyte', unit: 'sachets', batch: 'ORS1182', expiry: monthEnd(2), stock: 48, reorder: 50 },
    { id: 'M3', name: 'Antacid Suspension', category: 'Antacid', unit: 'bottles', batch: 'ANT4410', expiry: monthEnd(17), stock: 31, reorder: 10 },
    { id: 'M4', name: 'Vitamin C 500 mg', category: 'Supplement', unit: 'tabs', batch: 'VTC2291', expiry: dayKey(shift(20)), stock: 72, reorder: 50 },
    { id: 'M5', name: 'Cetirizine 10 mg', category: 'Antihistamine', unit: 'tabs', batch: 'CTZ7731', expiry: monthEnd(14), stock: 240, reorder: 80 },
    { id: 'M6', name: 'Ibuprofen 400 mg', category: 'Analgesic', unit: 'tabs', batch: 'IBU5520', expiry: monthEnd(12), stock: 190, reorder: 80 },
    { id: 'M7', name: 'Diclofenac Gel 30 g', category: 'Topical', unit: 'tubes', batch: 'DCG3104', expiry: monthEnd(9), stock: 18, reorder: 10 },
    { id: 'M8', name: 'Povidone-Iodine Dressing', category: 'Dressing', unit: 'packs', batch: 'PVD8812', expiry: monthEnd(20), stock: 64, reorder: 30 },
    { id: 'M9', name: 'Lubricant Eye Drops', category: 'Ophthalmic', unit: 'vials', batch: 'LED2207', expiry: dayKey(shift(26)), stock: 22, reorder: 10 },
    { id: 'M10', name: 'Pantoprazole 40 mg', category: 'Antacid', unit: 'tabs', batch: 'PAN9045', expiry: monthEnd(15), stock: 150, reorder: 60 },
    { id: 'M11', name: 'Dicyclomine 10 mg', category: 'Antispasmodic', unit: 'tabs', batch: 'DCY1170', expiry: monthEnd(11), stock: 38, reorder: 40 },
    { id: 'M12', name: 'Silver Sulfadiazine Cream', category: 'Topical', unit: 'tubes', batch: 'SSD4428', expiry: dayKey(shift(-6)), stock: 6, reorder: 5 },
    { id: 'M13', name: 'Crepe Bandage 10 cm', category: 'Dressing', unit: 'rolls', batch: 'CRB6630', expiry: monthEnd(30), stock: 40, reorder: 15 },
  ];

  const visits = [];
  const prescriptions = [];
  const issues = [];
  let op = 0;
  let rxSeq = 0;
  let issueSeq = 0;

  const makeVisit = (days, hour, min, emp, complaint, stage) => {
    op += 1;
    const created = at(days, hour, min);
    const sameDay = visits.filter((v) => dayKey(new Date(v.created_at)) === dayKey(new Date(created))).length;
    const fever = complaint === 'Fever';
    const visit = {
      id: `V${op}`,
      op_number: `OHC-${created.slice(0, 4)}-${String(op).padStart(4, '0')}`,
      token: String(sameDay + 1).padStart(3, '0'),
      employee_id: emp.id,
      department: emp.department,
      created_at: created,
      visit_type: complaint === 'Minor Injury' ? 'Injury on Duty' : 'Normal OHC Visit',
      complaint,
      complaint_text: `${complaint} reported at work.`,
      priority: complaint === 'Minor Injury' ? 'Priority' : 'Normal',
      stage: 'nurse',
      nurse: null,
      doctor: null,
      rx_id: null,
    };
    if (stage === 'nurse') return visit;

    const doctorNeeded = stage !== 'completed-nurse';
    visit.nurse = {
      nurse: NURSE,
      bp_sys: int(110, 132), bp_dia: int(70, 86),
      temp: fever ? (100 + rand() * 1.8).toFixed(1) : (97.8 + rand() * 1).toFixed(1),
      pulse: fever ? int(92, 104) : int(68, 88),
      spo2: int(96, 99),
      weight: int(52, 84), height: int(155, 180),
      allergy: emp.allergy,
      observation: fever ? 'Febrile, alert and oriented.' : 'Alert and oriented. Vitals within normal limits.',
      at: at(days, hour, min + 8),
    };
    if (!doctorNeeded) {
      visit.stage = 'completed';
      visit.closed_at = visit.nurse.at;
      return visit;
    }
    visit.stage = 'doctor';
    if (stage === 'doctor') return visit;

    const [diagnosis, medId, dose, qty] = CLINICAL[complaint];
    const dAt = at(days, hour, min + 20);
    visit.doctor = {
      doctor: DOCTOR, diagnosis, duration: `${int(1, 3)} day(s)`,
      fitness: complaint === 'Fever' && rand() > 0.5 ? 'Rest Advised' : rand() > 0.8 ? 'Fit with Advice' : 'Fit for Work',
      notes: 'History reviewed. Vital signs stable. Supportive treatment advised.',
      advice: 'Hydration & rest', referral: 'No referral', follow_up_date: '', at: dAt,
    };
    rxSeq += 1;
    const med = medicines.find((m) => m.id === medId);
    const rx = {
      id: `RX${rxSeq}`, rx_no: `RX-${String(rxSeq).padStart(4, '0')}`, visit_id: visit.id, employee_id: emp.id,
      doctor: DOCTOR, diagnosis, advice: visit.doctor.advice,
      items: [{ medicine_id: medId, name: med.name, dose, duration: visit.doctor.duration, qty }],
      status: stage === 'pharmacy' ? 'pending' : 'issued', created_at: dAt,
    };
    visit.rx_id = rx.id;
    if (stage === 'pharmacy') {
      visit.stage = 'pharmacy';
    } else {
      rx.issued_at = at(days, hour, min + 26);
      rx.issued_by = 'Pharmacist Ramya';
      issueSeq += 1;
      issues.push({ id: `IS${issueSeq}`, medicine_id: medId, qty, employee_id: emp.id, rx_id: rx.id, at: rx.issued_at, by: rx.issued_by });
      visit.stage = 'completed';
      visit.closed_at = rx.issued_at;
    }
    prescriptions.push(rx);
    return visit;
  };

  // History: last 45 days, Sundays quieter.
  for (let d = -45; d <= -1; d += 1) {
    const sunday = shift(d).getDay() === 0;
    const count = sunday ? int(3, 6) : int(14, 26);
    for (let i = 0; i < count; i += 1) {
      const emp = employees[int(0, employees.length - 1)];
      const complaint = pickWeighted(rand);
      const minutes = 8 * 60 + Math.floor((i / count) * 9 * 60) + int(0, 15);
      visits.push(makeVisit(d, Math.floor(minutes / 60), minutes % 60, emp, complaint, rand() < 0.46 ? 'completed-nurse' : 'completed'));
    }
  }

  // Today's queue (fixed so the demo walks through every stage).
  const byId = (id) => employees.find((e) => e.id === id);
  const today = [
    ['EMP-0314', 'Cold', 'completed'], ['EMP-0518', 'Eye Irritation', 'completed-nurse'], ['EMP-0903', 'Body Pain', 'completed'],
    ['EMP-0689', 'Minor Injury', 'completed'], ['EMP-0127', 'Acidity', 'completed-nurse'], ['EMP-0381', 'Headache', 'completed'],
    ['EMP-0244', 'Dizziness', 'completed-nurse'], ['EMP-0733', 'Stomach Pain', 'pharmacy'], ['EMP-0871', 'Fever', 'nurse'],
    ['EMP-1042', 'Headache', 'doctor'],
  ];
  today.forEach(([id, complaint, stage], i) => {
    const minutes = 8 * 60 + 30 + i * 28;
    visits.push(makeVisit(0, Math.floor(minutes / 60), minutes % 60, byId(id), complaint, stage));
  });

  const followups = [
    { id: 'FU-0001', employee_id: 'EMP-0871', reason: 'Fever', action: 'Doctor review', review_date: dayKey(shift(1)), status: 'open' },
    { id: 'FU-0002', employee_id: 'EMP-0422', reason: 'Back pain', action: 'Referral — Hospital / Specialist', review_date: dayKey(shift(1)), status: 'referred' },
    { id: 'FU-0003', employee_id: 'EMP-0770', reason: 'Injury review', action: 'OHC follow-up', review_date: dayKey(shift(0)), status: 'completed', notes: 'Wound healing well. Dressing changed.', closed_at: at(0, 10, 15) },
    { id: 'FU-0004', employee_id: 'EMP-0462', reason: 'Hypertension monitoring', action: 'BP check', review_date: dayKey(shift(-1)), status: 'open' },
    { id: 'FU-0005', employee_id: 'EMP-0655', reason: 'Migraine', action: 'Doctor review', review_date: dayKey(shift(0)), status: 'open' },
    { id: 'FU-0006', employee_id: 'EMP-0640', reason: 'Diabetes review', action: 'Doctor review', review_date: dayKey(shift(5)), status: 'open' },
    { id: 'FU-0007', employee_id: 'EMP-0887', reason: 'Welding flash burn — eye', action: 'Referral — Hospital / Specialist', review_date: dayKey(shift(-12)), status: 'completed', notes: 'Ophthalmologist cleared. Fit for work.', closed_at: at(-12, 15, 0) },
    { id: 'FU-0008', employee_id: 'EMP-1042', reason: 'Fever', action: 'Referral — Hospital / Specialist', review_date: dayKey(shift(-30)), status: 'completed', notes: 'External referral closed.', closed_at: at(-30, 12, 0) },
  ].map((f) => ({ visit_id: null, notes: '', created_at: at(-2, 9, 0), ...f }));

  return {
    version: 1,
    employees,
    medicines,
    visits: visits.reverse(),
    prescriptions: prescriptions.reverse(),
    issues: issues.reverse(),
    followups,
    seq: { op, rx: rxSeq, issue: issueSeq, fu: followups.length, med: medicines.length },
    settings: {
      ohc_open: true,
      workforce: 1000,
      doctor: DOCTOR,
      nurse: NURSE,
      pharmacist: 'Pharmacist Ramya',
      expiry_days: 30,
      auto_backup: true,
      low_stock_alerts: true,
      followup_reminders: true,
      opening_hours: '08:00 – 20:00',
    },
  };
}
