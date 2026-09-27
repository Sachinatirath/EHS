import { useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import { IconUser, IconLogout } from '../../components/icons';
import { useFastAidAuth, apiFetch, logout } from './store';

const FIELDS = [
  { key: 'name', label: 'Name', placeholder: 'Full name' },
  { key: 'phone', label: 'Mobile Number', placeholder: 'e.g. +91 98765 43210' },
  { key: 'email', label: 'Email', placeholder: 'e.g. you@example.com' },
  { key: 'department', label: 'Department', placeholder: 'Department' },
  { key: 'address', label: 'Address', placeholder: 'Street, city, state' },
];

const valuesFor = (user) => ({
  name: user?.name || '',
  phone: user?.phone || '',
  email: user?.email || '',
  department: user?.department || '',
  address: user?.address || '',
});

const roleLabel = (user) => (user?.role === 'ohc' ? 'OHC Team' : 'Area Incharge');
const valueStyle = { color: 'var(--slate-900)', fontWeight: 700 };

export default function ProfilePage({ onNavigate, pushToast }) {
  const auth = useFastAidAuth();
  const user = auth.user;
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => valuesFor(user));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setValues(valuesFor(user));
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!values.name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: values.name.trim(),
          department: values.department.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
        }),
      });
      pushToast('Profile updated', 'success');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Could not update profile. Please try again.');
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
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-900)' }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{user.employee_id} · {user.department}</div>
          </div>
          <span className="pill pill-teal">{roleLabel(user)}</span>
        </div>
      </Panel>

      <Panel
        title="Account Details"
        plain
        actions={!editing ? (
          <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={startEditing}>Edit</button>
        ) : null}
      >
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FIELDS.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input
                  value={values[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ opacity: 0.6 }}>
              <div className="split-row"><span>Employee ID</span><span style={valueStyle}>{user.employee_id}</span></div>
              <div className="split-row" style={{ marginBottom: 0 }}><span>Role</span><span style={valueStyle}>{roleLabel(user)}</span></div>
            </div>
            {error ? <div style={{ fontSize: 12.5, color: 'var(--red-600)' }}>{error}</div> : null}
            <div className="btn-row">
              <button type="button" className="btn btn-outline" disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="split-row"><span>Employee ID</span><span style={valueStyle}>{user.employee_id}</span></div>
            <div className="split-row"><span>Role</span><span style={valueStyle}>{roleLabel(user)}</span></div>
            <div className="split-row"><span>Name</span><span style={valueStyle}>{user.name}</span></div>
            <div className="split-row"><span>Mobile Number</span><span style={valueStyle}>{user.phone || '—'}</span></div>
            <div className="split-row"><span>Email</span><span style={valueStyle}>{user.email || '—'}</span></div>
            <div className="split-row"><span>Department</span><span style={valueStyle}>{user.department || '—'}</span></div>
            <div className="split-row" style={{ marginBottom: 0 }}><span>Address</span><span style={valueStyle}>{user.address || '—'}</span></div>
          </div>
        )}
      </Panel>

      <button
        type="button"
        className="btn btn-outline"
        style={{ width: '100%' }}
        onClick={() => { logout(); onNavigate('fa-welcome'); }}
      >
        <IconLogout size={16} /> Log Out
      </button>
    </div>
  );
}
