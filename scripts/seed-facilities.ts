import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding facilities...');

  // Create sample facilities
  const facilities = [
    {
      name: 'IDEA Space',
      description:
        'Heart of the CS Guild. A place to work on projects, learn, and collaborate with others.',
      location: 'P319, Phelan Building',
      capacity: 20,
      isActive: true,
    },
  ];

  for (const facility of facilities) {
    const existing = await prisma.facility.findUnique({
      where: { name: facility.name },
    });

    if (!existing) {
      await prisma.facility.create({
        data: facility,
      });
      console.log(`Created facility: ${facility.name}`);
    } else {
      console.log(`Facility already exists: ${facility.name}`);
    }
  }

  console.log('Facility seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
