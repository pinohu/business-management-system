import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create test project
  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Test Project',
      description: 'A test project for demonstration',
      status: 'IN_PROGRESS',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      budget: 10000,
      userId: admin.id,
    },
  });

  // Create test expense
  const expense = await prisma.expense.upsert({
    where: { id: 1 },
    update: {},
    create: {
      description: 'Office Supplies',
      amount: 500,
      date: new Date(),
      category: 'OFFICE',
      projectId: project.id,
      userId: admin.id,
    },
  });

  console.log({ admin, project, expense });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
