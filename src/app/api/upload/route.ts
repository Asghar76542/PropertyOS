import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = (formData as any).get('file') as File
    const propertyId = (formData as any).get('propertyId') as string
    const documentType = (formData as any).get('documentType') as string
    const description = (formData as any).get('description') as string
    const expiresAt = (formData as any).get('expiresAt') as string
    const tenancyId = (formData as any).get('tenancyId') as string
    const uploadedBy = (formData as any).get('uploadedBy') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await writeFile(uploadsDir, '')
    } catch (error) {
      // Directory likely already exists
    }

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
        filename,
        originalName: file.name,
        filePath: `/uploads/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
        documentType: documentType as any,
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        propertyId,
        uploadedBy: uploadedBy || 'temp-user-id',
        tenancyId: tenancyId || null
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
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}