import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { MaintenanceStatus } from '@prisma/client'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'

const maintenanceRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  priority: z.string().optional(),
  status: z.nativeEnum(MaintenanceStatus).optional(),
  assignedTo: z.string().optional(),
});

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

    const maintenanceRequests = await db.maintenanceRequest.findMany({
        where: { property: { landlordId: landlordId } },
        include: {
            property: true,
            reporter: true,
            assignee: true,
        }
    });

    const contractors = await db.user.findMany({
        where: { role: 'CONTRACTOR' }
    });

    return NextResponse.json({ 
        maintenanceRequests,
        contractors
    });

  } catch (error) {
    logger.error('Error fetching maintenance data:', { error, requestId, userId: session?.user?.id })
    
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
        error: 'Failed to fetch maintenance data',
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

    if (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN' && session.user.role !== 'TENANT') {
        throw new AppError('Insufficient permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const userId = session.user.id;
    const body = await request.json();

    validatedData = maintenanceRequestSchema.parse(body);

    const maintenanceRequest = await db.maintenanceRequest.create({
      data: {
        ...validatedData,
        reportedBy: userId,
      },
    });

    await createAuditLog({
        userId: session.user.id,
        action: 'create_maintenance_request',
        resource: 'maintenance_request',
        resourceId: maintenanceRequest.id,
        changes: { after: maintenanceRequest },
        result: 'success',
    });

    return NextResponse.json({ maintenanceRequest }, { status: 201 });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    await createAuditLog({
        userId: session?.user?.id || 'unknown',
        action: 'create_maintenance_request',
        resource: 'maintenance_request',
        resourceId: 'n/a',
        changes: { before: validatedData || {} },
        result: 'failure',
        errorDetails,
    });

    logger.error('Error creating maintenance request:', { error, requestId, userId: session?.user?.id })

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
        error: 'Failed to create maintenance request',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}