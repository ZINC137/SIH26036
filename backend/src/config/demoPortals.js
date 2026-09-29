const demoPortals = [
  {
    email: 'priya@example.com',
    password: 'UserPassword123!',
    role: 'user',
    profile: {
      full_name: 'Priya Sharma',
      organization: 'Metro Commercial Traders Ltd.',
    },
  },
  {
    email: 'lmo1@gov.in',
    password: 'LmoPassword2026!',
    role: 'lmo',
    profile: {
      full_name: 'Rajesh Sharma, LMO',
      employeeCode: 'LMO-DEL-01',
      gazetteOrderRef: 'ef',
      state: 'Delhi',
      districtDivision: 'North Delhi',
      zoneSubDivision: 'Zone 1 (Civil Lines & Sadar)',
      assignedJurisdiction: 'North Delhi, Delhi (Zone 1 (Civil Lines & Sadar))',
      dscKeyId: 'DSC-DEL-2026-8FA9C2-SHA256',
    },
  },
  {
    email: 'anjali@example.com',
    password: 'FoPassword123!',
    role: 'field_officer',
    profile: {
      full_name: 'Inspector Anjali Verma',
      employeeCode: 'FO-DEL-04',
      circleZone: 'Zone 1 (Civil Lines & Sadar, North Delhi)',
      circlePincode: '110054',
      activatedAt: new Date(),
    },
  },
  {
    email: 'gatc1@gov.in',
    password: 'GatcPassword123!',
    role: 'gatc',
    profile: {
      centre_name: 'National Metrological Calibration & Testing Centre',
      gatc_code: 'GATC-DEL-01',
      accreditation_no: 'NABL-GATC-2024-0091',
      valid_until: new Date('2028-12-31T00:00:00.000Z'),
      authorized_scopes: 'Weighbridges, Platform Balances, High Capacity Provers, Flow Meters',
      authorized_categories: 'WATER_METER,GAS_METER,FLOW_METER,WEIGHBRIDGE',
      authorized_state: 'Delhi',
      authorized_districts: 'ALL',
      authorized_area_type: 'STATE',
      is_active_recognition: true,
      state: 'Delhi',
      district: 'North Delhi',
      address: 'Plot 42, Okhla Industrial Area Phase III, New Delhi',
      lab_head_name: 'Dr. Suresh Nair (Chief Metrologist)',
      phone: '9871122334',
      status: 'ACTIVE',
    },
  },
  {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'admin',
    profile: {
      full_name: 'Dr. R. K. Mathur (Director General)',
      employeeCode: 'ADM-DEL-01',
      designation: 'Super Administrator & Director General',
      department: 'State Directorate of Legal Metrology, Delhi',
    },
  },
];

module.exports = { demoPortals };
