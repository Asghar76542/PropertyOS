import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'

const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  monthlyRent: z.number().positive("Monthly rent must be a positive number"),
  deposit: z.number().positive("Deposit must be a positive number"),
  isAvailable: z.boolean().default(true),
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

    // Get properties with related data
    const properties = await db.property.findMany({
      where: { landlordId: landlordId },
      include: {
        tenancies: {
          include: {
            tenant: {
              select: { name: true, email: true }
            }
          }
        },
        maintenanceRequests: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        complianceRecords: {
          take: 3,
          orderBy: { dueDate: 'asc' }
        },
        payments: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ properties })
  } catch (error) {
    logger.error('Error fetching properties:', { error, requestId, userId: session?.user?.id })
    
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
        error: 'Failed to fetch properties',
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
    const body = await request.json()

    validatedData = propertySchema.parse(body);

    const property = await db.property.create({
      data: {
        ...validatedData,
        landlordId: landlordId
      }
    })

    await createAuditLog({
        userId: session.user.id,
        action: 'create_property',
        resource: 'property',
        resourceId: property.id,
        changes: { after: property },
        result: 'success',
    });

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    await createAuditLog({
        userId: session?.user?.id || 'unknown',
        action: 'create_property',
        resource: 'property',
        resourceId: 'n/a',
        changes: { before: validatedData || {} },
        result: 'failure',
        errorDetails,
    });

    logger.error('Error creating property:', { error, requestId, userId: session?.user?.id })

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
        error: 'Failed to create property',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}