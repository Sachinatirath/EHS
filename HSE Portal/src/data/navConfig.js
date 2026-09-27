// Central navigation config for the portal shell + the ForkLift Safety sub-app.
// `icon` keys are resolved against the map in Sidebar.jsx.

export const PORTAL_NAV = [
  {
    section: 'Account',
    items: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'profile', label: 'My Profile', icon: 'user' },
    ],
  },
  {
    section: 'My Tasks',
    items: [
      { id: 'my-tasks', label: 'My Tasks', icon: 'checkSquare' },
      {
        id: 'ehs-audit',
        label: 'EHS Audit',
        icon: 'clipboard',
        children: [
          { id: 'ehs-machine', label: 'Machine', isApp: true, appTarget: 'machineaudit' },
          { id: 'ehs-powertools', label: "Power Tool's" },
          { id: 'ehs-forklift', label: 'ForkLift', isApp: true, appTarget: 'forklift' },
          { id: 'ehs-outside-vehicles', label: 'Out Side Vehicles' },
          { id: 'ehs-web-sling', label: 'Web Sling', isApp: true, appTarget: 'websling' },
          { id: 'ehs-hoist', label: 'Hoist', isApp: true, appTarget: 'hoist' },
          { id: 'ehs-fire-safety', label: 'Fire Safety', isApp: true, appTarget: 'firesafety' },
          { id: 'ehs-substation', label: 'Sub Station' },
          { id: 'ehs-boiler', label: 'Boiler' },
          { id: 'ehs-battery', label: 'Batter Charing Station' },
          { id: 'ehs-canteen', label: 'Canteen' },
        ],
      },
      { id: 'training', label: 'Training', icon: 'cap', isApp: true, appTarget: 'training' },
      {
        id: 'audit-training-plan',
        label: 'Audit & Training Plan',
        icon: 'calendarCheck',
        children: [
          { id: 'atp-today', label: "Today's Audit & Training Plan" },
          { id: 'atp-plan', label: 'Audit & Training Plan' },
        ],
      },
      { id: 'shift-schedule', label: 'Shift Schedule', icon: 'clock', isApp: true, appTarget: 'shiftschedule' },
      { id: 'safety-violation', label: 'Safety Violation', icon: 'alertTriangle', isApp: true, appTarget: 'safetyviolation' },
      { id: 'safety-observation', label: 'Safety Observation', icon: 'eye', isApp: true, appTarget: 'safetyobservation' },
      { id: 'incident-report', label: 'Incident Report', icon: 'flag', isApp: true, appTarget: 'incidentreport' },
      { id: 'fast-aid', label: 'FastAid', icon: 'firstAid', isApp: true, appTarget: 'fastaid' },
      {
        id: 'permits',
        label: 'Permits',
        icon: 'fileText',
        children: [
          { id: 'permits-dashboard', label: 'Dashboard' },
          { id: 'permits-general', label: 'General Permit' },
          { id: 'permits-height', label: 'Work at Height' },
          { id: 'permits-hotwork', label: 'Hot Work' },
          { id: 'permits-confined', label: 'Confined Space' },
          { id: 'permits-loto', label: 'LOTO' },
          { id: 'permits-excavation', label: 'Excavation' },
        ],
      },
      { id: 'moc', label: 'MOC', icon: 'repeat', isApp: true, appTarget: 'moc' },
      { id: 'hira-review', label: 'HIRA Review', icon: 'checkSquare' },
      { id: 'doc-review', label: 'DOC Review', icon: 'fileText', isApp: true, appTarget: 'docreview' },
      { id: 'hsse-certification', label: 'HSSE Certification', icon: 'shieldCheck' },
      { id: 'jsa', label: 'JSA', icon: 'layers' },
      { id: 'tpi', label: 'TPI', icon: 'users' },
      { id: 'stop-call-wait', label: 'Stop Call Wait', icon: 'mail' },
      { id: 'fire-extinguishers', label: 'Fire Extinguishers', icon: 'flame', isApp: true, appTarget: 'firesafety' },
      { id: 'ppe-store', label: 'PPE Store', icon: 'hardHat' },
    ],
  },
  {
    section: 'Account',
    items: [{ id: 'settings', label: 'Settings', icon: 'settings' }],
  },
];

