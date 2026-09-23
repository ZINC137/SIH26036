const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function setup() {
  const users = [
    { email: 'admin@example.com',    password: 'AdminPassword123!',   role: 'admin' },
    { email: 'lmo@example.com',      password: 'LmoPassword123!',     role: 'lmo' },
    { email: 'officer@example.com',  password: 'OfficerPassword123!', role: 'field_officer' },
    { email: 'user@example.com',     password: 'UserPassword123!',    role: 'user' },
  ];

  for (const u of users) {
    await prisma.user.deleteMany({ where: { email: u.email } });
    const hash = await argon2.hash(u.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });
    await prisma.user.create({
      data: {
        email: u.email,
        password_hash: hash,
        role: u.role,
        is_verified: true,
      },
    });
    console.log(`✅ Created: ${u.email} | role: ${u.role}`);
  }

  console.log('\n--- Test Credentials ---');
  users.forEach(u => console.log(`${u.role.padEnd(14)} → ${u.email} / ${u.password}`));

  await prisma.$disconnect();
}

setup().catch(e => {
  console.error(e);
  process.exit(1);
});
