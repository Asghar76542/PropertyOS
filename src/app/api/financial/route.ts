import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { Prisma, PaymentStatus, PaymentType, UserRole } from '@prisma/client';

import { authOptions, requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    requireRole(session, [UserRole.ADMIN, UserRole.LANDLORD]);

    const landlordId = session.user.id;

    // 1. Fetch all necessary data in parallel
    const [properties, payments] = await Promise.all([
      db.property.findMany({
        where: { landlordId },
        include: { tenancies: { include: { tenant: true } } },
      }),
      db.payment.findMany({
        where: { landlordId },
        include: { property: true, tenancy: { include: { tenant: true } } },
        orderBy: { dueDate: 'desc' },
      }),
    ]);

    // 2. Separate payments and calculate summary metrics
    const rentPayments = payments.filter(p => p.type === 'RENT');
    const expenses = payments.filter(p => p.type === 'EXPENSE');

    const totalIncome = rentPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpenses = expenses.reduce((sum, p) => sum + p.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    const totalPotentialRent = properties.reduce((sum, p) => sum + p.monthlyRent, 0);
    const collectionRate = totalPotentialRent > 0 ? (totalIncome / (totalPotentialRent * 12)) * 100 : 0; // Simplified annual rate

    const occupiedProperties = properties.filter(p => !p.isAvailable).length;
    const occupancyRate = properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0;

    const overdueRent = rentPayments
      .filter(p => p.status === 'PENDING' && new Date(p.dueDate) < new Date())
      .reduce((sum, p) => sum + p.amount, 0);

    const financialSummary = {
      monthlyRent: totalPotentialRent, // This is total monthly rent for all properties
      collectedRent: totalIncome, // Simplified for now
      collectionRate,
      netIncome,
      totalExpenses,
      occupancyRate,
      occupiedProperties,
      totalProperties: properties.length,
      overdueRent,
    };

    return NextResponse.json({
      properties,
      rentPayments,
      expenses,
      financialSummary,
    });

  } catch (error) {
    logger.error('[FINANCIAL_API_GET]', {
      error,
      requestId,
      userId: session?.user?.id,
    });

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

const transactionSchema = z.object({
  type: z.enum(['RENT', 'EXPENSE']),
  amount: z.number().positive(),
  status: z.nativeEnum(PaymentStatus).optional(),
  dueDate: z.string().datetime(),
  propertyId: z.string().min(1),
  tenancyId: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    requireRole(session, [UserRole.ADMIN, UserRole.LANDLORD]);

    const input = transactionSchema.parse(await req.json());

    // Verify user owns the property
    const property = await db.property.findFirst({
        where: { id: input.propertyId, landlordId: session.user.id }
    });
    if (!property) {
        throw new AppError('Property not found or access denied', 404, ErrorCode.NOT_FOUND);
    }

    const newTransaction = await db.payment.create({
      data: {
        amount: input.amount,
        type: input.type,
        status: input.status || (input.type === 'EXPENSE' ? 'COMPLETED' : 'PENDING'),
        dueDate: new Date(input.dueDate),
        propertyId: input.propertyId,
        tenancyId: input.tenancyId,
        description: input.description,
        landlordId: session.user.id,
        paymentDate: input.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'create_transaction',
      resource: 'payment',
      resourceId: newTransaction.id,
      changes: { after: newTransaction },
      result: 'success',
    });

    return NextResponse.json({ transaction: newTransaction }, { status: 201 });

  } catch (error) {
    logger.error('[FINANCIAL_API_POST]', {
      error,
      requestId,
      userId: session?.user?.id,
    });

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.statusCode }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: ErrorCode.VALIDATION_FAILED,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', code: ErrorCode.INTERNAL_ERROR, requestId },
      { status: 500 }
    );
  }
}
