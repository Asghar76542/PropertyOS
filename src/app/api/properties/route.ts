import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get landlord (using first landlord as example)
    const landlord = await db.user.findFirst({
      where: { role: 'LANDLORD' }
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    // Get properties with related data
    const properties = await db.property.findMany({
      where: { landlordId: landlord.id },
      include: {
        tenancies: {
          include: {
            tenant: {
              select: { name: true, email: true }
            }
          }
        },
        maintenanceRequests: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        complianceRecords: {
          take: 3,
          orderBy: { dueDate: 'asc' }
        },
        payments: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Get landlord (using first landlord as example)
    const landlord = await db.user.findFirst({
      where: { role: 'LANDLORD' }
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    const property = await db.property.create({
      data: {
        ...body,
        landlordId: landlord.id
      }
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}