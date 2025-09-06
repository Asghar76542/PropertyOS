import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test landlord
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@example.com' },
    update: {},
    create: {
      email: 'landlord@example.com',
      name: 'John Landlord',
      role: 'LANDLORD',
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log('Created landlord:', landlord.id)

  // Create test properties
  const property1 = await prisma.property.create({
    data: {
      address: '123 Main Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 1,
      monthlyRent: 1200,
      deposit: 1200,
      isAvailable: false,
      landlordId: landlord.id,
    },
  })

  const property2 = await prisma.property.create({
    data: {
      address: '456 Oak Avenue',
      city: 'Manchester',
      postcode: 'M1 1AA',
      propertyType: 'House',
      bedrooms: 3,
      bathrooms: 2,
      monthlyRent: 1500,
      deposit: 1500,
      isAvailable: true,
      landlordId: landlord.id,
    },
  })

  const property3 = await prisma.property.create({
    data: {
      address: '789 Pine Road',
      city: 'Birmingham',
      postcode: 'B1 1AA',
      propertyType: 'Studio',
      bedrooms: 1,
      bathrooms: 1,
      monthlyRent: 900,
      deposit: 900,
      isAvailable: false,
      landlordId: landlord.id,
    },
  })

  console.log('Created properties:', [property1.id, property2.id, property3.id])

  // Create test tenants
  const tenant1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      email: 'sarah.johnson@example.com',
      name: 'Sarah Johnson',
      role: 'TENANT',
      subscriptionStatus: 'ACTIVE',
    },
  })

  const tenant2 = await prisma.user.upsert({
    where: { email: 'mike.brown@example.com' },
    update: {},
    create: {
      email: 'mike.brown@example.com',
      name: 'Mike Brown',
      role: 'TENANT',
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log('Created tenants:', [tenant1.id, tenant2.id])

  // Create test tenancies
  const tenancy1 = await prisma.tenancy.create({
    data: {
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      monthlyRent: 1200,
      deposit: 1200,
      status: 'active',
      propertyId: property1.id,
      landlordId: landlord.id,
      tenantId: tenant1.id,
    },
  })

  const tenancy2 = await prisma.tenancy.create({
    data: {
      startDate: new Date('2023-08-01'),
      endDate: new Date('2024-07-31'),
      monthlyRent: 900,
      deposit: 900,
      status: 'active',
      propertyId: property3.id,
      landlordId: landlord.id,
      tenantId: tenant2.id,
    },
  })

  console.log('Created tenancies:', [tenancy1.id, tenancy2.id])

  // Create test payments
  const payment1 = await prisma.payment.create({
    data: {
      amount: 1200,
      processingFee: 60,
      status: 'COMPLETED',
      paymentDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-01'),
      description: 'January rent',
      propertyId: property1.id,
      landlordId: landlord.id,
      tenancyId: tenancy1.id,
    },
  })

  const payment2 = await prisma.payment.create({
    data: {
      amount: 900,
      processingFee: 45,
      status: 'COMPLETED',
      paymentDate: new Date('2024-01-05'),
      dueDate: new Date('2024-01-05'),
      description: 'January rent',
      propertyId: property3.id,
      landlordId: landlord.id,
      tenancyId: tenancy2.id,
    },
  })

  const payment3 = await prisma.payment.create({
    data: {
      amount: 1200,
      processingFee: 60,
      status: 'PENDING',
      dueDate: new Date('2024-02-01'),
      description: 'February rent',
      propertyId: property1.id,
      landlordId: landlord.id,
      tenancyId: tenancy1.id,
    },
  })

  console.log('Created payments:', [payment1.id, payment2.id, payment3.id])

  // Create test documents
  const document1 = await prisma.document.create({
    data: {
      filename: 'lease-agreement-2023.pdf',
      originalName: 'Lease Agreement 2023-2024',
      filePath: '/uploads/lease-agreement-2023.pdf',
      fileSize: 2457600, // 2.4 MB
      mimeType: 'application/pdf',
      documentType: 'LEASE_AGREEMENT',
      description: 'Lease agreement for tenancy',
      propertyId: property1.id,
      uploadedBy: landlord.id,
      tenancyId: tenancy1.id,
    },
  })

  const document2 = await prisma.document.create({
    data: {
      filename: 'move-in-inspection-2023.pdf',
      originalName: 'Move-in Inspection Report',
      filePath: '/uploads/move-in-inspection-2023.pdf',
      fileSize: 1843200, // 1.8 MB
      mimeType: 'application/pdf',
      documentType: 'INVENTORY_REPORT',
      description: 'Move-in inspection report',
      propertyId: property1.id,
      uploadedBy: landlord.id,
      tenancyId: tenancy1.id,
    },
  })

  console.log('Created documents:', [document1.id, document2.id])

  // Create test maintenance requests
  const maintenance1 = await prisma.maintenanceRequest.create({
    data: {
      title: 'Leaking faucet',
      description: 'Kitchen faucet is leaking',
      status: 'OPEN',
      priority: 'medium',
      dueDate: new Date('2024-01-15'),
      propertyId: property1.id,
      reportedBy: landlord.id,
    },
  })

  const maintenance2 = await prisma.maintenanceRequest.create({
    data: {
      title: 'Broken heating',
      description: 'Heating system not working',
      status: 'IN_PROGRESS',
      priority: 'high',
      dueDate: new Date('2024-01-10'),
      propertyId: property3.id,
      reportedBy: landlord.id,
    },
  })

  const maintenance3 = await prisma.maintenanceRequest.create({
    data: {
      title: 'Painting required',
      description: 'Living room needs repainting',
      status: 'COMPLETED',
      priority: 'low',
      completedAt: new Date('2024-01-01'),
      propertyId: property2.id,
      reportedBy: landlord.id,
    },
  })

  console.log('Created maintenance requests:', [maintenance1.id, maintenance2.id, maintenance3.id])

  // Create test compliance records
  const compliance1 = await prisma.complianceRecord.create({
    data: {
      title: 'Gas Safety Certificate',
      description: 'Annual gas safety inspection',
      requirement: 'Gas Safety (Installation and Use) Regulations 1998',
      status: 'COMPLIANT',
      dueDate: new Date('2024-12-31'),
      completedAt: new Date('2024-01-01'),
      propertyId: property1.id,
    },
  })

  const compliance2 = await prisma.complianceRecord.create({
    data: {
      title: 'EPC Certificate',
      description: 'Energy Performance Certificate',
      requirement: 'Energy Performance of Buildings Regulations',
      status: 'PENDING',
      dueDate: new Date('2024-06-30'),
      propertyId: property2.id,
    },
  })

  const compliance3 = await prisma.complianceRecord.create({
    data: {
      title: 'Electrical Safety Certificate',
      description: 'Electrical installation condition report',
      requirement: 'Electrical Safety Standards in the Private Rented Sector Regulations 2020',
      status: 'OVERDUE',
      dueDate: new Date('2023-12-31'),
      propertyId: property3.id,
    },
  })

  console.log('Created compliance records:', [compliance1.id, compliance2.id, compliance3.id])

  // Create messages
  const message1 = await prisma.message.create({
    data: {
      subject: 'Lease Renewal Notice',
      body: 'Your lease is up for renewal soon. Please let me know if you\'d like to continue with the same terms.',
      fromId: landlord.id,
      toId: tenant1.id,
      read: false,
    },
  })

  const message2 = await prisma.message.create({
    data: {
      subject: 'Rent Payment Reminder',
      body: 'Your next rent payment of £1200 is due on the 5th of this month. Please ensure payment is made on time.',
      fromId: landlord.id,
      toId: tenant1.id,
      read: false,
    },
  })

  const message3 = await prisma.message.create({
    data: {
      subject: 'Heating System Update',
      body: 'The heating system repair has been completed. Please test it and let me know if there are any issues.',
      fromId: landlord.id,
      toId: tenant2.id,
      read: true,
    },
  })

  const message4 = await prisma.message.create({
    data: {
      subject: 'Welcome to Your New Home',
      body: 'Welcome to your new property! Please find attached the move-in checklist and important contact numbers.',
      fromId: landlord.id,
      toId: tenant2.id,
      read: false,
    },
  })

  // Tenant replies
  const message5 = await prisma.message.create({
    data: {
      subject: 'Re: Lease Renewal Notice',
      body: 'Thank you for the renewal notice. I would like to continue with the same terms. When do I need to sign the new agreement?',
      fromId: tenant1.id,
      toId: landlord.id,
      read: false,
    },
  })

  console.log('Created messages:', [message1.id, message2.id, message3.id, message4.id, message5.id])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })