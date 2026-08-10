// Central navigation config for the portal shell + the ForkLift Safety sub-app.
// `icon` keys are resolved against the map in Sidebar.jsx.

export const PORTAL_NAV = [
  {
    section: 'Account',
    items: [{ id: 'profile', label: 'My Profile', icon: 'user' }],
  },
  {
    section: 'My Tasks',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      {
        id: 'ehs-audit',
        label: 'EHS Audit',
        icon: 'clipboard',
        children: [
          { id: 'ehs-machine', label: 'Machine' },
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
      { id: 'audit-training-plan', label: 'Audit & Training Plan', icon: 'calendarCheck' },
      { id: 'safety-violation', label: 'Safety Violation', icon: 'alertTriangle', badge: 12 },
      { id: 'safety-observation', label: 'Safety Observation', icon: 'eye' },
      { id: 'incident-report', label: 'Incident Report', icon: 'flag' },
      {
        id: 'permits',
        label: 'Permits',
        icon: 'fileText',
        children: [
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
  profile: 'My Profile',
  dashboard: 'Dashboard',
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
  'audit-training-plan': 'Audit & Training Plan',
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
  { id: 'tr-matrix', label: 'Training Matrix' },
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
  'tr-matrix': 'Training Matrix',
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