// Friendly page titles used by the header + placeholder pages.
export const PAGE_TITLES = {
  home: 'Home',
  profile: 'My Profile',
  'permits-dashboard': 'Permits Dashboard',
  'ehs-forklift': 'ForkLift Safety',
  'ehs-machine': 'Machine Audit',
  'ehs-powertools': "Power Tool's Audit",
  'ehs-outside-vehicles': 'Outside Vehicles Audit',
  'ehs-web-sling': 'Web Sling Audit',
  'ehs-hoist': 'Hoist & EOT Crane',
  'ehs-fire-safety': 'Fire Safety',
  'ehs-substation': 'Sub Station Audit',
  'ehs-boiler': 'Boiler Safety Audit',
  'ehs-battery': 'Battery Charging Station Audit',
  'ehs-canteen': 'Canteen Safety Audit',
  training: 'Training',
  'atp-today': "Today's Audit & Training Plan",
  'atp-plan': 'Audit & Training Plan',
  'shift-schedule': 'Shift Schedule',
  'my-tasks': 'My Tasks',
  'safety-violation': 'Safety Violation',
  'safety-observation': 'Safety Observation',
  'incident-report': 'Incident Report',
  'permits-general': 'General Permit',
  'permits-height': 'Work at Height',
  'permits-hotwork': 'Hot Work',
  'permits-confined': 'Confined Space',
  'permits-loto': 'LOTO',
  'permits-excavation': 'Excavation',
  moc: 'Management of Change',
  'hira-review': 'HIRA Review',
  'doc-review': 'DOC Review',
  'hsse-certification': 'HSSE Certification',
  jsa: 'Job Safety Analysis',
  tpi: 'Third Party Inspection',
  'stop-call-wait': 'Stop Call Wait',
  'fire-extinguishers': 'Fire Safety',
  'ppe-store': 'PPE Store',
  settings: 'Settings',
};

export const FORKLIFT_NAV = [
  { id: 'fl-dashboard', label: 'Dashboard' },
  { id: 'fl-master', label: 'Forklift Master' },
  { id: 'fl-audit', label: 'Online Audit' },
  { id: 'fl-observations', label: 'Observations' },
  { id: 'fl-dept', label: 'Department Assignment' },
  { id: 'fl-hod', label: 'HOD Approval' },
  { id: 'fl-corrective', label: 'Corrective Actions' },
  { id: 'fl-history', label: 'Audit History' },
  { id: 'fl-reports', label: 'Management Reports' },
];

export const FORKLIFT_TITLES = {
  'fl-dashboard': 'Forklift Safety Dashboard',
  'fl-master': 'Forklift Master',
  'fl-audit': 'Online Audit',
  'fl-observations': 'Observations',
  'fl-dept': 'Department Assignment',
  'fl-hod': 'HOD Approval',
  'fl-corrective': 'Corrective Actions',
  'fl-history': 'Audit History',
  'fl-reports': 'Management Reports',
};

export const WEBSLING_NAV = [
  { id: 'ws-dashboard', label: 'Dashboard' },
  { id: 'ws-master', label: 'Sling Master' },
  { id: 'ws-inspection', label: 'Online Inspection' },
  { id: 'ws-hod', label: 'HOD Approvals' },
  { id: 'ws-corrective', label: 'Corrective Actions' },
  { id: 'ws-history', label: 'Inspection History' },
  { id: 'ws-reports', label: 'Reports & Analytics' },
];

export const WEBSLING_TITLES = {
  'ws-dashboard': 'Web Sling Safety Dashboard',
  'ws-master': 'Sling Master',
  'ws-inspection': 'Online Inspection',
  'ws-hod': 'HOD Approvals',
  'ws-corrective': 'Corrective Actions',
  'ws-history': 'Inspection History',
  'ws-reports': 'Reports & Analytics',
};

export const HOIST_NAV = [
  { id: 'ho-dashboard', label: 'Dashboard' },
  { id: 'ho-master', label: 'Equipment Master' },
  { id: 'ho-audit', label: 'Online Audit' },
  { id: 'ho-hod', label: 'HOD Approval' },
  { id: 'ho-corrective', label: 'Corrective Actions' },
  { id: 'ho-history', label: 'Audit History' },
  { id: 'ho-reports', label: 'Management Reports' },
];

export const HOIST_TITLES = {
  'ho-dashboard': 'Hoist & EOT Crane Safety Dashboard',
  'ho-master': 'Equipment Master',
  'ho-audit': 'Online Audit',
  'ho-hod': 'HOD Approval',
  'ho-corrective': 'Corrective Actions',
  'ho-history': 'Audit History',
  'ho-reports': 'Management Reports',
};

