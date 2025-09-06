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

    const maintenanceRequests = await db.maintenanceRequest.findMany({
        where: { property: { landlordId: landlord.id } },
        include: {
            property: true,
            reporter: true,
            assignee: true,
        }
    });

    const contractors = await db.user.findMany({
        where: { role: 'CONTRACTOR' }
    });

    return NextResponse.json({ 
        maintenanceRequests,
        contractors
    });

  } catch (error) {
    console.error('Error fetching maintenance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const landlord = await db.user.findFirst({
      where: { role: 'LANDLORD' }
    });

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 });
    }

    const body = await request.json();

    const maintenanceRequest = await db.maintenanceRequest.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        propertyId: body.propertyId,
        reportedBy: landlord.id, // This should be the logged in user
        assignedTo: body.assignedTo,
      },
    });

    return NextResponse.json({ maintenanceRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}