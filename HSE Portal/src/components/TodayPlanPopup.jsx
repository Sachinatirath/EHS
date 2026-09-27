import { useState } from 'react';
import Modal from './Modal';
import { IconCalendarCheck, IconClock, IconCheckCircle } from './icons';
import {
  SHIFTS, currentShift, planDate, tasksForShift, tasksForDay, dateKey, loadDone,
} from '../data/auditPlan';

const SEEN_KEY = 'ehs-atp-popup-seen';

// Unique per plan day + shift, so the briefing pops up once at the start of
// every shift rather than on every page load.
function briefingKey() {
  return `${dateKey(planDate())}-${currentShift()}`;
}

function alreadySeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === briefingKey();
  } catch {
    return false;
  }
}

export default function TodayPlanPopup({ onViewPlan }) {
  const [open, setOpen] = useState(() => !alreadySeen());

  const date = planDate();
  const shiftId = currentShift();
  const shift = SHIFTS.find((s) => s.id === shiftId);
  const tasks = tasksForShift(date.getDate(), shiftId);
  const done = loadDone(dateKey(date));
  const dayTotal = tasksForDay(date.getDate()).length;

  const close = () => {
    try { localStorage.setItem(SEEN_KEY, briefingKey()); } catch { /* ignore */ }
    setOpen(false);
  };

  const viewPlan = () => {
    close();
    onViewPlan();
  };

  return (
    <Modal open={open} title="Today's Audit & Training Plan" onClose={close} width={560}>
      <div className="atp-popup-head">
        <div>
          <div className="atp-popup-date">
            {date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="atp-popup-sub">{dayTotal} activities planned today across all shifts</div>
        </div>
        <span className={`pill pill-${shift.variant}`}>
          <IconClock size={13} /> {shift.label} · {shift.time}
        </span>
      </div>

      {tasks.length ? (
        <>
          <p className="atp-popup-lead">Your tasks for this shift:</p>
          <ul className="atp-task-list">
            {tasks.map((t) => {
              const isDone = done.includes(t.id);
              return (
                <li key={t.id} className={isDone ? 'done' : ''}>
                  {isDone ? <IconCheckCircle size={16} /> : <IconCalendarCheck size={16} />}
                  <span>{t.name}</span>
                  {t.kind === 'training' ? <span className="pill pill-violet">Training</span> : null}
                  <span className={`pill ${isDone ? 'pill-green' : 'pill-amber'}`}>{isDone ? 'Done' : 'Pending'}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="info-callout">No audits or trainings are scheduled for your shift today.</div>
      )}

      <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
        <button type="button" className="btn btn-outline" onClick={close}>Dismiss</button>
        <button type="button" className="btn btn-primary" onClick={viewPlan}>View Full Plan</button>
      </div>
    </Modal>
  );
}