export const TRAINING_NAV = [
  { id: 'tr-dashboard', label: 'Dashboard' },
  { id: 'tr-employees', label: 'Employee Master' },
  { id: 'tr-sessions', label: 'Training Sessions' },
  { id: 'tr-certificates', label: 'Certificates & Expiry' },
  { id: 'tr-induction', label: 'Safety Induction' },
  { id: 'tr-special', label: 'Special Training' },
  { id: 'tr-incident', label: 'Incident Communication' },
  { id: 'tr-hod', label: 'HOD Approval' },
  { id: 'tr-notifications', label: 'Notifications' },
  { id: 'tr-reports', label: 'HOD Reports' },
];

export const TRAINING_TITLES = {
  'tr-dashboard': 'Training Management Dashboard',
  'tr-employees': 'Employee Master & Training Profile',
  'tr-sessions': 'Training Sessions',
  'tr-certificates': 'Certificates & Expiry Tracking',
  'tr-induction': 'Safety Induction',
  'tr-special': 'Special & Job-Specific Training',
  'tr-incident': 'Incident Communication',
  'tr-hod': 'HOD Approval & Review',
  'tr-notifications': 'Notifications & Reminders',
  'tr-reports': 'HOD Training Report',
};

export const MOC_NAV = [
  { id: 'moc-dashboard', label: 'Dashboard' },
  { id: 'moc-register', label: 'MOC Register' },
  { id: 'moc-new', label: 'New MOC' },
  { id: 'moc-risk-review', label: 'Risk Review' },
  { id: 'moc-risk-assessment', label: 'Risk Assessment' },
  { id: 'moc-actions', label: 'Action Assignment' },
  { id: 'moc-approval', label: 'Approval Centre' },
  { id: 'moc-implementation', label: 'Implementation' },
  { id: 'moc-verification', label: 'Post-Change Verification' },
  { id: 'moc-audit-trail', label: 'Audit Trail' },
  { id: 'moc-reports', label: 'Management Reports' },
];

export const MOC_TITLES = {
  'moc-dashboard': 'MOC Management Dashboard',
  'moc-register': 'MOC Register',
  'moc-new': 'Raise New MOC',
  'moc-risk-review': 'MOC Screening & Technical Review',
  'moc-risk-assessment': 'MOC Risk Assessment',
  'moc-actions': 'MOC Action Assignment',
  'moc-approval': 'MOC Approval Centre',
  'moc-implementation': 'Implementation Control',
  'moc-verification': 'Post-Change Verification & Closure',
  'moc-audit-trail': 'MOC Audit Trail',
  'moc-reports': 'MOC Management Reports',
};

export const DOC_REVIEW_NAV = [
  { id: 'dr-dashboard', label: 'Dashboard' },
  { id: 'dr-inbox', label: 'Review Inbox' },
  { id: 'dr-documents', label: 'All Documents' },
  { id: 'dr-submit', label: 'Submit New Document' },
  { id: 'dr-pending', label: 'Pending Review' },
  { id: 'dr-assignments', label: 'My Assignments' },
  { id: 'dr-history', label: 'Review History' },
  { id: 'dr-approvals', label: 'Approvals' },
  { id: 'dr-register', label: 'Master Register' },
  { id: 'dr-archive', label: 'Obsolete / Archive' },
  { id: 'dr-reports', label: 'Management Reports' },
];

export const DOC_REVIEW_TITLES = {
  'dr-dashboard': 'Doc Review Dashboard',
  'dr-inbox': 'Review Inbox',
  'dr-documents': 'All Controlled Documents',
  'dr-submit': 'Submit New Document for Review',
  'dr-pending': 'Pending Document Reviews',
  'dr-assignments': 'My Review Assignments',
  'dr-history': 'Document Review History',
  'dr-approvals': 'Document Approvals',
  'dr-register': 'Master Document Register',
  'dr-archive': 'Obsolete / Archived Documents',
  'dr-reports': 'Document Review Management Reports',
};

export const FIRE_NAV = [
  { id: 'fs-dashboard', label: 'Dashboard' },
  { id: 'fs-register', label: 'Fire Asset Register' },
  { id: 'fs-audit', label: 'Fire Equipment Audit' },
  { id: 'fs-new-audit', label: 'Start New Audit' },
  { id: 'fs-observations', label: 'Observations & Findings' },
  { id: 'fs-corrective', label: 'Corrective Actions' },
  { id: 'fs-amc', label: 'AMC / Service' },
  { id: 'fs-service-requests', label: 'Service Requests' },
  { id: 'fs-pumps', label: 'Fire Pumps Audit' },
  { id: 'fs-refill', label: 'Refilling / Hydro Test' },
  { id: 'fs-expiry', label: 'Expiry & Alerts' },
  { id: 'fs-reports', label: 'HOD / Management Report' },
  { id: 'fs-audit-trail', label: 'Audit Trail' },
];

