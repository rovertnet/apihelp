import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Coordonnées de communes de Kinshasa
const kinshasaLocations = [
  { name: 'Gombe', lat: -4.3250, lng: 15.3152 },
  { name: 'Limete', lat: -4.3698, lng: 15.2894 },
  { name: 'Ngaliema', lat: -4.3789, lng: 15.2619 },
  { name: 'Kasa-Vubu', lat: -4.3315, lng: 15.2845 },
  { name: 'Kalamu', lat: -4.3419, lng: 15.3008 },
  { name: 'Bandalungwa', lat: -4.3537, lng: 15.2931 },
  { name: 'Makala', lat: -4.3502, lng: 15.2748 },
  { name: 'Ngiri-Ngiri', lat: -4.3582, lng: 15.2627 },
  { name: 'Barumbu', lat: -4.3195, lng: 15.3089 },
  { name: 'Kinshasa', lat: -4.3275, lng: 15.3136 },
];

async function main() {
  console.log('🔄 Mise à jour des coordonnées des prestataires...\n');

  // Récupérer tous les prestataires sans coordonnées
  const providers = await prisma.user.findMany({
    where: {
      role: 'PROVIDER',
      OR: [
        { latitude: null },
        { longitude: null },
      ],
    },
  });

  if (providers.length === 0) {
    console.log('✅ Tous les prestataires ont déjà des coordonnées');
    return;
  }

  console.log(`📍 ${providers.length} prestataire(s) sans coordonnées trouvé(s)\n`);

  // Attribution de coordonnées aléatoires depuis Kinshasa
  for (const [index, provider] of providers.entries()) {
    const location = kinshasaLocations[index % kinshasaLocations.length];
    
    // Ajouter une petite variation aléatoire aux coordonnées (±0.01 degré)
    const randomLat = location.lat + (Math.random() - 0.5) * 0.02;
    const randomLng = location.lng + (Math.random() - 0.5) * 0.02;

    await prisma.user.update({
      where: { id: provider.id },
      data: {
        latitude: randomLat,
        longitude: randomLng,
        city: location.name,
        address: `${location.name}, Kinshasa`,
      },
    });

    console.log(`✅ ${provider.name} → ${location.name} (${randomLat.toFixed(4)}, ${randomLng.toFixed(4)})`);
  }

  console.log(`\n🎉 ${providers.length} prestataire(s) mis à jour avec succès !`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
