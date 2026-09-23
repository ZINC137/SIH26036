const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { profile: true },
  });

  console.log('\n========== ALL USERS ==========');
  users.forEach((u, i) => {
    console.log(`\n[${i + 1}] ${u.email}`);
    console.log(`    ID          : ${u.id}`);
    console.log(`    Verified    : ${u.is_verified}`);
    console.log(`    Failed Tries: ${u.failed_login_attempts}`);
    console.log(`    Locked Until: ${u.lockout_until || 'Not locked'}`);
    console.log(`    Registered  : ${u.created_at}`);
    if (u.profile) {
      console.log(`    --- Profile ---`);
      console.log(`    Name        : ${u.profile.full_name}`);
      console.log(`    Phone       : ${u.profile.phone || 'N/A'}`);
      console.log(`    Organization: ${u.profile.organization || 'N/A'}`);
      console.log(`    Address     : ${u.profile.address || 'N/A'}`);
      console.log(`    City/State  : ${u.profile.city || 'N/A'}, ${u.profile.state || 'N/A'} - ${u.profile.pincode || 'N/A'}`);
    } else {
      console.log(`    Profile     : Not filled yet`);
    }
  });
  console.log('\n================================');
  console.log(`Total users: ${users.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
