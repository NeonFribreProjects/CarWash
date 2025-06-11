import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting seed process...');

    // Check if data already exists
    const categoryCount = await prisma.category.count();
    if (categoryCount > 0) {
      console.log('Data already seeded, skipping...');
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
      where: { email: 'admin@carwash.com' },
      update: {},
      create: {
        email: 'admin@carwash.com',
        password: hashedPassword,
        name: 'Admin'
      },
    });

    // Create categories
    const categories = [
      { name: 'Car Wash Packages' },
      { name: 'Detailing Services' },
      { name: 'Premium Services' }
    ];

    console.log('Creating categories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
    }

    // Create services
    const services = [
      {
        name: 'Standard Package',
        duration: 120, // 2 hours
        price: 110,
        discount: 'Regular price: $150',
        description: [
          'Exterior hand wash & dry',
          'Wheel & tire cleaning',
          'Interior vacuuming',
          'Interior wipe down',
          'Carpet & upholstery shampoo',
          'Leather cleaning & conditioning',
          'Salt stain removal'
        ].join('\n'),
        categoryName: 'Car Wash Packages',
        vehicleType: 'All'
      },
      {
        name: 'Premium Package',
        duration: 180, // 3 hours
        price: 150,
        discount: 'Regular price: $190',
        description: [
          'Includes Standard Package',
          'Clay bar treatment',
          'Polishing & waxing',
          'Engine bay cleaning'
        ].join('\n'),
        categoryName: 'Car Wash Packages',
        vehicleType: 'All'
      },
      {
        name: 'Ultimate Package',
        duration: 240, // 4 hours
        price: 190,
        discount: 'Regular price: $220',
        description: [
          'Includes Premium Package',
          'Ceramic coating application',
          'Headlight restoration'
        ].join('\n'),
        categoryName: 'Car Wash Packages',
        vehicleType: 'All'
      },
      {
        name: 'SUV Premium Wash',
        duration: 150, // 2.5 hours
        price: 130,
        discount: 'Regular price: $170',
        description: [
          'Includes Standard Package',
          'Extended interior cleaning',
          'Roof rack cleaning',
          'Cargo area detailing'
        ].join('\n'),
        categoryName: 'Car Wash Packages',
        vehicleType: 'SUV'
      },
      {
        name: 'Interior Detailing',
        duration: 180, // 3 hours
        price: 160,
        discount: 'Regular price: $200',
        description: [
          'Deep interior cleaning',
          'Steam cleaning of all surfaces',
          'Odor removal',
          'Leather conditioning',
          'Dashboard and console detailing'
        ].join('\n'),
        categoryName: 'Detailing Services',
        vehicleType: 'All'
      },
      {
        name: 'Paint Correction',
        duration: 240, // 4 hours
        price: 250,
        discount: 'Regular price: $300',
        description: [
          'Paint swirl removal',
          'Scratch removal',
          'Paint polishing',
          'Paint sealant application'
        ].join('\n'),
        categoryName: 'Premium Services',
        vehicleType: 'All'
      }
    ];

    console.log('Creating services...');
    for (const service of services) {
      const category = await prisma.category.findFirst({
        where: { name: service.categoryName }
      });

      if (!category) {
        throw new Error(`Category ${service.categoryName} not found`);
      }

      const upsertedService = await prisma.service.upsert({
        where: {
          name_categoryId: {
            name: service.name,
            categoryId: category.id
          }
        },
        update: {
          price: service.price,
          duration: service.duration,
          discount: service.discount,
          description: service.description,
          vehicleType: service.vehicleType
        },
        create: {
          name: service.name,
          duration: service.duration,
          price: service.price,
          discount: service.discount,
          description: service.description,
          vehicleType: service.vehicleType,
          categoryId: category.id
        }
      });

      // Create availability after service is created
      await prisma.serviceAvailability.upsert({
        where: { serviceId: upsertedService.id },
        update: {},
        create: {
          serviceId: upsertedService.id,
          duration: service.duration,
          breakTime: 30, // 30 minutes break between car washes
          maxBookingsPerDay: 6, // Limit due to longer service duration
          daysAvailable: [1, 2, 3, 4, 5, 6] // Monday to Saturday
        }
      });
    }

    // Create business hours
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    for (const day of days) {
      await prisma.businessHours.upsert({
        where: { id: `day-${day}` },
        update: {},
        create: {
          id: `day-${day}`,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '18:00',
          isOpen: day !== 0 // Closed on Sundays
        }
      });
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    // Don't throw error to prevent deployment failure
    // but log it for monitoring
    console.error('Seed error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 
