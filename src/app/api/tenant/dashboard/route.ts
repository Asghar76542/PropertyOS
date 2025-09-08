import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'

export async function GET(request: Request) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    if (session.user.role !== 'TENANT') {
      throw new AppError('Insufficient permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const tenantId = session.user.id;

    const tenant = await db.user.findUnique({
        where: { id: tenantId }
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404, ErrorCode.NOT_FOUND);
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
      throw new AppError('No tenancy found for the tenant', 404, ErrorCode.NOT_FOUND);
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
        moveInDate: tenancy.startDate.toISOString(),
        leaseEnd: tenancy.endDate.toISOString(),
        propertyAddress: tenancy.property.address,
        propertyCity: tenancy.property.city,
        landlordName: tenancy.property.landlord.name || 'N/A',
        landlordEmail: tenancy.property.landlord.email,
        landlordId: tenancy.property.landlord.id,
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
          status: p.status,
          method: p.method || null,
        })),
      },
      maintenance: {
        openRequests: maintenanceRequests.filter(r => r.status === 'OPEN').length,
        inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
        recentRequests: maintenanceRequests.map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          priority: r.priority,
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
      communications: {
        unreadMessages: 0,
        recentMessages: []
      }
    };

    return NextResponse.json(data)
  } catch (error) {
    logger.error('[TENANT_DASHBOARD_API]', { error, requestId, userId: session?.user?.id })
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details 
        }, 
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}