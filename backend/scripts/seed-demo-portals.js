require('dotenv').config();

const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const { demoPortals } = require('../src/config/demoPortals');

if (process.env.NODE_ENV === 'production') {
  throw new Error('Demo portal accounts may only be provisioned outside production.');
}

if (!process.env.DATABASE_URL?.startsWith('file:')) {
  throw new Error('Demo portal accounts require a local SQLite DATABASE_URL.');
}

const prisma = new PrismaClient();

async function upsertProfile(tx, userId, portal) {
  if (portal.role === 'user') {
    await tx.userProfile.upsert({
      where: { user_id: userId },
      update: portal.profile,
      create: { user_id: userId, ...portal.profile },
    });
    return;
  }

  const profileModel = {
    lmo: 'lmoProfile',
    field_officer: 'fieldOfficerProfile',
    gatc: 'gatcProfile',
    admin: 'adminProfile',
  }[portal.role];

  await tx[profileModel].upsert({
    where: { user_id: userId },
    update: portal.profile,
    create: { user_id: userId, ...portal.profile },
  });
}

async function seedDemoPortals() {
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: demoPortals.map(({ email }) => email) } },
    select: { email: true, role: true },
  });
  const conflictingUser = existingUsers.find(
    (user) => user.role !== demoPortals.find((portal) => portal.email === user.email)?.role
  );
  if (conflictingUser) {
    throw new Error(
      `Refusing to repurpose ${conflictingUser.email}, which already belongs to role "${conflictingUser.role}".`
    );
  }

  for (const portal of demoPortals) {
    const password_hash = await argon2.hash(portal.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: portal.email },
        update: {
          password_hash,
          role: portal.role,
          status: 'ACTIVE',
          is_verified: true,
          failed_login_attempts: 0,
          lockout_until: null,
        },
        create: {
          email: portal.email,
          password_hash,
          role: portal.role,
          status: 'ACTIVE',
          is_verified: true,
        },
      });

      await upsertProfile(tx, user.id, portal);
    });
  }

  console.log('Local demo portal accounts are ready:');
  for (const { email, password, role } of demoPortals) {
    console.log(`${role}: ${email} / ${password}`);
  }
}

seedDemoPortals()
  .catch((error) => {
    console.error('Failed to provision local demo portals:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
