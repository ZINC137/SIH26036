const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with a dummy user...');

  const email = 'admin@example.com';
  const password = 'AdminPassword123!';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`Dummy user ${email} already exists.`);
    return;
  }

  // Hash password
  const password_hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    hashLength: 50,
  });

  // Create verified user
  await prisma.user.create({
    data: {
      email,
      password_hash,
      is_verified: true, // Needs to be true to login
    },
  });

  console.log('Dummy user created successfully!');
  console.log('-----------------------------------');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
