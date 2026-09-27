const demoPortals = [
  {
    email: 'demo.public@example.test',
    password: 'SihDemoPublic2026!',
    role: 'user',
    profile: {
      full_name: 'Demo Public User',
      organization: 'Local Demonstration Account',
    },
  },
  {
    email: 'demo.lmo@example.test',
    password: 'SihDemoLmo2026!',
    role: 'lmo',
    profile: {
      full_name: 'Demo Legal Metrology Officer',
      employeeCode: 'DEMO-LMO-01',
      gazetteOrderRef: 'LOCAL-DEMO-LMO',
      state: 'Delhi',
      districtDivision: 'North Delhi',
      zoneSubDivision: 'Demo Zone',
      assignedJurisdiction: 'North Delhi, Delhi',
      dscKeyId: 'DEMO-DSC-LMO-01',
    },
  },
  {
    email: 'demo.field@example.test',
    password: 'SihDemoField2026!',
    role: 'field_officer',
    profile: {
      full_name: 'Demo Field Officer',
      employeeCode: 'DEMO-FO-01',
      circleZone: 'North Delhi Demo Zone',
      circlePincode: '110001',
      activatedAt: new Date(),
    },
  },
  {
    email: 'demo.gatc@example.test',
    password: 'SihDemoGatc2026!',
    role: 'gatc',
    profile: {
      centre_name: 'Local Demonstration Test Centre',
      gatc_code: 'GATC-DEMO-01',
      accreditation_no: 'DEMO-ACCREDITATION-01',
      valid_until: new Date('2035-12-31T00:00:00.000Z'),
      authorized_scopes: 'Water Meter, Flow Meter, Platform Balance, Weighbridge',
      authorized_categories: 'WATER_METER,FLOW_METER,NAWI_CLASS_III_150KG',
      authorized_state: 'Delhi',
      authorized_districts: 'ALL',
      authorized_area_type: 'STATE',
      is_active_recognition: true,
      state: 'Delhi',
      district: 'North Delhi',
      address: 'Local demonstration address',
      lab_head_name: 'Demo Lab Head',
      status: 'ACTIVE',
    },
  },
  {
    email: 'demo.admin@example.test',
    password: 'SihDemoAdmin2026!',
    role: 'admin',
    profile: {
      full_name: 'Demo Administrator',
      employeeCode: 'DEMO-ADMIN-01',
      designation: 'Local Demo Administrator',
      department: 'Local Demonstration',
    },
  },
];

module.exports = { demoPortals };
