import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// A temporary solution to get the user ID. In a real application, this would
// come from an authentication session.
async function getUserId(request: NextRequest): Promise<string | null> {
  const userId = request.headers.get('x-user-id')
  if (userId) return userId

  // Fallback to the first landlord if no header is present
  const landlord = await db.user.findFirst({
    where: { role: 'LANDLORD' },
  })
  return landlord?.id || null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = await request.formData()
    const file: File | null = (data as any).get('file') as File
    const propertyId = (data as any).get('propertyId') as string
    const documentType = (data as any).get('documentType') as string
    const description = (data as any).get('description') as string
    const expiresAt = (data as any).get('expiresAt') as string

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' })
    }
    
    if (!propertyId) {
        return NextResponse.json({ success: false, error: 'No property selected.' });
    }

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
        documentType: documentType as any,
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        propertyId: propertyId,
        uploadedBy: userId,
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}