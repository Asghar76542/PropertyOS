import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema for property validation
const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  deposit: z.number().positive('Deposit must be positive'),
  isAvailable: z.boolean().default(true),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET single property
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const property = await db.property.findUnique({
      where: { id: params.id },
      include: {
        landlord: {
          select: { id: true, name: true, email: true }
        },
        tenancies: {
          include: {
            tenant: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        documents: true,
        maintenanceRequests: {
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            },
            assignee: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        complianceRecords: {
          include: {
            document: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PUT update property
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const body = await request.json()
    
    // Validate input
    const validatedData = propertySchema.parse(body)
    
    // Update property
    const property = await db.property.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        landlord: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE property
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if property exists
    const existingProperty = await db.property.findUnique({
      where: { id: params.id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Delete property (cascade will handle related records)
    await db.property.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}