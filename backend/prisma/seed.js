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
  console.log('🧹 Clearing all data from the database...');

  // 1. Delete all existing records in proper dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.fieldOfficerProfile.deleteMany({});
  await prisma.lmoProfile.deleteMany({});
  await prisma.adminProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✨ All tables cleared successfully.');
  console.log('👑 Seeding single Super Admin account...');

  // 2. Create single root Super Administrator
  const adminEmail = 'admin@example.com';
  const adminPassword = 'AdminPassword123!';
  const adminHash = await hashPwd(adminPassword);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password_hash: adminHash,
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

  // 3. Initial system audit entry
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INITIALIZED',
      actor: adminEmail,
      target: 'DIRECTORATE_CORE',
      details: 'Database reset to clean state. Root Super Administrator provisioned (ADM-DEL-01). Ready for fresh government onboarding workflow.',
    },
  });

  console.log('==================================================');
  console.log('✅ DATABASE INITIALIZED WITH ONLY 1 ADMIN ACCOUNT:');
  console.log('   Role:     Super Administrator');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   Status:   ACTIVE (Verified)');
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
