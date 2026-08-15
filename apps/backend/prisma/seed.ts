import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database...');

  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });

  const userPasswordHash = await bcrypt.hash('User123!', 10);

  // Standard User Account (USER role)
  const standardUser = await prisma.user.upsert({
    where: { email: 'user@acme.com' },
    update: { passwordHash: userPasswordHash, role: Role.USER },
    create: {
      email: 'user@acme.com',
      name: 'Standard User',
      passwordHash: userPasswordHash,
      role: Role.USER,
      organizationId: org.id,
    },
  });

  // Admin Account updated to USER role if requested
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: { role: Role.USER },
    create: {
      email: 'admin@acme.com',
      name: 'Acme User',
      passwordHash: userPasswordHash,
      role: Role.USER,
      organizationId: org.id,
    },
  });

  console.log('Seeding complete!');
  console.log('Org ID:', org.id);
  console.log('Standard User Email:', standardUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
