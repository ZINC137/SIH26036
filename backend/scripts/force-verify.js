require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/force-verify.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      is_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
    },
  });

  console.log(`✅ Account manually verified: ${user.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
