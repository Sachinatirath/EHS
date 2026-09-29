import { useEffect, useState } from 'react';
import {
  IconCheckSquare, IconAlertTriangle, IconClock, IconArrowRight, IconCheckCircle,
} from '../components/icons';
import { MODULES, collectTasks, dueInfo } from '../utils/myTasks';

const REFRESH_MS = 1000;
const NEXT_UP = 4;

/**
 * "Your day" strip for the home page: live pending / overdue / due-soon counts and the
 * next tasks coming due, each one click away. Uses the same task feed as My Tasks.
 */
export default function HomeToday({ onOpenTask, onViewAll }) {
  const [tasks, setTasks] = useState(() => collectTasks());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTasks(collectTasks());
      setNow(Date.now());
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const withDue = tasks.map((t) => ({ t, due: dueInfo(t, now) }));
  const overdue = withDue.filter((x) => x.due?.overdue).length;
  const dueSoon = withDue.filter((x) => x.due && !x.due.overdue && x.due.left < 86400000).length;
  const next = withDue
    .filter((x) => x.due)
    .sort((a, b) => a.due.left - b.due.left)
    .slice(0, NEXT_UP);

  const tiles = [
    { key: 'pending', value: tasks.length, label: 'Pending tasks', sub: 'across all modules', icon: IconCheckSquare, tone: 'blue' },
    { key: 'overdue', value: overdue, label: 'Overdue', sub: overdue ? 'need attention now' : 'nothing late', icon: IconAlertTriangle, tone: overdue ? 'red' : 'green' },
    { key: 'soon', value: dueSoon, label: 'Due in 24 hours', sub: 'plan ahead', icon: IconClock, tone: 'amber' },
  ];

  return (
    <section className="yd" data-reveal>
      <div className="yd-tiles">
        {tiles.map(({ key, value, label, sub, icon: Icon, tone }, i) => (
          <button key={key} type="button" className={`yd-tile yd-${tone}`} style={{ '--i': i }} onClick={onViewAll}>
            <span className="yd-tile-icon"><Icon size={20} /></span>
            <span className="yd-tile-text">
              <strong>{value}</strong>
              <span>{label}</span>
              <em>{sub}</em>
            </span>
            <IconArrowRight size={16} />
          </button>
        ))}
      </div>

      <div className="yd-next">
        <div className="yd-next-head">
          <div>
            <p className="hx-kicker yd-live"><span className="yd-live-dot" /> Live · updates every second</p>
            <h3>Next up</h3>
          </div>
          <button type="button" className="yd-all" onClick={onViewAll}>
            View all tasks <IconArrowRight size={15} />
          </button>
        </div>

        {next.length ? (
          <ul className="yd-list">
            {next.map(({ t, due }, i) => (
              <li key={t.key} className={`yd-row${due.overdue ? ' is-overdue' : ''}`} style={{ '--i': i }}>
                <span className="yd-row-dot" />
                <div className="yd-row-main">
                  <div className="yd-row-top">
                    <strong>{t.ref}</strong>
                    <span className="yd-row-module">{MODULES[t.module]}</span>
                  </div>
                  <p title={t.title}>{t.action} · <span>{t.assignee}</span></p>
                </div>
                <span className="yd-row-due" style={{ color: due.color }}>{due.text}</span>
                <button type="button" className="yd-open" onClick={() => onOpenTask(t)} aria-label={`Open ${t.ref}`}>
                  Open <IconArrowRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="yd-empty">
            <IconCheckCircle size={28} />
            <strong>You&apos;re all caught up</strong>
            <span>No task has a deadline coming up.</span>
          </div>
        )}
      </div>
    </section>
  );
}
