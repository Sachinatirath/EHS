import { useState } from 'react';
import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import {
  IconCalendarCheck, IconClock, IconCheckCircle, IconAlertTriangle, IconChevronLeft, IconArrowRight,
} from '../../components/icons';
import {
  SHIFTS, currentShift, planDate, tasksForDay, tasksForShift, dateKey, loadDone, saveDone, monthKeyOf,
} from '../../data/auditPlan';
import { AuditPlanMatrix, DailyTrainingTable } from './PlanEditors';

export default function TodayPlanPage({ pushToast }) {
  const today = planDate();
  const [date, setDate] = useState(today);
  const key = dateKey(date);
  const [done, setDone] = useState(() => loadDone(key));
  // Bumped after a monthly plan is edited so the shift lists re-read it.
  const [, setPlanVersion] = useState(0);
  const monthKey = monthKeyOf(date);

  const isToday = key === dateKey(today);
  const activeShift = isToday ? currentShift() : null;
  const day = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const dayTasks = tasksForDay(day, monthKey);
  const doneCount = dayTasks.filter((t) => done.includes(t.id)).length;

  const changeDate = (next) => {
    setDate(next);
    setDone(loadDone(dateKey(next)));
  };

  const shiftDay = (delta) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    changeDate(next);
  };

  const pickDay = (d) => {
    if (d > daysInMonth) return;
    changeDate(new Date(date.getFullYear(), date.getMonth(), d, 12));
  };

  const toggleDone = (task) => {
    const next = done.includes(task.id) ? done.filter((id) => id !== task.id) : [...done, task.id];
    setDone(next);
    saveDone(key, next);
    if (!done.includes(task.id)) pushToast(`${task.name} marked as completed.`, 'success');
  };

  return (
    <div className="page-enter">
      <h1 className="page-title">Today's Audit & Training Plan</h1>

      <div className="atp-date-bar">
        <button type="button" className="icon-btn" onClick={() => shiftDay(-1)} aria-label="Previous day">
          <IconChevronLeft size={16} />
        </button>
        <div className="atp-date-label">
          {date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {isToday ? <span className="pill pill-teal">Today</span> : null}
        </div>
        <button type="button" className="icon-btn" onClick={() => shiftDay(1)} aria-label="Next day">
          <IconArrowRight size={16} />
        </button>
        {!isToday ? (
          <button type="button" className="btn btn-outline" onClick={() => changeDate(today)}>Back to Today</button>
        ) : null}
      </div>

      <div className="stat-grid">
        <StatCard value={dayTasks.length} label="Planned Today" variant="blue" icon={<IconCalendarCheck size={19} />} delay={0} />
        <StatCard value={doneCount} label="Completed" variant="green" icon={<IconCheckCircle size={19} />} delay={60} />
        <StatCard value={dayTasks.length - doneCount} label="Pending" variant="amber" icon={<IconAlertTriangle size={19} />} delay={120} />
        <StatCard
          value={activeShift ? `Shift ${activeShift}` : '—'}
          label="Current Shift"
          variant="violet"
          icon={<IconClock size={19} />}
          delay={180}
        />
      </div>

      <div className="atp-shift-grid">
        {SHIFTS.map((shift) => {
          const tasks = tasksForShift(day, shift.id, monthKey);
          const isActive = shift.id === activeShift;
          return (
            <Panel
              key={shift.id}
              title={`${shift.label} · ${shift.time}`}
              icon={<IconClock size={17} />}
              accent={shift.variant}
              noMargin
              actions={isActive ? <span className="pill pill-green">On Shift</span> : null}
              style={isActive ? { boxShadow: '0 0 0 2px var(--green-600)' } : undefined}
            >
              {tasks.length ? (
                <ul className="atp-task-list">
                  {tasks.map((t) => {
                    const isDone = done.includes(t.id);
                    return (
                      <li key={t.id} className={isDone ? 'done' : ''}>
                        <input type="checkbox" checked={isDone} onChange={() => toggleDone(t)} aria-label={`Mark ${t.name} done`} />
                        <span>{t.name}</span>
                        {t.kind === 'training' ? <span className="pill pill-violet">Training</span> : null}
                        <span className={`pill ${isDone ? 'pill-green' : 'pill-amber'}`}>{isDone ? 'Done' : 'Pending'}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="atp-empty">No activities scheduled for this shift.</div>
              )}
            </Panel>
          );
        })}
      </div>

      <AuditPlanMatrix
        key={`audits-${monthKey}`}
        monthKey={monthKey}
        day={day}
        daysInMonth={daysInMonth}
        onPickDay={pickDay}
        pushToast={pushToast}
        onSaved={() => setPlanVersion((v) => v + 1)}
      />

      <DailyTrainingTable
        key={`trainings-${monthKey}`}
        monthKey={monthKey}
        day={day}
        daysInMonth={daysInMonth}
        isToday={isToday}
        done={done}
        onPickDay={pickDay}
        pushToast={pushToast}
        onSaved={() => setPlanVersion((v) => v + 1)}
      />
    </div>
  );
}
