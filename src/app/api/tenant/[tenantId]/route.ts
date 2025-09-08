import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole, PaymentStatus, MaintenanceStatus } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { tenantId } = params;

    // RBAC: Allow access only to the tenant themselves or an ADMIN.
    // Landlord access would require checking ownership of the property/tenancy.
    if (session.user.role !== 'ADMIN' && session.user.id !== tenantId) {
        throw new AppError('Insufficient permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const tenant = await db.user.findUnique({
      where: {
        id: tenantId,
        role: UserRole.TENANT
      }
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404, ErrorCode.NOT_FOUND);
    }

    const tenancy = await db.tenancy.findFirst({
      where: { tenantId: tenantId },
      include: {
        property: {
          include: {
            landlord: true
          }
        }
      }
    });

    if (!tenancy) {
      throw new AppError('No tenancy found for this tenant', 404, ErrorCode.NOT_FOUND);
    }

    const { property } = tenancy;
    const { landlord } = property;

    const payments = await db.payment.findMany({
      where: { tenancyId: tenancy.id },
      orderBy: { dueDate: 'desc' },
      take: 10
    });

    const documents = await db.document.findMany({
      where: { tenancyId: tenancy.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const messages = await db.message.findMany({
      where: { toId: tenantId },
      include: {
        from: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const unreadCount = await db.message.count({
      where: { toId: tenantId, read: false }
    });

    const totalPaid = payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING);
    const balanceDue = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const nextDueDate = pendingPayments.length > 0 
      ? pendingPayments[0].dueDate 
      : null;

    const openRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.OPEN).length;
    const inProgressRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length;
    const completedRequests = maintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED).length;

    const data = {
      personalInfo: {
        name: tenant.name || '',
        email: tenant.email,
        moveInDate: tenancy.startDate.toISOString(),
        leaseEnd: tenancy.endDate.toISOString(),
        propertyAddress: property.address,
        propertyCity: property.city,
        landlordName: landlord.name || '',
        landlordEmail: landlord.email,
      },
      financials: {
        monthlyRent: tenancy.monthlyRent,
        securityDeposit: tenancy.deposit,
        balanceDue: balanceDue,
        lastPaymentDate: payments.find(p => p.status === PaymentStatus.COMPLETED)?.paymentDate?.toISOString() || null,
        nextPaymentDue: nextDueDate?.toISOString() || null,
        paymentHistory: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.paymentDate?.toISOString() || payment.dueDate.toISOString(),
          status: payment.status,
          method: (payment as any).method || null // Added `any` cast until schema is updated
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
          submittedDate: request.createdAt.toISOString(),
          estimatedCompletion: request.dueDate?.toISOString() || null
        }))
      },
      documents: {
        leaseAgreement: {
          available: documents.some(d => d.documentType === 'LEASE_AGREEMENT'),
          lastUpdated: tenancy.startDate.toISOString()
        },
        importantDocuments: documents.map(doc => ({
          id: doc.id,
          name: doc.originalName,
          type: doc.documentType,
          uploadDate: doc.createdAt.toISOString(),
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
    };

    return NextResponse.json(data);

  } catch (error) {
    logger.error('[TENANT_API]', { error, requestId, userId: session?.user?.id });
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details }, 
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', code: ErrorCode.INTERNAL_ERROR, requestId }, 
      { status: 500 }
    );
  }
}
