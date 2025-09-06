import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== USERS ===');
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });
    console.log(users);

    console.log('\n=== PROPERTIES ===');
    const properties = await db.property.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        monthlyRent: true,
        isAvailable: true,
      }
    });
    console.log(properties);

    console.log('\n=== TENANCIES ===');
    const tenancies = await db.tenancy.findMany({
      select: {
        id: true,
        startDate: true,
        endDate: true,
        monthlyRent: true,
        status: true,
        propertyId: true,
        tenantId: true,
        landlordId: true,
      }
    });
    console.log(tenancies);

    console.log('\n=== PAYMENTS ===');
    const payments = await db.payment.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        paymentDate: true,
        dueDate: true,
        tenancyId: true,
      }
    });
    console.log(payments);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkDatabase();
