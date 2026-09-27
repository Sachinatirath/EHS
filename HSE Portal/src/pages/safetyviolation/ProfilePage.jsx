import { useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import { IconUser, IconLogout, IconClipboard } from '../../components/icons';
import { useSafetyViolationAuth, apiFetch, logout, selectHodDepartment, HOD_DEPARTMENTS, hodForDepartment } from './store';

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Mobile Number' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'address', label: 'Address' },
];

export default function ProfilePage({ onNavigate, pushToast }) {
  const auth = useSafetyViolationAuth();
  const user = auth.user;
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => ({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    department: user?.department || '', address: user?.address || '',
  }));
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setValues({ name: user.name || '', phone: user.phone || '', email: user.email || '', department: user.department || '', address: user.address || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!values.name.trim()) {
      pushToast('Name cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(values) });
      pushToast('Profile updated', 'success');
      setEditing(false);
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-enter">
      <PageHeader title="Profile" subtitle="Account settings" />

      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--red-100)', color: 'var(--red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-900)' }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{user.employee_id} · {user.department}</div>
          </div>
          <span className="pill pill-red">{user.role === 'hod' ? 'HOD' : 'Safety Agent'}</span>
        </div>
      </Panel>

      {user.role === 'hod' ? (
        <Panel title="Department Login" icon={<IconClipboard size={17} />}>
          <div className="field" style={{ maxWidth: 360 }}>
            <label>Switch Department HOD</label>
            <select
              value={user.department}
              onChange={(e) => {
                selectHodDepartment(e.target.value);
                pushToast(`Now logged in as ${hodForDepartment(e.target.value).name}, HOD of ${e.target.value}.`, 'info');
              }}
            >
              {HOD_DEPARTMENTS.map((d) => <option key={d} value={d}>{d} — {hodForDepartment(d).name}</option>)}
            </select>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--slate-500)' }}>
            Violations are assigned to the HOD of the department they were filed against. Pick a department to see only its violations, dashboard and alerts.
          </p>
        </Panel>
      ) : null}

      <Panel
        title="Account Details"
        plain
        actions={!editing ? (
          <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={startEditing}>Edit</button>
        ) : null}
      >
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FIELDS.filter((f) => !(user.role === 'hod' && f.key === 'department')).map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="btn-row">
              <button type="button" className="btn btn-outline" disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="split-row"><span>Employee ID</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{user.employee_id}</span></div>
            <div className="split-row"><span>Role</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{user.role === 'hod' ? 'HOD' : 'Safety Agent'}</span></div>
            <div className="split-row"><span>Mobile Number</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{user.phone || '—'}</span></div>
            <div className="split-row"><span>Email</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{user.email || '—'}</span></div>
            <div className="split-row"><span>Department</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{user.department || '—'}</span></div>
            <div className="split-row" style={{ marginBottom: 0 }}><span>Address</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{user.address || '—'}</span></div>
          </div>
        )}
      </Panel>

      <button
        type="button"
        className="btn btn-outline"
        style={{ width: '100%' }}
        onClick={() => { logout(); onNavigate('sv-welcome'); }}
      >
        <IconLogout size={16} /> Log Out
      </button>
    </div>
  );
}
