import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { PaymentStatus } from '@prisma/client'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'

const paymentSchema = z.object({
  type: z.literal('payment'),
  amount: z.number().positive(),
  status: z.nativeEnum(PaymentStatus),
  dueDate: z.string().datetime(),
  propertyId: z.string(),
  tenancyId: z.string().optional().nullable(),
});

const expenseSchema = z.object({
    type: z.literal('expense'),
    title: z.string().min(1),
    description: z.string().min(1),
    amount: z.number().positive(),
    propertyId: z.string(),
});

const financialRecordSchema = z.discriminatedUnion("type", [
    paymentSchema,
    expenseSchema,
]);


export async function GET(request: Request) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    if (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const landlordId = session.user.id;

    const properties = await db.property.findMany({
      where: { landlordId: landlordId },
      include: {
        tenancies: {
          include: {
            tenant: true,
            payments: true,
          }
        }
      }
    });

    const payments = await db.payment.findMany({
      where: { landlordId: landlordId },
      include: {
        property: true,
        tenancy: {
          include: {
            tenant: true,
          }
        }
      }
    });

    const maintenanceRequests = await db.maintenanceRequest.findMany({
        where: { property: { landlordId: landlordId } },
        include: {
          property: true,
        }
    });

    const financialSummary = {
        totalProperties: properties.length,
        occupiedProperties: properties.filter(p => !p.isAvailable).length,
        monthlyRent: properties.reduce((sum, p) => sum + p.monthlyRent, 0),
        collectedRent: payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0),
        pendingRent: payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
        overdueRent: payments.filter(p => p.status === 'PENDING' && new Date(p.dueDate) < new Date()).reduce((sum, p) => sum + p.amount, 0),
        totalExpenses: maintenanceRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0),
        netIncome: payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0) - maintenanceRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0),
        occupancyRate: properties.length > 0 ? (properties.filter(p => !p.isAvailable).length / properties.length) * 100 : 0,
        collectionRate: payments.length > 0 ? (payments.filter(p => p.status === 'COMPLETED').length / payments.length) * 100 : 0,
        yearToDateRevenue: payments.filter(p => p.status === 'COMPLETED' && new Date(p.paymentDate!).getFullYear() === new Date().getFullYear()).reduce((sum, p) => sum + p.amount, 0),
        averageRent: properties.length > 0 ? properties.reduce((sum, p) => sum + p.monthlyRent, 0) / properties.length : 0
    };

    return NextResponse.json({ 
        properties,
        rentPayments: payments,
        expenses: maintenanceRequests,
        financialSummary 
    });

  } catch (error) {
    logger.error('Error fetching financial data:', { error, requestId, userId: session?.user?.id })
    
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
        error: 'Failed to fetch financial data',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const requestId = generateRequestId();
  let session;
  let validatedData;
  try {
    session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    if (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const landlordId = session.user.id;
    const body = await request.json();

    validatedData = financialRecordSchema.parse(body);

    if (validatedData.type === 'payment') {
      const payment = await db.payment.create({
        data: {
          amount: validatedData.amount,
          status: validatedData.status,
          dueDate: validatedData.dueDate,
          propertyId: validatedData.propertyId,
          landlordId: landlordId,
          tenancyId: validatedData.tenancyId,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: 'create_payment',
        resource: 'payment',
        resourceId: payment.id,
        changes: { after: payment },
        result: 'success',
      });

      return NextResponse.json({ payment }, { status: 201 });
    } else if (validatedData.type === 'expense') {
        const expense = await db.maintenanceRequest.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                status: 'COMPLETED',
                priority: 'medium',
                actualCost: validatedData.amount,
                propertyId: validatedData.propertyId,
                reportedBy: landlordId,
            }
        });

        await createAuditLog({
            userId: session.user.id,
            action: 'create_expense',
            resource: 'maintenance_request',
            resourceId: expense.id,
            changes: { after: expense },
            result: 'success',
        });

        return NextResponse.json({ expense }, { status: 201 });
    }

  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    await createAuditLog({
        userId: session?.user?.id || 'unknown',
        action: 'create_financial_record',
        resource: 'financial',
        resourceId: 'n/a',
        changes: { before: validatedData || {} },
        result: 'failure',
        errorDetails,
    });

    logger.error('Error creating financial record:', { error, requestId, userId: session?.user?.id })

    if (error instanceof z.ZodError) {
        return NextResponse.json(
            {
                error: 'Invalid input',
                code: ErrorCode.VALIDATION_FAILED,
                details: error.issues,
            },
            { status: 400 }
        );
    }
    
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
        error: 'Failed to create financial record',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}