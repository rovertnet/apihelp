import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.user.findMany({
    where: { role: 'PROVIDER' },
    select: { id: true, name: true, latitude: true, longitude: true }
  });
  console.log('Providers:', JSON.stringify(providers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
