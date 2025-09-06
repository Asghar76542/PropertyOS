import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema for payment validation
const paymentSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  landlordId: z.string().min(1, 'Landlord ID is required'),
  tenancyId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  processingFee: z.number().min(0, 'Processing fee must be non-negative').default(0),
  dueDate: z.string().transform(val => new Date(val)),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).default('PENDING'),
})

// GET all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const landlordId = searchParams.get('landlordId')
    const propertyId = searchParams.get('propertyId')
    const tenancyId = searchParams.get('tenancyId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where: any = {}
    if (landlordId) where.landlordId = landlordId
    if (propertyId) where.propertyId = propertyId
    if (tenancyId) where.tenancyId = tenancyId
    if (status) where.status = status

    const payments = await db.payment.findMany({
      where,
      include: {
        property: {
          select: { id: true, address: true, city: true }
        },
        landlord: {
          select: { id: true, name: true, email: true }
        },
        tenancy: {
          include: {
            tenant: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const total = await db.payment.count({ where })

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = paymentSchema.parse(body)
    
    // Calculate 5% processing fee if not provided
    if (validatedData.processingFee === 0) {
      validatedData.processingFee = validatedData.amount * 0.05
    }
    
    // Create payment
    const payment = await db.payment.create({
      data: validatedData,
      include: {
        property: {
          select: { id: true, address: true, city: true }
        },
        landlord: {
          select: { id: true, name: true, email: true }
        },
        tenancy: {
          include: {
            tenant: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}