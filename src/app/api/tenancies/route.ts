import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema for tenancy validation
const tenancySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  landlordId: z.string().min(1, 'Landlord ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  deposit: z.number().positive('Deposit must be positive'),
  status: z.enum(['active', 'ended', 'pending']).default('active'),
})

// GET all tenancies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const landlordId = searchParams.get('landlordId')
    const tenantId = searchParams.get('tenantId')
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where: any = {}
    if (landlordId) where.landlordId = landlordId
    if (tenantId) where.tenantId = tenantId
    if (propertyId) where.propertyId = propertyId
    if (status) where.status = status

    const tenancies = await db.tenancy.findMany({
      where,
      include: {
        property: {
          select: { id: true, address: true, city: true, propertyType: true }
        },
        landlord: {
          select: { id: true, name: true, email: true }
        },
        tenant: {
          select: { id: true, name: true, email: true }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        documents: true,
        depositProtections: true
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const total = await db.tenancy.count({ where })

    return NextResponse.json({
      tenancies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tenancies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenancies' },
      { status: 500 }
    )
  }
}

// POST create new tenancy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = tenancySchema.parse(body)
    
    // Check if property is available
    const property = await db.property.findUnique({
      where: { id: validatedData.propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Create tenancy
    const tenancy = await db.tenancy.create({
      data: validatedData,
      include: {
        property: {
          select: { id: true, address: true, city: true, propertyType: true }
        },
        landlord: {
          select: { id: true, name: true, email: true }
        },
        tenant: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Update property availability
    await db.property.update({
      where: { id: validatedData.propertyId },
      data: { isAvailable: false }
    })

    return NextResponse.json(tenancy, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating tenancy:', error)
    return NextResponse.json(
      { error: 'Failed to create tenancy' },
      { status: 500 }
    )
  }
}