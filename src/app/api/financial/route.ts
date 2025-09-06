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

    const properties = await db.property.findMany({
      where: { landlordId: landlord.id },
      include: {
        tenancies: {
          include: {
            tenant: true,
            payments: true,
          }
        }
      }
    });

    const payments = await db.payment.findMany({
      where: { landlordId: landlord.id },
      include: {
        property: true,
        tenancy: {
          include: {
            tenant: true,
          }
        }
      }
    });

    const maintenanceRequests = await db.maintenanceRequest.findMany({
        where: { property: { landlordId: landlord.id } },
        include: {
          property: true,
        }
    });

    const financialSummary = {
        totalProperties: properties.length,
        occupiedProperties: properties.filter(p => !p.isAvailable).length,
        monthlyRent: properties.reduce((sum, p) => sum + p.monthlyRent, 0),
        collectedRent: payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0),
        pendingRent: payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
        overdueRent: payments.filter(p => p.status === 'PENDING' && new Date(p.dueDate) < new Date()).reduce((sum, p) => sum + p.amount, 0),
        totalExpenses: maintenanceRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0),
        netIncome: payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0) - maintenanceRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0),
        occupancyRate: (properties.filter(p => !p.isAvailable).length / properties.length) * 100,
        collectionRate: (payments.filter(p => p.status === 'COMPLETED').length / payments.length) * 100,
        yearToDateRevenue: payments.filter(p => p.status === 'COMPLETED' && new Date(p.paymentDate!).getFullYear() === new Date().getFullYear()).reduce((sum, p) => sum + p.amount, 0),
        averageRent: properties.reduce((sum, p) => sum + p.monthlyRent, 0) / properties.length
    };

    return NextResponse.json({ 
        properties,
        rentPayments: payments,
        expenses: maintenanceRequests,
        financialSummary 
    });

  } catch (error) {
    console.error('Error fetching financial data:', error)
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

    // Check if it is a payment or an expense
    if (body.type === 'payment') {
      const payment = await db.payment.create({
        data: {
          amount: body.amount,
          status: body.status,
          dueDate: body.dueDate,
          propertyId: body.propertyId,
          landlordId: landlord.id,
          tenancyId: body.tenancyId || null,
        },
      });
      return NextResponse.json({ payment }, { status: 201 });
    } else if (body.type === 'expense') {
        const expense = await db.maintenanceRequest.create({
            data: {
                title: body.title,
                description: body.description,
                status: 'COMPLETED',
                priority: 'medium',
                actualCost: body.amount,
                propertyId: body.propertyId,
                reportedBy: landlord.id,
            }
        });
        return NextResponse.json({ expense }, { status: 201 });
    } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating financial record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}