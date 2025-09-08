import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { UserRole, DocumentType } from '@prisma/client';

import { authOptions, requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/lib/audit';

// GET handler to list documents
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const tenancyId = searchParams.get('tenancyId');

    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (tenancyId) where.tenancyId = tenancyId;

    // TODO: Add RBAC to ensure user can only access documents for their properties/tenancies

    const documents = await db.document.findMany({ where });

    return NextResponse.json({ documents });

  } catch (error) {
    logger.error('[DOCUMENTS_API_GET]', { error, requestId, userId: session?.user?.id });
    // Handle errors
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Zod schema for creating a document record
const createDocumentSchema = z.object({
  originalName: z.string().min(1, "Original name cannot be empty."),
  filePath: z.string().min(1, "File path cannot be empty."),
  fileSize: z.number().positive("File size must be positive."),
  mimeType: z.string().min(1, "MIME type cannot be empty."),
  documentType: z.nativeEnum(DocumentType),
  propertyId: z.string().min(1, "Property ID cannot be empty."),
  tenancyId: z.string().optional(),
});

// POST handler to create a document record after upload
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const input = createDocumentSchema.parse(await req.json());

    // TODO: Add RBAC to ensure user can only create documents for their properties/tenancies

    const newDocument = await db.document.create({
      data: {
        ...input,
        filename: input.filePath, // Use the storage path as the filename for now
        uploadedBy: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'create_document',
      resource: 'document',
      resourceId: newDocument.id,
      changes: { after: newDocument },
      result: 'success',
    });

    return NextResponse.json({ document: newDocument }, { status: 201 });

  } catch (error) {
    logger.error('[DOCUMENTS_API_POST]', { error, requestId, userId: session?.user?.id });
    // Handle errors
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', code: ErrorCode.VALIDATION_FAILED, details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
