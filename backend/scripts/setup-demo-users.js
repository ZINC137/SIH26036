const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function hashPassword(pwd) {
  return await argon2.hash(pwd, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    hashLength: 50,
  });
}

async function main() {
  console.log('--- Provisioning Demo Users for All 5 Portals ---');

  const userPwd = await hashPassword('UserPassword123!');
  const lmoPwd = await hashPassword('LmoPassword2026!');
  const foPwd = await hashPassword('FoPassword123!');
  const gatcPwd = await hashPassword('GatcPassword123!');
  const adminPwd = await hashPassword('AdminPassword123!');

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password_hash: adminPwd, role: 'admin', is_verified: true, status: 'ACTIVE' },
    create: {
      email: 'admin@example.com',
      password_hash: adminPwd,
      role: 'admin',
      status: 'ACTIVE',
      is_verified: true,
      adminProfile: {
        create: {
          full_name: 'Dr. R. K. Mathur (Director General)',
          employeeCode: 'ADM-DEL-01',
          clearanceLevel: 'TIER_1_DIRECTORATE',
          designation: 'Super Administrator & Director General',
          department: 'State Directorate of Legal Metrology, Delhi',
          phone: '9810011223',
        },
      },
    },
  });
  console.log('✓ Admin (admin@example.com) provisioned');

  // 2. LMO (lmo1@gov.in)
  const lmoUser = await prisma.user.upsert({
    where: { email: 'lmo1@gov.in' },
    update: { password_hash: lmoPwd, role: 'lmo', is_verified: true, status: 'ACTIVE' },
    create: {
      email: 'lmo1@gov.in',
      password_hash: lmoPwd,
      role: 'lmo',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.lmoProfile.upsert({
    where: { user_id: lmoUser.id },
    update: {
      full_name: 'Rajesh Sharma, LMO',
      employeeCode: 'LMO-DEL-01',
      state: 'Delhi',
      districtDivision: 'North Delhi',
      zoneSubDivision: 'Zone 1 (Civil Lines & Sadar)',
      assignedJurisdiction: 'North Delhi, Delhi (Zone 1 (Civil Lines & Sadar))',
      dscKeyId: 'DSC-DEL-2026-8FA9C2-SHA256',
    },
    create: {
      user_id: lmoUser.id,
      full_name: 'Rajesh Sharma, LMO',
      employeeCode: 'LMO-DEL-01',
      gazetteOrderRef: 'GO/DL/LM/2024/098',
      state: 'Delhi',
      districtDivision: 'North Delhi',
      zoneSubDivision: 'Zone 1 (Civil Lines & Sadar)',
      assignedJurisdiction: 'North Delhi, Delhi (Zone 1 (Civil Lines & Sadar))',
      dscKeyId: 'DSC-DEL-2026-8FA9C2-SHA256',
      phone: '9811223344',
    },
  });
  console.log('✓ LMO (lmo1@gov.in) provisioned');

  // 2b. GATC (gatc1@gov.in)
  const gatcUser = await prisma.user.upsert({
    where: { email: 'gatc1@gov.in' },
    update: { password_hash: gatcPwd, role: 'gatc', is_verified: true, status: 'ACTIVE' },
    create: {
      email: 'gatc1@gov.in',
      password_hash: gatcPwd,
      role: 'gatc',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.gatcProfile.upsert({
    where: { user_id: gatcUser.id },
    update: {
      centre_name: 'National Metrological Calibration & Testing Centre',
      gatc_code: 'GATC-DEL-01',
      accreditation_no: 'NABL-GATC-2024-0091',
      valid_until: new Date('2028-12-31'),
      authorized_scopes: 'Weighbridges, Platform Balances, High Capacity Provers, Flow Meters',
      authorized_categories: 'WATER_METER,GAS_METER,FLOW_METER,WEIGHBRIDGE',
      authorized_state: 'Delhi',
      authorized_districts: 'ALL',
      state: 'Delhi',
      district: 'North Delhi',
      address: 'Plot 42, Okhla Industrial Area Phase III, New Delhi',
      lab_head_name: 'Dr. Suresh Nair (Chief Metrologist)',
      phone: '9871122334',
      contact_email: 'gatc1@gov.in',
      status: 'ACTIVE',
    },
    create: {
      user_id: gatcUser.id,
      centre_name: 'National Metrological Calibration & Testing Centre',
      gatc_code: 'GATC-DEL-01',
      accreditation_no: 'NABL-GATC-2024-0091',
      valid_until: new Date('2028-12-31'),
      authorized_scopes: 'Weighbridges, Platform Balances, High Capacity Provers, Flow Meters',
      authorized_categories: 'WATER_METER,GAS_METER,FLOW_METER,WEIGHBRIDGE',
      authorized_state: 'Delhi',
      authorized_districts: 'ALL',
      state: 'Delhi',
      district: 'North Delhi',
      address: 'Plot 42, Okhla Industrial Area Phase III, New Delhi',
      lab_head_name: 'Dr. Suresh Nair (Chief Metrologist)',
      phone: '9871122334',
      contact_email: 'gatc1@gov.in',
      status: 'ACTIVE',
    },
  });
  console.log('✓ GATC (gatc1@gov.in) provisioned');

  // 3. Citizen User (priya@example.com)
  const citizenUsers = [
    { email: 'priya@example.com', name: 'Priya Sharma' },
  ];

  for (const c of citizenUsers) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { password_hash: userPwd, role: 'user', is_verified: true, status: 'ACTIVE' },
      create: {
        email: c.email,
        password_hash: userPwd,
        role: 'user',
        status: 'ACTIVE',
        is_verified: true,
      },
    });

    await prisma.userProfile.upsert({
      where: { user_id: user.id },
      update: {
        full_name: c.name,
        phone: '9876543210',
        organization: 'Metro Commercial Traders Ltd.',
        address: 'Shop 14, Azadpur Commercial Complex',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110033',
      },
      create: {
        user_id: user.id,
        full_name: c.name,
        phone: '9876543210',
        organization: 'Metro Commercial Traders Ltd.',
        address: 'Shop 14, Azadpur Commercial Complex',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110033',
      },
    });
    console.log(`✓ Citizen (${c.email}) provisioned`);
  }

  // 4. Multiple Field Officers with distinct circles & credentials
  const fieldOfficers = [
    {
      email: 'anjali@example.com',
      name: 'Inspector Anjali Verma',
      employeeCode: 'FO-DEL-04',
      circleZone: 'Zone 1 (Civil Lines & Sadar, North Delhi)',
      circlePincode: '110054',
      designation: 'Senior Field Verification Inspector',
      phone: '9822334455',
    },
    {
      email: 'rajesh@example.com',
      name: 'Inspector Rajesh Kumar',
      employeeCode: 'FO-DEL-07',
      circleZone: 'Zone 2 (Karol Bagh & Patel Nagar, Central Delhi)',
      circlePincode: '110005',
      designation: 'Field Verification Inspector',
      phone: '9876543211',
    },
    {
      email: 'vikram@example.com',
      name: 'Inspector Vikram Singh',
      employeeCode: 'FO-DEL-12',
      circleZone: 'Zone 3 (Rohini & Outer Delhi, North-West Delhi)',
      circlePincode: '110085',
      designation: 'Field Verification Inspector',
      phone: '9811223344',
    },
    {
      email: 'fo@gmail.com',
      name: 'Inspector Amit Sharma',
      employeeCode: 'FO-DEL-01',
      circleZone: 'Zone 4 (Chandni Chowk & Daryaganj, Old Delhi)',
      circlePincode: '110006',
      designation: 'Senior Enforcement Officer',
      phone: '9833445566',
    },
  ];

  for (const fo of fieldOfficers) {
    const foUser = await prisma.user.upsert({
      where: { email: fo.email },
      update: { password_hash: foPwd, role: 'field_officer', is_verified: true, status: 'ACTIVE' },
      create: {
        email: fo.email,
        password_hash: foPwd,
        role: 'field_officer',
        status: 'ACTIVE',
        is_verified: true,
      },
    });

    await prisma.fieldOfficerProfile.upsert({
      where: { user_id: foUser.id },
      update: {
        full_name: fo.name,
        employeeCode: fo.employeeCode,
        circleZone: fo.circleZone,
        circlePincode: fo.circlePincode,
        designation: fo.designation,
        phone: fo.phone,
      },
      create: {
        user_id: foUser.id,
        full_name: fo.name,
        employeeCode: fo.employeeCode,
        circleZone: fo.circleZone,
        circlePincode: fo.circlePincode,
        designation: fo.designation,
        phone: fo.phone,
      },
    });
    console.log(`✓ Field Officer (${fo.email} - ${fo.name}) provisioned`);
  }

  console.log('\nAll core demo profiles synchronized successfully!');
}

main()
  .catch((e) => {
    console.error('Error setting up demo users:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
