const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function hashPwd(pwd) {
  return await argon2.hash(pwd, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    hashLength: 50,
  });
}

async function main() {
  console.log('Seeding database with dedicated role profile architecture...');

  // 1. Super Admin
  const adminEmail = 'admin@example.com';
  const adminHash = await hashPwd('AdminPassword123!');
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
      status: 'ACTIVE',
      is_verified: true,
    },
    create: {
      email: adminEmail,
      password_hash: adminHash,
      role: 'admin',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { user_id: admin.id },
    update: {
      full_name: 'Dr. R. K. Mathur (Director General)',
      employeeCode: 'ADM-DEL-01',
      clearanceLevel: 'TIER_1_DIRECTORATE',
      designation: 'Super Administrator & Director General',
      department: 'State Directorate of Legal Metrology, Delhi',
      phone: '9810011223',
    },
    create: {
      user_id: admin.id,
      full_name: 'Dr. R. K. Mathur (Director General)',
      employeeCode: 'ADM-DEL-01',
      clearanceLevel: 'TIER_1_DIRECTORATE',
      designation: 'Super Administrator & Director General',
      department: 'State Directorate of Legal Metrology, Delhi',
      phone: '9810011223',
    },
  });

  // 2. Appointed LMO (District Level with Class-3 DSC Key)
  const lmoEmail = 'rajesh@example.com';
  const lmoHash = await hashPwd('LmoPassword123!');
  const lmo = await prisma.user.upsert({
    where: { email: lmoEmail },
    update: {
      role: 'lmo',
      status: 'ACTIVE',
      is_verified: true,
    },
    create: {
      email: lmoEmail,
      password_hash: lmoHash,
      role: 'lmo',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.lmoProfile.upsert({
    where: { user_id: lmo.id },
    update: {
      full_name: 'Shri Rajesh Kumar',
      employeeCode: 'LMO-DEL-04',
      gazetteOrderRef: 'GOV/NOTIF/2026/89',
      state: 'Delhi',
      districtDivision: 'North Delhi',
      zoneSubDivision: 'Zone 1 & 2',
      assignedJurisdiction: 'Delhi North Division',
      dscKeyId: 'DSC-DL-2026-SHA256',
      appointedBy: admin.id,
      phone: '9876543210',
    },
    create: {
      user_id: lmo.id,
      full_name: 'Shri Rajesh Kumar',
      employeeCode: 'LMO-DEL-04',
      gazetteOrderRef: 'GOV/NOTIF/2026/89',
      state: 'Delhi',
      districtDivision: 'North Delhi',
      zoneSubDivision: 'Zone 1 & 2',
      assignedJurisdiction: 'Delhi North Division',
      dscKeyId: 'DSC-DL-2026-SHA256',
      appointedBy: admin.id,
      phone: '9876543210',
    },
  });

  // 3. Active Field Officer (Hardware-Bound)
  const foEmail = 'anjali@example.com';
  const foHash = await hashPwd('FoPassword123!');
  const fo = await prisma.user.upsert({
    where: { email: foEmail },
    update: {
      role: 'field_officer',
      status: 'ACTIVE',
      is_verified: true,
    },
    create: {
      email: foEmail,
      password_hash: foHash,
      role: 'field_officer',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.fieldOfficerProfile.upsert({
    where: { user_id: fo.id },
    update: {
      full_name: 'Inspector Anjali Singh',
      employeeCode: 'FO-DEL-102',
      designation: 'Senior Field Inspector',
      circleZone: 'Karol Bagh Circle - North Delhi',
      circlePincode: '110005',
      recommendingLmoId: lmo.id,
      recommendingLmoName: 'Shri Rajesh Kumar (North Delhi)',
      phone: '9876500002',
      activatedAt: new Date(),
    },
    create: {
      user_id: fo.id,
      full_name: 'Inspector Anjali Singh',
      employeeCode: 'FO-DEL-102',
      designation: 'Senior Field Inspector',
      circleZone: 'Karol Bagh Circle - North Delhi',
      circlePincode: '110005',
      recommendingLmoId: lmo.id,
      recommendingLmoName: 'Shri Rajesh Kumar (North Delhi)',
      phone: '9876500002',
      activatedAt: new Date(),
    },
  });


  // 4. Nominated Inspector (Awaiting Admin Clearance)
  const pendingFoEmail = 'vikram.fo@gov.in';
  const pendingHash = await hashPwd('TempPassword2026!');
  const pendingFo = await prisma.user.upsert({
    where: { email: pendingFoEmail },
    update: {
      role: 'field_officer',
      status: 'PENDING_VERIFICATION',
      is_verified: false,
    },
    create: {
      email: pendingFoEmail,
      password_hash: pendingHash,
      role: 'field_officer',
      status: 'PENDING_VERIFICATION',
      is_verified: false,
    },
  });

  await prisma.fieldOfficerProfile.upsert({
    where: { user_id: pendingFo.id },
    update: {
      full_name: 'Inspector Vikram Malhotra',
      employeeCode: 'FO-DEL-105',
      designation: 'Field Verification Inspector',
      circleZone: 'Rohini Sector 14 Circle',
      circlePincode: '110085',
      recommendingLmoId: lmo.id,
      recommendingLmoName: 'Shri Rajesh Kumar (North Delhi)',
      phone: '9876500005',
    },
    create: {
      user_id: pendingFo.id,
      full_name: 'Inspector Vikram Malhotra',
      employeeCode: 'FO-DEL-105',
      designation: 'Field Verification Inspector',
      circleZone: 'Rohini Sector 14 Circle',
      circlePincode: '110085',
      recommendingLmoId: lmo.id,
      recommendingLmoName: 'Shri Rajesh Kumar (North Delhi)',
      phone: '9876500005',
    },
  });

  // 5. Cleared Inspector (Awaiting First-Time Activation Token Entry)
  const activationFoEmail = 'neha.fo@gov.in';
  const activationHash = await hashPwd('TempPassword2026!');
  const activationFo = await prisma.user.upsert({
    where: { email: activationFoEmail },
    update: {
      role: 'field_officer',
      status: 'PENDING_ACTIVATION',
      is_verified: false,
    },
    create: {
      email: activationFoEmail,
      password_hash: activationHash,
      role: 'field_officer',
      status: 'PENDING_ACTIVATION',
      is_verified: false,
    },
  });

  await prisma.fieldOfficerProfile.upsert({
    where: { user_id: activationFo.id },
    update: {
      full_name: 'Inspector Neha Joshi',
      employeeCode: 'FO-DEL-106',
      designation: 'Sub-Inspector Legal Metrology',
      circleZone: 'Chandni Chowk Commercial Circle',
      circlePincode: '110006',
      activationToken: 'ACT-FO-9E41-7B22',
      recommendingLmoId: lmo.id,
      recommendingLmoName: 'Shri Rajesh Kumar (North Delhi)',
      phone: '9876500006',
    },
    create: {
      user_id: activationFo.id,
      full_name: 'Inspector Neha Joshi',
      employeeCode: 'FO-DEL-106',
      designation: 'Sub-Inspector Legal Metrology',
      circleZone: 'Chandni Chowk Commercial Circle',
      circlePincode: '110006',
      activationToken: 'ACT-FO-9E41-7B22',
      recommendingLmoId: lmo.id,
      recommendingLmoName: 'Shri Rajesh Kumar (North Delhi)',
      phone: '9876500006',
    },
  });

  // 6. Registered Citizen / Trader
  const citizenEmail = 'priya@example.com';
  const citizenHash = await hashPwd('UserPassword123!');
  const citizen = await prisma.user.upsert({
    where: { email: citizenEmail },
    update: {
      role: 'user',
      status: 'ACTIVE',
      is_verified: true,
    },
    create: {
      email: citizenEmail,
      password_hash: citizenHash,
      role: 'user',
      status: 'ACTIVE',
      is_verified: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { user_id: citizen.id },
    update: {
      full_name: 'Priya Sharma (Proprietor)',
      organization: 'Sharma Weighing Solutions',
      phone: '9876543219',
      address: 'Shop 14, Karol Bagh Market',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110005',
    },
    create: {
      user_id: citizen.id,
      full_name: 'Priya Sharma (Proprietor)',
      organization: 'Sharma Weighing Solutions',
      phone: '9876543219',
      address: 'Shop 14, Karol Bagh Market',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110005',
    },
  });

  // 7. Seed initial audit log
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LMO_COMMISSIONED',
        actor: 'admin@example.com',
        target: 'rajesh@example.com',
        details: 'Commissioned LMO Shri Rajesh Kumar (LmoProfile) with Gazette Ref: GOV/NOTIF/2026/89 and DSC: DSC-DL-2026-SHA256.',
      },
      {
        action: 'INSPECTOR_NOMINATED',
        actor: 'rajesh@example.com',
        target: 'vikram.fo@gov.in',
        details: 'Nominated Inspector Vikram Malhotra (FO-DEL-105) for Rohini Sector 14 Circle in FieldOfficerProfile.',
      },
      {
        action: 'INSPECTOR_CLEARANCE_APPROVED',
        actor: 'admin@example.com',
        target: 'neha.fo@gov.in',
        details: 'Clearance approved for Inspector Neha Joshi (FO-DEL-106). Generated single-use activation token ACT-FO-9E41-7B22.',
      },
    ],
  });

  console.log('✅ Dedicated profile architecture seeding completed!');
  console.log('--------------------------------------------------');
  console.log('Admin:         admin@example.com / AdminPassword123! [AdminProfile]');
  console.log('LMO Officer:   rajesh@example.com / LmoPassword123! [LmoProfile]');
  console.log('Field Officer: anjali@example.com / FoPassword123! [FieldOfficerProfile]');
  console.log('Pending FO:    vikram.fo@gov.in [FieldOfficerProfile: PENDING_VERIFICATION]');
  console.log('Activation FO: neha.fo@gov.in [FieldOfficerProfile: Token ACT-FO-9E41-7B22]');
  console.log('Citizen:       priya@example.com / UserPassword123! [UserProfile]');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
