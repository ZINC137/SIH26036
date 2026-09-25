const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.deleteMany({
    where: { email: { not: "admin@example.com" } },
  });
  console.log("Deleted " + result.count + " user(s). Admin account kept.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
