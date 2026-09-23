require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Set admin role
  await prisma.user.update({ where: { email: 'admin@example.com' }, data: { role: 'admin' } });
  console.log('✅ admin@example.com → role: admin');

  // Print all users with roles
  const users = await prisma.user.findMany({ select: { email: true, role: true, is_verified: true } });
  console.log('\nAll users:');
  users.forEach(u => console.log(` - ${u.email} | role: ${u.role} | verified: ${u.is_verified}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