export const SAFETY_VIOLATION_TITLES = {
  'sv-welcome': 'Safety Violation',
  'sv-agent-home': 'My Safety Violations',
  'sv-agent-create': 'New Safety Violation',
  'sv-agent-alerts': 'Alerts',
  'sv-agent-profile': 'Profile',
  'sv-hod-dashboard': 'HOD Dashboard',
  'sv-hod-violations': 'All Violations',
  'sv-hod-alerts': 'Alerts',
  'sv-hod-profile': 'Profile',
};

export const SHIFT_SCHEDULE_TITLES = {
  'ss-emp-schedule': "Today's Shift Schedule",
  'ss-emp-new': 'Shift Change / Swap Request',
  'ss-emp-requests': 'My Shift Requests',
  'ss-hod-dashboard': 'Shift Schedule — HOD Dashboard',
  'ss-hod-requests': 'Shift Requests — Approvals',
  'ss-hod-schedule': 'Shift Schedule',
};

export const MACHINE_AUDIT_TITLES = {
  'ma-welcome': 'Machine Audit',
  'ma-officer-home': 'My Machine Audits',
  'ma-officer-create': 'New Machine Audit',
  'ma-officer-machines': 'Audited Machines',
  'ma-officer-alerts': 'Alerts',
  'ma-officer-profile': 'Profile',
  'ma-incharge-home': 'Assigned Machine Audits',
  'ma-incharge-alerts': 'Alerts',
  'ma-incharge-profile': 'Profile',
  'ma-hod-dashboard': 'Machine Audit — HOD Dashboard',
  'ma-hod-machines': 'Audited Machines',
  'ma-hod-alerts': 'Alerts',
  'ma-hod-profile': 'Profile',
};

export const SAFETY_OBSERVATION_TITLES = {
  'so-welcome': 'Safety Observation',
  'so-agent-home': 'My Observations',
  'so-agent-create': 'New Observation',
  'so-agent-alerts': 'Alerts',
  'so-agent-profile': 'Profile',
  'so-hod-dashboard': 'HOD Dashboard',
  'so-hod-observations': 'All Observations',
  'so-hod-alerts': 'Alerts',
  'so-hod-profile': 'Profile',
};

export const INCIDENT_REPORT_TITLES = {
  'ir-welcome': 'Incident Report',
  'ir-agent-home': 'My Incidents',
  'ir-agent-create': 'New Incident',
  'ir-agent-alerts': 'Alerts',
  'ir-agent-profile': 'Profile',
  'ir-hod-dashboard': 'HOD Dashboard',
  'ir-hod-incidents': 'All Incidents',
  'ir-hod-alerts': 'Alerts',
  'ir-hod-profile': 'Profile',
};

export const FASTAID_TITLES = {
  'fa-welcome': 'FastAid',
  'fa-ai-home': 'Home',
  'fa-ai-inspect': 'Start Inspection',
  'fa-ai-inspections': 'My Inspections',
  'fa-ai-alerts': 'Alerts',
  'fa-ai-profile': 'Profile',
  'fa-ohc-dashboard': 'OHC Dashboard',
  'fa-ohc-boxes': 'First Aid Boxes',
  'fa-ohc-records': 'Inspection Records',
  'fa-ohc-refills': 'Refill Requests',
  'fa-ohc-alerts': 'Alerts',
  'fa-ohc-profile': 'Profile',
};

export const FIRE_TITLES = {
  'fs-dashboard': 'Fire Equipment Audit Dashboard',
  'fs-register': 'Fire Asset Register',
  'fs-audit': 'Fire Equipment Audit',
  'fs-new-audit': 'Start New Fire Equipment Audit',
  'fs-observations': 'Observations & Findings',
  'fs-corrective': 'Corrective Action Management',
  'fs-amc': 'AMC / Service Management',
  'fs-service-requests': 'AMC Service Request & Replacement',
  'fs-pumps': 'Fire Pump Audit & Maintenance',
  'fs-refill': 'Refilling / Hydro Test Control',
  'fs-expiry': 'Expiry & Compliance Alerts',
  'fs-reports': 'HOD / Management Fire Safety Report',
  'fs-audit-trail': 'Audit Trail',
};
