import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { MaintenanceStatus, UserRole } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/lib/audit';

const updateMaintenanceSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(MaintenanceStatus).optional(),
  assignedTo: z.string().min(1).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  actualCost: z.number().nonnegative().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function PATCH(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const input = updateMaintenanceSchema.parse(await req.json());

    const existingRequest = await db.maintenanceRequest.findUnique({
      where: { id: input.id },
    });

    if (!existingRequest) {
      throw new AppError('Not Found', 404, ErrorCode.NOT_FOUND);
    }

    // RBAC: Tenant can only update their own requests, and with limited scope if needed.
    // Admins/Landlords have full access.
    if (
      session.user.role === UserRole.TENANT &&
      existingRequest.reportedBy !== session.user.id
    ) {
      throw new AppError(
        'Insufficient Permissions',
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    const updatedRequest = await db.maintenanceRequest.update({
      where: { id: input.id },
      data: {
        status: input.status,
        assignedTo: input.assignedTo,
        priority: input.priority,
        actualCost: input.actualCost,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      },
    });

    // If request is completed and has a cost, create an associated expense record.
    if (
      updatedRequest.status === 'COMPLETED' &&
      updatedRequest.actualCost &&
      updatedRequest.actualCost > 0
    ) {
      const property = await db.property.findUnique({
        where: { id: existingRequest.propertyId },
      });

      if (property) {
        await db.payment.create({
          data: {
            amount: updatedRequest.actualCost,
            status: 'COMPLETED',
            type: 'EXPENSE',
            description: `Expense for maintenance: ${updatedRequest.title}`,
            maintenanceId: updatedRequest.id,
            propertyId: existingRequest.propertyId,
            landlordId: property.landlordId,
            dueDate: new Date(),
            paymentDate: new Date(),
          },
        });
      }
    }

    await createAuditLog({
      userId: session.user.id,
      action: 'update_maintenance_request',
      resource: 'maintenance_request',
      resourceId: updatedRequest.id,
      changes: { before: existingRequest, after: updatedRequest },
      result: 'success',
    });

    return NextResponse.json({ maintenanceRequest: updatedRequest });
  } catch (error) {
    logger.error('[MAINTENANCE_API_PATCH]', {
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

// Placeholder for GET and POST
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    // Allow all authenticated users to view maintenance requests, 
    // but scope the results based on their role.

    const where: Prisma.MaintenanceRequestWhereInput = {};
    if (session.user.role === UserRole.TENANT) {
      where.reportedById = session.user.id;
    } else if (session.user.role === UserRole.LANDLORD) {
      // Assuming landlords see all requests for their properties.
      // This requires getting a list of their property IDs first.
      const properties = await db.property.findMany({
        where: { landlordId: session.user.id },
        select: { id: true },
      });
      const propertyIds = properties.map((p) => p.id);
      where.propertyId = { in: propertyIds };
    } else if (session.user.role === UserRole.CONTRACTOR) {
        where.assignedToId = session.user.id;
    }
    // ADMINs have no restrictions

    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where,
      include: { 
        property: { select: { address: true } }, 
        assignee: { select: { name: true, id: true } },
        reporter: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // For dropdowns, get a list of contractors
    const contractors = await db.user.findMany({
        where: { role: UserRole.CONTRACTOR },
        select: { id: true, name: true },
    });

    return NextResponse.json({ maintenanceRequests, contractors });

  } catch (error) {
    logger.error('[MAINTENANCE_API_GET]', {
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

const createMaintenanceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  propertyId: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const input = createMaintenanceSchema.parse(await req.json());

    // Verify property ownership/tenancy before allowing creation
    const property = await db.property.findUnique({
      where: { id: input.propertyId },
      include: { tenancies: { where: { tenantId: session.user.id } } },
    });

    if (!property) {
      throw new AppError('Property not found', 404, ErrorCode.NOT_FOUND);
    }

    const isLandlord = property.landlordId === session.user.id;
    const isTenant = property.tenancies.length > 0;

    if (session.user.role === UserRole.LANDLORD && !isLandlord) {
        throw new AppError('Landlord does not own this property', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    if (session.user.role === UserRole.TENANT && !isTenant) {
        throw new AppError('Tenant does not rent this property', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const newRequest = await db.maintenanceRequest.create({
      data: {
        title: input.title,
        description: input.description,
        propertyId: input.propertyId,
        priority: input.priority || 'MEDIUM',
        reportedById: session.user.id,
        status: 'OPEN',
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'create_maintenance_request',
      resource: 'maintenance_request',
      resourceId: newRequest.id,
      changes: { after: newRequest },
      result: 'success',
    });

    return NextResponse.json({ maintenanceRequest: newRequest }, { status: 201 });

  } catch (error) {
    logger.error('[MAINTENANCE_API_POST]', {
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
