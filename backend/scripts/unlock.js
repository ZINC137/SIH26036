const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: {
      failed_login_attempts: 0,
      lockout_until: null
    }
  });
  console.log('Account unlocked successfully:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
