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

    const complianceRecords = await db.complianceRecord.findMany({
        where: { property: { landlordId: landlord.id } },
        include: {
            property: true,
            document: true,
        }
    });

    const complianceStatus = {
        overall: complianceRecords.filter(r => r.status === 'COMPLIANT').length / complianceRecords.length * 100,
        gasSafety: complianceRecords.filter(r => r.title.includes('Gas Safety') && r.status === 'COMPLIANT').length / complianceRecords.filter(r => r.title.includes('Gas Safety')).length * 100,
        epc: complianceRecords.filter(r => r.title.includes('EPC') && r.status === 'COMPLIANT').length / complianceRecords.filter(r => r.title.includes('EPC')).length * 100,
        electrical: complianceRecords.filter(r => r.title.includes('Electrical') && r.status === 'COMPLIANT').length / complianceRecords.filter(r => r.title.includes('Electrical')).length * 100,
        fireSafety: complianceRecords.filter(r => r.title.includes('Fire Safety') && r.status === 'COMPLIANT').length / complianceRecords.filter(r => r.title.includes('Fire Safety')).length * 100,
        hmoLicense: complianceRecords.filter(r => r.title.includes('HMO') && r.status === 'COMPLIANT').length / complianceRecords.filter(r => r.title.includes('HMO')).length * 100
    };

    return NextResponse.json({ 
        complianceRecords,
        complianceStatus
    });

  } catch (error) {
    console.error('Error fetching compliance data:', error)
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

    const { title, description, requirement, dueDate, propertyId } = body

    if (!title || !description || !requirement || !dueDate || !propertyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const complianceRecord = await db.complianceRecord.create({
      data: {
        title,
        description,
        requirement,
        dueDate: new Date(dueDate),
        propertyId,
        userId: landlord.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ complianceRecord }, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}