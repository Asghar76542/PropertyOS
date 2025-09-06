import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { DocumentType } from '@prisma/client'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'

const documentSchema = z.object({
    propertyId: z.string().min(1, "Property ID is required"),
    documentType: z.nativeEnum(DocumentType),
    description: z.string().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
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
    
    const userId = session.user.id;

    const documents = await db.document.findMany({
      where: { property: { landlordId: userId } },
      include: {
        property: true,
        uploader: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      documents,
    })
  } catch (error) {
    logger.error('Error fetching documents:', { error, requestId, userId: session?.user?.id })
    
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
        error: 'Failed to fetch documents',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      throw new AppError('No file provided', 400, ErrorCode.VALIDATION_FAILED);
    }

    // File validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
        throw new AppError('File type not supported', 400, ErrorCode.VALIDATION_FAILED);
    }

    if (file.size > maxSize) {
        throw new AppError('File size exceeds 10MB limit', 400, ErrorCode.VALIDATION_FAILED);
    }
    
    validatedData = documentSchema.parse({
        propertyId: data.get('propertyId'),
        documentType: data.get('documentType'),
        description: data.get('description'),
        expiresAt: data.get('expiresAt'),
    });

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    
    const fileExtension = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
    const path = join(uploadsDir, filename)
    await writeFile(path, buffer)

    const document = await db.document.create({
      data: {
        filename: filename,
        originalName: file.name,
        filePath: `/uploads/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
        documentType: validatedData.documentType,
        description: validatedData.description,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        propertyId: validatedData.propertyId,
        uploadedBy: userId,
      },
    })

    await createAuditLog({
        userId: session.user.id,
        action: 'create_document',
        resource: 'document',
        resourceId: document.id,
        changes: { after: document },
        result: 'success',
    });

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    await createAuditLog({
        userId: session?.user?.id || 'unknown',
        action: 'create_document',
        resource: 'document',
        resourceId: 'n/a',
        changes: { before: validatedData || {} },
        result: 'failure',
        errorDetails,
    });

    logger.error('Error creating document:', { error, requestId, userId: session?.user?.id })

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
        error: 'Failed to create document',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}