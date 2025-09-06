import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    // NOTE: In a real app, you'd get the user ID from the session.
    // For now, we'll use the first tenant as a default
    const tenant = await db.user.findFirst({
      where: { role: UserRole.TENANT },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Fetch tenancy information with all related data
    const tenancy = await db.tenancy.findFirst({
      where: { tenantId: tenant.id },
      include: {
        property: {
          include: {
            landlord: true,
          },
        },
        payments: {
          orderBy: {
            dueDate: 'desc',
          },
        },
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!tenancy) {
      return NextResponse.json({ error: 'No tenancy found for the tenant' }, { status: 404 })
    }

    // Fetch maintenance requests for the property
    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: { propertyId: tenancy.propertyId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate financial data
    const completedPayments = tenancy.payments.filter(p => p.status === 'COMPLETED')
    const lastPayment = completedPayments.length > 0 ? completedPayments[0] : null
    const pendingPayments = tenancy.payments.filter(p => p.status === 'PENDING')
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    // Calculate next payment due date (first pending payment or monthly cycle)
    const nextDueDate = pendingPayments.length > 0 
      ? pendingPayments[0].dueDate 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const data = {
      personalInfo: {
        name: tenant.name || 'N/A',
        email: tenant.email,
        phone: '+44 7700 900123', // Mock data - not in schema
        moveInDate: tenancy.startDate.toISOString(),
        leaseEnd: tenancy.endDate.toISOString(),
        propertyAddress: tenancy.property.address,
        propertyCity: tenancy.property.city,
        landlordName: tenancy.property.landlord.name || 'N/A',
        landlordEmail: tenancy.property.landlord.email,
        landlordPhone: '+44 7700 900456', // Mock data - not in schema
      },
      financials: {
        monthlyRent: tenancy.monthlyRent,
        securityDeposit: tenancy.deposit,
        balanceDue: totalPending,
        lastPaymentDate: lastPayment?.paymentDate?.toISOString() || 'N/A',
        nextPaymentDue: nextDueDate.toISOString(),
        paymentHistory: tenancy.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.paymentDate?.toISOString() || p.dueDate.toISOString(),
          status: p.status.toLowerCase(),
          method: 'bank_transfer', // Mock data - not in schema
        })),
      },
      maintenance: {
        openRequests: maintenanceRequests.filter(r => r.status === 'OPEN').length,
        inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
        recentRequests: maintenanceRequests.map(r => ({
          id: r.id,
          title: r.title,
          status: r.status.toLowerCase(),
          priority: r.priority.toLowerCase(),
          submittedDate: r.createdAt.toISOString(),
          estimatedCompletion: r.dueDate?.toISOString() || 'N/A',
        })),
      },
      documents: {
        leaseAgreement: {
          available: tenancy.documents.some(d => d.documentType === 'LEASE_AGREEMENT'),
          lastUpdated: tenancy.documents.find(d => d.documentType === 'LEASE_AGREEMENT')?.updatedAt.toISOString() || tenancy.startDate.toISOString(),
        },
        importantDocuments: tenancy.documents.map(d => ({
          id: d.id,
          name: d.originalName,
          type: d.documentType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          uploadDate: d.createdAt.toISOString(),
          size: `${(d.fileSize / 1024).toFixed(0)} KB`,
        })),
      },
      communications: { // Still mock - no message system yet
        unreadMessages: 2,
        recentMessages: [
          {
            id: "1",
            from: `${tenancy.property.landlord.name} (Landlord)`,
            subject: "Lease Renewal Notice",
            message: "Your lease is up for renewal soon. Please let me know if you'd like to continue.",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            unread: true
          },
          {
            id: "2",
            from: "Property Management System",
            subject: "Rent Payment Reminder",
            message: `Your next rent payment of £${tenancy.monthlyRent} is due soon.`,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            unread: true
          },
        ]
      }
    };

    return NextResponse.json(data)
  } catch (error) {
    console.error('[TENANT_DASHBOARD_API]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}