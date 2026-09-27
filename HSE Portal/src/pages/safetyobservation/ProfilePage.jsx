import { useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import { IconUser, IconLogout, IconClipboard } from '../../components/icons';
import { useSafetyObservationAuth, apiFetch, logout, selectHodDepartment, HOD_DEPARTMENTS, hodForDepartment, MANAGER, SHIFT_KEYS, shiftLabel } from './store';

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Mobile Number' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'address', label: 'Address' },
];

export default function ProfilePage({ onNavigate, pushToast }) {
  const auth = useSafetyObservationAuth();
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
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--so-primary-light)', color: 'var(--so-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-900)' }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{user.employee_id} · {user.department}</div>
          </div>
          <span className="pill pill-blue">{user.role === 'hod' ? 'HOD' : 'Safety Agent'}</span>
        </div>
      </Panel>

      {user.role === 'hod' ? (
        <Panel title="Department Login" icon={<IconClipboard size={17} />}>
          <div className="form-grid">
            <div className="field">
              <label>Department (or Manager)</label>
              <select
                value={user.department}
                onChange={(e) => {
                  const dept = e.target.value;
                  const shift = user.shift || SHIFT_KEYS[0];
                  selectHodDepartment(dept, shift);
                  const hod = hodForDepartment(dept, shift);
                  pushToast(dept === MANAGER ? `Now logged in as ${hod.name}, Manager.` : `Now logged in as ${hod.name}, ${shiftLabel(shift)} of ${dept}.`, 'info');
                }}
              >
                {HOD_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {user.department !== MANAGER ? (
              <div className="field">
                <label>Shift</label>
                <select
                  value={user.shift}
                  onChange={(e) => {
                    selectHodDepartment(user.department, e.target.value);
                    const hod = hodForDepartment(user.department, e.target.value);
                    pushToast(`Now logged in as ${hod.name}, ${shiftLabel(e.target.value)} of ${user.department}.`, 'info');
                  }}
                >
                  {SHIFT_KEYS.map((k) => <option key={k} value={k}>{shiftLabel(k)} — {hodForDepartment(user.department, k).name}</option>)}
                </select>
              </div>
            ) : null}
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--slate-500)' }}>
            Each observation is assigned to all three shift HODs (A, B and C) of the department it was raised for, and shows on each of their dashboards. Any one of them can act on it. If none acts before the observation's closing time it moves to the Manager profile.
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
        onClick={() => { logout(); onNavigate('so-welcome'); }}
      >
        <IconLogout size={16} /> Log Out
      </button>
    </div>
  );
}
