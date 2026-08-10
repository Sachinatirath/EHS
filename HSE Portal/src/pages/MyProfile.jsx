import { useState } from 'react';
import { IconUser, IconFileText, IconAlertTriangle, IconLayers } from '../components/icons';

const EMPTY = {
  fullName: '', employeeId: '', email: '', phone: '', gender: '', bloodGroup: '', dob: '', maritalStatus: '',
  addr1: '', addr2: '', city: '', state: '', postalCode: '', country: '',
  contactName: '', relationship: '', ecPhone: '', altPhone: '',
  department: '', designation: '', joinDate: '', manager: '',
};

export default function MyProfile({ pushToast }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      pushToast('Profile saved successfully.', 'success');
    }, 650);
  };

  const handleReset = () => {
    setForm(EMPTY);
    pushToast('Form cleared.', 'info');
  };

  return (
    <div className="page-enter">
      <h1 className="page-title">My Profile</h1>
      <form onSubmit={handleSave}>
        <div className="panel">
          <div className="panel-header"><IconUser size={17} /> Personal Information</div>
          <div className="panel-body form-grid">
            <div className="field">
              <label>Full Name</label>
              <input value={form.fullName} onChange={set('fullName')} placeholder="Enter full name" />
            </div>
            <div className="field">
              <label>Employee ID</label>
              <input value={form.employeeId} onChange={set('employeeId')} placeholder="Employee ID" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="email@company.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="Phone number" />
            </div>
            <div className="field">
              <label>Gender</label>
              <select value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Blood Group</label>
              <select value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={set('dob')} />
            </div>
            <div className="field">
              <label>Marital Status</label>
              <select value={form.maritalStatus} onChange={set('maritalStatus')}>
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><IconFileText size={17} /> Address</div>
          <div className="panel-body form-grid">
            <div className="field span-2">
              <label>Address Line 1</label>
              <input value={form.addr1} onChange={set('addr1')} placeholder="Street address" />
            </div>
            <div className="field span-2">
              <label>Address Line 2</label>
              <input value={form.addr2} onChange={set('addr2')} placeholder="Apartment, suite, etc." />
            </div>
            <div className="field">
              <label>City</label>
              <input value={form.city} onChange={set('city')} placeholder="City" />
            </div>
            <div className="field">
              <label>State</label>
              <input value={form.state} onChange={set('state')} placeholder="State" />
            </div>
            <div className="field">
              <label>Postal Code</label>
              <input value={form.postalCode} onChange={set('postalCode')} placeholder="Postal code" />
            </div>
            <div className="field">
              <label>Country</label>
              <input value={form.country} onChange={set('country')} placeholder="Country" />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><IconAlertTriangle size={17} /> Emergency Contact</div>
          <div className="panel-body form-grid">
            <div className="field">
              <label>Contact Name</label>
              <input value={form.contactName} onChange={set('contactName')} placeholder="Emergency contact name" />
            </div>
            <div className="field">
              <label>Relationship</label>
              <input value={form.relationship} onChange={set('relationship')} placeholder="Spouse, Parent, etc." />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.ecPhone} onChange={set('ecPhone')} placeholder="Emergency phone" />
            </div>
            <div className="field">
              <label>Alternate Phone</label>
              <input value={form.altPhone} onChange={set('altPhone')} placeholder="Alternate phone" />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><IconLayers size={17} /> Department &amp; Role</div>
          <div className="panel-body form-grid">
            <div className="field">
              <label>Department</label>
              <input value={form.department} onChange={set('department')} placeholder="Department" />
            </div>
            <div className="field">
              <label>Designation</label>
              <input value={form.designation} onChange={set('designation')} placeholder="Job title" />
            </div>
            <div className="field">
              <label>Join Date</label>
              <input type="date" value={form.joinDate} onChange={set('joinDate')} />
            </div>
            <div className="field">
              <label>Reporting Manager</label>
              <input value={form.manager} onChange={set('manager')} placeholder="Manager name" />
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset}>Reset</button>
        </div>
      </form>
    </div>
  );
}
