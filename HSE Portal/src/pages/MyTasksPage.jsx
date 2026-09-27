import { useEffect, useState } from 'react';
import Panel from '../components/Panel';
import StatCard from '../components/StatCard';
import {
  IconCheckSquare, IconAlertTriangle, IconClock, IconUsers, IconArrowRight, IconUser,
} from '../components/icons';
import { MODULES, collectTasks } from '../utils/myTasks';

const REFRESH_MS = 1000;

function countdown(ms) {
  const total = Math.floor(Math.abs(ms) / 1000);
  const d = Math.floor(total / 86400);
  const hh = String(Math.floor((total % 86400) / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${d ? `${d}d ` : ''}${hh}:${mm}:${ss}`;
}

function dueInfo(task, now) {
  if (!task.due_at) return null;
  const left = Date.parse(task.due_at) - now;
  if (left <= 0) return { text: `Overdue ${countdown(left)}`, color: 'var(--red-600)', overdue: true, left };
  return { text: `${countdown(left)} left`, color: left < 3600000 ? 'var(--amber-600)' : 'var(--green-600)', left };
}

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

/**
 * Every pending task in the portal, per person — reassigned observations and
 * violations, HOD reviews, machine-audit sign-offs, refills, shift approvals
 * and today's plan. Refreshes itself every second.
 */
export default function MyTasksPage({ onOpenTask }) {
  const [tasks, setTasks] = useState(() => collectTasks());
  const [now, setNow] = useState(() => Date.now());
  const [person, setPerson] = useState('all');
  const [module, setModule] = useState('all');
  const [when, setWhen] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setTasks(collectTasks());
      setNow(Date.now());
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const people = [...new Map(tasks.map((t) => [t.assignee, t.role])).entries()]
    .map(([name, role]) => ({ name, role, count: tasks.filter((t) => t.assignee === name).length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const q = query.trim().toLowerCase();
  const rows = tasks
    .filter((t) => (person === 'all' || t.assignee === person)
      && (module === 'all' || t.module === module)
      && (when === 'all'
        || (when === 'overdue' && dueInfo(t, now)?.overdue)
        || (when === 'today' && (isToday(t.created_at) || (t.due_at && isToday(t.due_at)))))
      && (!q || [t.ref, t.title, t.assignee, t.department].some((f) => (f || '').toLowerCase().includes(q))))
    .sort((a, b) => {
      const da = a.due_at ? Date.parse(a.due_at) : Infinity;
      const db = b.due_at ? Date.parse(b.due_at) : Infinity;
      return da - db || (a.created_at < b.created_at ? 1 : -1);
    });

  const overdue = tasks.filter((t) => dueInfo(t, now)?.overdue).length;
  const dueSoon = tasks.filter((t) => { const d = dueInfo(t, now); return d && !d.overdue && d.left < 86400000; }).length;

  return (
    <div className="page-enter">
      <h1 className="page-title">My Tasks</h1>
      <p className="page-subtitle">Everything assigned or reassigned to each person across all modules · updates automatically</p>

      <div className="stat-grid">
        <StatCard value={tasks.length} label="Pending Tasks" variant="blue" icon={<IconCheckSquare size={19} />} delay={0} />
        <StatCard value={overdue} label="Overdue" variant="red" icon={<IconAlertTriangle size={19} />} delay={60} />
        <StatCard value={dueSoon} label="Due in 24 Hours" variant="amber" icon={<IconClock size={19} />} delay={120} />
        <StatCard value={people.length} label="People with Tasks" variant="violet" icon={<IconUsers size={19} />} delay={180} />
      </div>

      <Panel title="Pending by Person" icon={<IconUser size={17} />}>
        <div className="home-card-actions">
          <button type="button" className="home-chip" style={person === 'all' ? { background: 'var(--blue-50)' } : undefined} onClick={() => setPerson('all')}>
            Everyone · {tasks.length}
          </button>
          {people.map((p) => (
            <button
              key={p.name}
              type="button"
              className="home-chip"
              title={p.role}
              style={person === p.name ? { background: 'var(--blue-50)' } : undefined}
              onClick={() => setPerson(p.name)}
            >
              {p.name} · {p.count}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={person === 'all' ? 'All Pending Tasks' : `Tasks for ${person}`} icon={<IconCheckSquare size={17} />}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div className="field" style={{ width: 220 }}>
            <label>Person</label>
            <select value={person} onChange={(e) => setPerson(e.target.value)}>
              <option value="all">Everyone</option>
              {people.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.count})</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 220 }}>
            <label>Module</label>
            <select value={module} onChange={(e) => setModule(e.target.value)}>
              <option value="all">All modules</option>
              {Object.entries(MODULES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 180 }}>
            <label>Show</label>
            <select value={when} onChange={(e) => setWhen(e.target.value)}>
              <option value="all">All pending</option>
              <option value="today">Today&apos;s tasks</option>
              <option value="overdue">Overdue only</option>
            </select>
          </div>
          <div className="field" style={{ width: 240 }}>
            <label>Search</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Number, title, person, department" />
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr><th>Task No</th><th>Date</th><th>Module</th><th>Details</th><th>Assigned To</th><th>To Do</th><th>Status</th><th>Live Time</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const due = dueInfo(t, now);
                return (
                  <tr key={t.key}>
                    <td style={{ fontWeight: 700, color: 'var(--slate-900)', whiteSpace: 'nowrap' }}>{t.ref}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                    <td>{MODULES[t.module]}</td>
                    <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.title}>{t.title}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.assignee}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--slate-500)' }}>{t.role}</div>
                    </td>
                    <td>{t.action}</td>
                    <td><span className={`pill ${t.status.pill}`}>{t.status.label}</span></td>
                    <td style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', color: due ? due.color : 'var(--slate-400)' }}>{due ? due.text : '—'}</td>
                    <td>
                      <button type="button" className="btn btn-primary" style={{ padding: '5px 12px' }} onClick={() => onOpenTask(t)}>
                        Open <IconArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>Nothing pending here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
