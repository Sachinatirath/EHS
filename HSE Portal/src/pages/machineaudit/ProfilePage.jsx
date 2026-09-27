import { useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import { IconUser, IconLogout, IconUsers } from '../../components/icons';
import { INCHARGE_ROLES, inchargeFor, logout, selectIncharge, updateProfile, useMachineAuditAuth } from './store';

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Mobile Number' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
];

const roleName = (user) => (user.role === 'officer' ? 'Safety Officer' : user.title);
const pick = (user) => Object.fromEntries(FIELDS.map((f) => [f.key, user?.[f.key] || '']));

export default function ProfilePage({ onNavigate, pushToast }) {
  const { user } = useMachineAuditAuth();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => pick(user));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!values.name.trim()) {
      pushToast('Name cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(values);
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
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--ma-primary-light)', color: 'var(--ma-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-900)' }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{user.employee_id} · {user.department}</div>
          </div>
          <span className="pill pill-violet">{roleName(user)}</span>
        </div>
      </Panel>

      {user.role === 'incharge' ? (
        <Panel title="In-charge Login" icon={<IconUsers size={17} />}>
          <div className="field" style={{ maxWidth: 360 }}>
            <label>Switch In-charge</label>
            <select
              value={user.incharge}
              onChange={(e) => {
                selectIncharge(e.target.value);
                setEditing(false);
                pushToast(`Now logged in as ${inchargeFor(e.target.value).name}, ${inchargeFor(e.target.value).title}.`, 'info');
              }}
            >
              {INCHARGE_ROLES.map(({ key, label }) => <option key={key} value={key}>{label} — {inchargeFor(key).name}</option>)}
            </select>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--slate-500)' }}>
            Every machine audit is assigned to all three in-charges. Switch here to complete it as Shift, Mech or Ele In-charge.
          </p>
        </Panel>
      ) : null}

      <Panel
        title="Account Details"
        plain
        actions={!editing ? (
          <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => { setValues(pick(user)); setEditing(true); }}>Edit</button>
        ) : null}
      >
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FIELDS.map((f) => (
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
            {[
              ['Employee ID', user.employee_id],
              ['Role', roleName(user)],
              ['Mobile Number', user.phone],
              ['Email', user.email],
              ['Department', user.department],
              ['Address', user.address],
            ].map(([label, value], i, all) => (
              <div className="split-row" key={label} style={i === all.length - 1 ? { marginBottom: 0 } : undefined}>
                <span>{label}</span><span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <button
        type="button"
        className="btn btn-outline"
        style={{ width: '100%' }}
        onClick={() => { logout(); onNavigate('ma-welcome'); }}
      >
        <IconLogout size={16} /> Log Out
      </button>
    </div>
  );
}
