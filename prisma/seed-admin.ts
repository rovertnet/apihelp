import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@kinhelp.com';
  const password = 'adminpassword123'; // Change this to a secure password
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    // Update role just in case
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log('Updated existing user to ADMIN role.');
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
        city: 'Kinshasa',
      },
    });
    console.log(`Admin user created with email: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
