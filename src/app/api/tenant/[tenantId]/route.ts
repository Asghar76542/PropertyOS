import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole, PaymentStatus, MaintenanceStatus } from '@prisma/client'

export async function GET(
  request: Request,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params

    // Fetch tenant information
    const tenant = await db.user.findUnique({
      where: {
        id: tenantId,
        role: UserRole.TENANT
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Fetch tenancy information
    const tenancies = await db.tenancy.findMany({
      where: { tenantId: tenantId },
      include: {
        property: {
          include: {
            landlord: true
          }
        }
      }
    })

    if (!tenancies.length) {
      return NextResponse.json({ error: 'No tenancy found for this tenant' }, { status: 404 })
    }

    // Use the first (active) tenancy
    const currentTenancy = tenancies[0]
    const property = currentTenancy.property
    const landlord = property.landlord

    // Fetch payments for this tenancy
    const payments = await db.payment.findMany({
      where: { tenancyId: currentTenancy.id },
      orderBy: { dueDate: 'desc' },
      take: 10
    })

    // Fetch documents for this tenancy
    const documents = await db.document.findMany({
      where: { tenancyId: currentTenancy.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Fetch maintenance requests for the property
    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Fetch messages for this tenant
    const messages = await db.message.findMany({
      where: { toId: tenantId },
      include: {
        from: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Count unread messages
    const unreadCount = await db.message.count({
      where: {
        toId: tenantId,
        read: false
      }
    })

    // Calculate financial information
    const totalPaid = payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + payment.amount, 0)

    const pendingPayments = payments
      .filter(p => p.status === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + payment.amount, 0)

    const balanceDue = pendingPayments

    // Calculate maintenance statistics
    const openRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.OPEN).length
    const inProgressRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length
    const completedRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED).length

    const data = {
      personalInfo: {
        name: tenant.name || '',
        email: tenant.email,
        phone: '+44 7700 900123', // Mock data - add to user model later
        moveInDate: currentTenancy.startDate,
        leaseEnd: currentTenancy.endDate,
        propertyAddress: property.address,
        propertyCity: property.city,
        landlordName: landlord.name || '',
        landlordEmail: landlord.email,
        landlordPhone: '+44 7700 900456' // Mock data
      },
      financials: {
        monthlyRent: currentTenancy.monthlyRent,
        securityDeposit: currentTenancy.deposit,
        balanceDue: balanceDue,
        lastPaymentDate: payments.find(p => p.status === PaymentStatus.COMPLETED)?.paymentDate || null,
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentHistory: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.paymentDate,
          status: payment.status,
          method: 'bank_transfer' // Mock data - add to payment model later
        }))
      },
      maintenance: {
        openRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        recentRequests: maintenanceRequests.slice(0, 5).map(request => ({
          id: request.id,
          title: request.title,
          status: request.status,
          priority: request.priority,
          submittedDate: request.createdAt,
          estimatedCompletion: request.dueDate
        }))
      },
      documents: {
        leaseAgreement: {
          available: documents.some(d => d.documentType === 'LEASE_AGREEMENT'),
          lastUpdated: currentTenancy.startDate
        },
        importantDocuments: documents.map(doc => ({
          id: doc.id,
          name: doc.originalName,
          type: doc.documentType,
          uploadDate: doc.createdAt,
          size: doc.fileSize
        }))
      },
      communications: {
        unreadMessages: unreadCount,
        recentMessages: messages.map(message => ({
          id: message.id,
          from: `${message.from.name} (${message.from.role === 'LANDLORD' ? 'Landlord' : 'System'})`,
          subject: message.subject,
          message: message.body,
          date: message.createdAt.toISOString(),
          unread: !message.read
        }))
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tenant data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
