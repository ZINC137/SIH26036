const { PrismaClient } = require('@prisma/client');
const { demoPortals } = require('../src/config/demoPortals');
const { seedRules } = require('../src/rules/seedRules');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function resetToDefault() {
  console.log('🔄 Starting database cleanup (preserving default seed data)...');

  const defaultEmails = demoPortals.map((p) => p.email.toLowerCase());
  console.log('📋 Default accounts to preserve:', defaultEmails.join(', '));

  // 1. Delete transactional records in correct dependency order
  console.log('🧹 Clearing verification test measurements...');
  await prisma.verificationMeasurement.deleteMany({});

  console.log('🧹 Clearing verification tests...');
  await prisma.verificationTest.deleteMany({});

  console.log('🧹 Clearing verification records...');
  await prisma.verificationRecord.deleteMany({});

  console.log('🧹 Clearing documents and file references...');
  await prisma.document.deleteMany({});

  console.log('🧹 Clearing notifications...');
  await prisma.notification.deleteMany({});

  console.log('🧹 Clearing submitted applications...');
  await prisma.application.deleteMany({});

  console.log('🧹 Clearing registered instruments...');
  await prisma.instrument.deleteMany({});

  console.log('🧹 Clearing non-system audit logs...');
  await prisma.auditLog.deleteMany({});

  // 2. Delete all non-default users (and their cascade profiles)
  console.log('🧹 Clearing non-default test users...');
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        notIn: defaultEmails,
      },
    },
  });
  console.log(`🗑️  Deleted ${deletedUsers.count} non-default user accounts.`);

  // 3. Re-seed default accounts and statutory rules to ensure pristine state
  console.log('🌱 Refreshing default portal accounts & statutory rules...');
  await seedRules();

  // 4. Optionally clean uploads folder
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    let removedFiles = 0;
    for (const file of files) {
      if (file !== '.gitkeep') {
        try {
          fs.unlinkSync(path.join(uploadsDir, file));
          removedFiles++;
        } catch (e) {
          // ignore lock issues
        }
      }
    }
    console.log(`📁 Cleaned ${removedFiles} uploaded temporary files from uploads folder.`);
  }

  console.log('\n✨ Database reset complete! All transactional data cleared, default accounts and statutory rules preserved.');
}

if (require.main === module) {
  resetToDefault()
    .catch((err) => {
      console.error('❌ Reset failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { resetToDefault };
