import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { DocumentType } from '@prisma/client'

const documentSchema = z.object({
    propertyId: z.string().min(1, "Property ID is required"),
    documentType: z.nativeEnum(DocumentType),
    description: z.string().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
    tenancyId: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN' && session.user.role !== 'TENANT') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const userId = session.user.id;

    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type (only allow certain types)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    const validatedData = documentSchema.parse({
        propertyId: formData.get('propertyId'),
        documentType: formData.get('documentType'),
        description: formData.get('description'),
        expiresAt: formData.get('expiresAt'),
        tenancyId: formData.get('tenancyId'),
    });

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomId}.${fileExtension}`
    const filePath = join(uploadsDir, filename)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create document record in database
    const document = await db.document.create({
      data: {
        ...validatedData,
        filename,
        originalName: file.name,
        filePath: `/uploads/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: userId,
      },
      include: {
        property: {
          select: { id: true, address: true, city: true }
        },
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      document
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}