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

  // 3. Citizen User (guptapriyanshu710@gmail.com & priya@example.com)
  const citizenUsers = [
    { email: 'guptapriyanshu710@gmail.com', name: 'Priyanshu Gupta' },
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

  // 4. Field Officer (anjali@example.com)
  const foUser = await prisma.user.upsert({
    where: { email: 'anjali@example.com' },
    update: { password_hash: foPwd, role: 'field_officer', is_verified: true, status: 'ACTIVE' },
    create: {
      email: 'anjali@example.com',
      password_hash: foPwd,
      role: 'field_officer',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.fieldOfficerProfile.upsert({
    where: { user_id: foUser.id },
    update: {
      full_name: 'Anjali Verma (Inspector)',
      employeeCode: 'FO-DEL-04',
      circleZone: 'Zone 1 (Civil Lines & Sadar)',
      circlePincode: '110054',
      designation: 'Field Verification Inspector',
    },
    create: {
      user_id: foUser.id,
      full_name: 'Anjali Verma (Inspector)',
      employeeCode: 'FO-DEL-04',
      circleZone: 'Zone 1 (Civil Lines & Sadar)',
      circlePincode: '110054',
      designation: 'Field Verification Inspector',
      phone: '9822334455',
    },
  });
  console.log('✓ Field Officer (anjali@example.com) provisioned');

  console.log('\nAll core demo profiles synchronized successfully!');
}

main()
  .catch((e) => {
    console.error('Error setting up demo users:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
