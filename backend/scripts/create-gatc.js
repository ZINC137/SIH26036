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

async function createOrUpdateGatc({
  email,
  password,
  centreName,
  gatcCode,
  accreditationNo,
  scopes,
  categories,
  state,
  district,
  areaType,
  address,
  labHeadName,
  phone,
}) {
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await hashPassword(password);
  const validUntil = new Date('2029-12-31T23:59:59.000Z');

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password_hash: passwordHash,
        role: 'gatc',
        status: 'ACTIVE',
        is_verified: true,
      },
    });
    console.log(`Created new GATC user: ${normalizedEmail}`);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        role: 'gatc',
        status: 'ACTIVE',
        is_verified: true,
        failed_login_attempts: 0,
        lockout_until: null,
      },
    });
    console.log(`Updated existing user to GATC role: ${normalizedEmail}`);
  }

  // Create or update GatcProfile
  const existingProfile = await prisma.gatcProfile.findUnique({
    where: { user_id: user.id },
  });

  if (existingProfile) {
    await prisma.gatcProfile.update({
      where: { id: existingProfile.id },
      data: {
        centre_name: centreName,
        gatc_code: gatcCode,
        accreditation_no: accreditationNo,
        valid_until: validUntil,
        authorized_scopes: scopes,
        authorized_categories: categories,
        authorized_state: state,
        authorized_districts: 'ALL',
        authorized_area_type: areaType || 'STATE',
        is_active_recognition: true,
        state,
        district,
        address,
        lab_head_name: labHeadName,
        phone,
        contact_email: normalizedEmail,
        status: 'ACTIVE',
      },
    });
    console.log(`Updated GatcProfile for: ${gatcCode}`);
  } else {
    // If another profile has this gatc_code, update it or remove duplicate
    const codeConflict = await prisma.gatcProfile.findUnique({
      where: { gatc_code: gatcCode },
    });
    if (codeConflict) {
      await prisma.gatcProfile.delete({ where: { id: codeConflict.id } });
    }

    await prisma.gatcProfile.create({
      data: {
        user_id: user.id,
        centre_name: centreName,
        gatc_code: gatcCode,
        accreditation_no: accreditationNo,
        valid_until: validUntil,
        authorized_scopes: scopes,
        authorized_categories: categories,
        authorized_state: state,
        authorized_districts: 'ALL',
        authorized_area_type: areaType || 'STATE',
        is_active_recognition: true,
        state,
        district,
        address,
        lab_head_name: labHeadName,
        phone,
        contact_email: normalizedEmail,
        status: 'ACTIVE',
        appointed_by: 'ADM-DEL-01',
      },
    });
    console.log(`Created GatcProfile for: ${gatcCode}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('PROVISIONING GATC CREDENTIALS & LAB PROFILES');
  console.log('====================================================\n');

  // 1. Primary SIH Demo GATC Centre (Delhi)
  await createOrUpdateGatc({
    email: 'gatc1@gov.in',
    password: 'GatcPassword123!',
    centreName: 'National Legal Metrology Testing & Calibration Centre (GATC-DL-01)',
    gatcCode: 'GATC-DL-01',
    accreditationNo: 'NABL/TC-5489/2026',
    scopes: 'Weighbridges, Platform Balances, Fuel Dispensers, Precision Flow Meters, Water Meters, Gas Meters, Proving Tanks',
    categories: 'WATER_METER,GAS_METER,FLOW_METER,PETROL_DIESEL_DISPENSER,CNG_DISPENSER,LPG_DISPENSER,NAWI_CLASS_III_150KG,AUTOMATIC_RAIL_WEIGHBRIDGE,LOAD_CELL,WEIGHTS_ALL',
    state: 'Delhi',
    district: 'North Delhi',
    areaType: 'STATE',
    address: 'Plot 42, Okhla Industrial Area Phase-III, New Delhi - 110020',
    labHeadName: 'Dr. Vikramaditya Sharma (Chief Metrologist)',
    phone: '+91 98112 34567',
  });

  // 2. Personal GATC Account for Priyanshu (Delhi State Jurisdiction)
  await createOrUpdateGatc({
    email: 'priyanshuguptaiitg710@gmail.com',
    password: 'GatcPassword123!',
    centreName: 'Apex Metrology Calibration & Testing Laboratory (GATC-DL-02)',
    gatcCode: 'GATC-DL-02',
    accreditationNo: 'NABL/TC-7890/2026',
    scopes: 'Weighbridges, Platform Balances, Fuel Dispensers, Precision Flow Meters, Water Meters, Gas Meters, Load Cells',
    categories: 'WATER_METER,GAS_METER,FLOW_METER,PETROL_DIESEL_DISPENSER,CNG_DISPENSER,LPG_DISPENSER,NAWI_CLASS_III_150KG,AUTOMATIC_RAIL_WEIGHBRIDGE,LOAD_CELL,WEIGHTS_ALL',
    state: 'Delhi',
    district: 'North Delhi',
    areaType: 'STATE', // Authorized in Delhi
    address: 'Metrology Bhavan, Technology Enclave, New Delhi - 110016',
    labHeadName: 'Priyanshu Gupta (Director & Lead Metrologist)',
    phone: '+91 98765 43210',
  });

  // 3. Maharashtra GATC Centre (for cross-state / routing engine tests)
  await createOrUpdateGatc({
    email: 'contact@apexcalibration.com',
    password: 'GatcPassword123!',
    centreName: 'Maharashtra State Metrology Calibration Centre (GATC-MA-02)',
    gatcCode: 'GATC-MA-02',
    accreditationNo: 'NABL/TC-6120/2026',
    scopes: 'Flow Meters, Bulk Milk Chillers, Weighbridges, Proving Tanks',
    categories: 'FLOW_METER,BULK_MILK_CHILLER,WATER_METER,NAWI_CLASS_III_150KG',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    areaType: 'STATE',
    address: 'MIDC Industrial Estate, Andheri East, Mumbai, Maharashtra - 400093',
    labHeadName: 'Er. Amit Deshmukh',
    phone: '+91 98201 54321',
  });

  console.log('\n====================================================');
  console.log('✅ GATC CREDENTIALS READY FOR LOGIN:');
  console.log('----------------------------------------------------');
  console.log('1. Official Demo GATC:');
  console.log('   Portal:   http://localhost:3000/login?role=gatc');
  console.log('   Email:    gatc1@gov.in');
  console.log('   Password: GatcPassword123!');
  console.log('   Code:     GATC-DL-01');
  console.log('   (Supports 1-Click "Auto Fill" button on login page)');
  console.log('----------------------------------------------------');
  console.log('2. Personal GATC for Priyanshu:');
  console.log('   Portal:   http://localhost:3000/login?role=gatc');
  console.log('   Email:    priyanshuguptaiitg710@gmail.com');
  console.log('   Password: GatcPassword123!');
  console.log('   Code:     GATC-DL-02 (National Accreditation)');
  console.log('====================================================\n');
}

main()
  .catch((e) => {
    console.error('Error creating GATCs:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
