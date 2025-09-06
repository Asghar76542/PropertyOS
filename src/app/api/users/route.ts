import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema for user validation
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['LANDLORD', 'TENANT', 'CONTRACTOR', 'ADMIN']).default('LANDLORD'),
  subscriptionStatus: z.enum(['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING']).default('PENDING'),
  subscriptionEndsAt: z.string().optional().transform(val => val ? new Date(val) : null),
})

// GET all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const subscriptionStatus = searchParams.get('subscriptionStatus')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where: any = {}
    if (role) where.role = role
    if (subscriptionStatus) where.subscriptionStatus = subscriptionStatus

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            landlordTenancies: true,
            tenantTenancies: true,
            payments: true
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const total = await db.user.count({ where })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = userSchema.parse(body)
    
    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Create user
    const user = await db.user.create({
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}