import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kinshasa center
const KINSHASA_LAT = -4.4419;
const KINSHASA_LNG = 15.2663;

function getRandomCoordinate(center: number, radius: number) {
  return center + (Math.random() - 0.5) * radius;
}

async function main() {
  console.log('Seeding provider locations...');

  const providers = await prisma.user.findMany({
    where: { role: 'PROVIDER' },
  });

  console.log(`Found ${providers.length} providers.`);

  for (const provider of providers) {
    const lat = getRandomCoordinate(KINSHASA_LAT, 0.1); // ~10km radius
    const lng = getRandomCoordinate(KINSHASA_LNG, 0.1);

    await prisma.user.update({
      where: { id: provider.id },
      data: {
        latitude: lat,
        longitude: lng,
        address: 'Kinshasa, RDC (Simulé)',
      },
    });
    console.log(`Updated provider ${provider.name} location.`);
  }

  console.log('Location seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
