// Every department has three HODs, one per shift (A, B, C — same timings as
// the Audit & Training Plan). Work raised against a department is assigned to
// all three; whichever shift HOD acts first handles it for the department.

import { SHIFTS, currentShift } from './auditPlan';

export const SHIFT_KEYS = SHIFTS.map((s) => s.id);
export { SHIFTS, currentShift };

export function shiftLabel(key) {
  const s = SHIFTS.find((x) => x.id === key);
  return s ? `${s.label} HOD` : key;
}

const NAME_POOL = [
  'Manoj Kulkarni', 'Suresh Patil', 'Anil Deshmukh', 'Rekha Joshi', 'Neha Kapoor', 'Vivek Menon',
  'Farhan Sheikh', 'Prakash Jadhav', 'Sanjay Pawar', 'Kavita Naik', 'Rohit Shinde', 'Pooja Gokhale',
  'Amit Bhosale', 'Sneha Kale', 'Nitin More', 'Deepa Iyer', 'Ganesh Salunkhe', 'Meera Rao',
  'Kiran Chavan', 'Swati Gaikwad', 'Ajay Thakur', 'Priya Nair', 'Vikram Sawant', 'Anjali Mehta',
];

const slugOf = (name) => name.toLowerCase().replace(/[^a-z]+/g, '.');

/**
 * Build { [department]: { A: user, B: user, C: user } }.
 * `base` fields are spread into every user; ids start at `idBase`.
 */
export function buildShiftHods(departments, { base = {}, idBase = 100, codePrefix = 'HOD', nameOffset = 0 } = {}) {
  let n = 0;
  return Object.fromEntries(departments.map((dept) => [dept, Object.fromEntries(SHIFT_KEYS.map((shift) => {
    const name = NAME_POOL[(nameOffset + n) % NAME_POOL.length];
    const user = {
      ...base,
      id: idBase + n,
      employee_id: `${codePrefix}${String(n + 1).padStart(3, '0')}`,
      name,
      department: dept,
      shift,
      title: shiftLabel(shift),
      email: `${slugOf(name)}@example.com`,
      phone: `+91 98765 ${String(30000 + idBase + n).slice(-5)}`,
      address: `${dept} HOD Office, Plant Campus, Pune`,
    };
    n += 1;
    return [shift, user];
  }))]));
}
