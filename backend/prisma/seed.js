const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = (pw) => bcrypt.hash(pw, 10);

  // Remove old generic demo accounts
  
  await prisma.user.deleteMany({ where: { email: { in: ['creator@example.com','consumer@example.com'] } } });

  // Seed project-specific accounts

  await prisma.user.upsert({
    where: { email: 'melika@snapstream.com' },
    update: { passwordHash: await hash('Melika@Str1!'), name: 'Melika Rosta' },
    create: { name: 'Melika Rosta', email: 'melika@snapstream.com', passwordHash: await hash('Melika@Str1!'), role: 'creator' },
  });
  await prisma.user.upsert({
    where: { email: 'omar@snapstream.com' },
    update: { passwordHash: await hash('Omar#Vid2!'), name: 'Omar Hassan' },
    create: { name: 'Omar Hassan', email: 'omar@snapstream.com', passwordHash: await hash('Omar#Vid2!'), role: 'creator' },
  });
  await prisma.user.upsert({
    where: { email: 'nina@snapstream.com' },
    update: { passwordHash: await hash('Nina!Cole3@'), name: 'Nina Cole' },
    create: { name: 'Nina Cole', email: 'nina@snapstream.com', passwordHash: await hash('Nina!Cole3@'), role: 'creator' },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@snapstream.com' },
    update: { passwordHash: await hash('Cam@View1!2'), name: 'Cam Viewer' },
    create: { name: 'Cam Viewer', email: 'viewer@snapstream.com', passwordHash: await hash('Cam@View1!2'), role: 'consumer' },
  });

  console.log('Seeded SnapStream — 4 accounts');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
