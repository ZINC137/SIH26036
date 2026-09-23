require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../src/utils/emailService');

const prisma = new PrismaClient();

async function main() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('Usage: node scripts/resend-verification.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: targetEmail } });

  if (!user) {
    console.error(`No user found with email: ${targetEmail}`);
    process.exit(1);
  }

  if (user.is_verified) {
    console.log(`User ${targetEmail} is already verified!`);
    process.exit(0);
  }

  // Generate a fresh token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.user.update({
    where: { email: targetEmail },
    data: {
      verification_token: token,
      verification_token_expires_at: expiresAt,
    },
  });

  await sendVerificationEmail(targetEmail, token);
  console.log(`✅ Verification email resent to ${targetEmail}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
