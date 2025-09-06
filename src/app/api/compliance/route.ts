import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'

const complianceRecordSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirement: z.string().min(1, "Requirement is required"),
  dueDate: z.string().datetime(),
  propertyId: z.string().min(1, "Property ID is required"),
})

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

    const complianceRecords = await db.complianceRecord.findMany({
        where: { property: { landlordId: landlordId } },
        include: {
            property: true,
            document: true,
        }
    });

    const calculateComplianceRate = (records: any[], category: string) => {
        const categoryRecords = records.filter(r => r.title.includes(category));
        if (categoryRecords.length === 0) return 0;
        const compliantRecords = categoryRecords.filter(r => r.status === 'COMPLIANT').length;
        return (compliantRecords / categoryRecords.length) * 100;
    }

    const complianceStatus = {
        overall: complianceRecords.length > 0 ? (complianceRecords.filter(r => r.status === 'COMPLIANT').length / complianceRecords.length) * 100 : 0,
        gasSafety: calculateComplianceRate(complianceRecords, 'Gas Safety'),
        epc: calculateComplianceRate(complianceRecords, 'EPC'),
        electrical: calculateComplianceRate(complianceRecords, 'Electrical'),
        fireSafety: calculateComplianceRate(complianceRecords, 'Fire Safety'),
        hmoLicense: calculateComplianceRate(complianceRecords, 'HMO')
    };

    return NextResponse.json({ 
        complianceRecords,
        complianceStatus
    });

  } catch (error) {
    logger.error('Error fetching compliance data:', { error, requestId, userId: session?.user?.id })
    
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
        error: 'Failed to fetch compliance data',
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

    const userId = session.user.id;
    const body = await request.json();

    validatedData = complianceRecordSchema.parse(body);

    const complianceRecord = await db.complianceRecord.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirement: validatedData.requirement,
        dueDate: new Date(validatedData.dueDate),
        propertyId: validatedData.propertyId,
        userId: userId,
        status: 'PENDING'
      }
    })

    await createAuditLog({
        userId: session.user.id,
        action: 'create_compliance_record',
        resource: 'compliance_record',
        resourceId: complianceRecord.id,
        changes: { after: complianceRecord },
        result: 'success',
    });

    return NextResponse.json({ complianceRecord }, { status: 201 });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    await createAuditLog({
        userId: session?.user?.id || 'unknown',
        action: 'create_compliance_record',
        resource: 'compliance_record',
        resourceId: 'n/a',
        changes: { before: validatedData || {} },
        result: 'failure',
        errorDetails,
    });

    logger.error('Error creating compliance record:', { error, requestId, userId: session?.user?.id })

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
        error: 'Failed to create compliance record',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}