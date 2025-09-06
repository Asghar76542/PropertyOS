import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get all properties for the landlord (using the first landlord as example)
    const landlord = await db.user.findFirst({
      where: { role: 'LANDLORD' }
    })

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    // Get properties count
    const propertiesCount = await db.property.count({
      where: { landlordId: landlord.id }
    })

    // Get total monthly rent
    const properties = await db.property.findMany({
      where: { landlordId: landlord.id },
      select: { id: true, monthlyRent: true, isAvailable: true }
    })

    const totalMonthlyRent = properties.reduce((sum, property) => sum + property.monthlyRent, 0)
    
    // Calculate occupancy rate
    const occupiedProperties = properties.filter(p => !p.isAvailable).length
    const occupancyRate = propertiesCount > 0 ? (occupiedProperties / propertiesCount) * 100 : 0

    // Get total income (completed payments)
    const payments = await db.payment.findMany({
      where: { 
        landlordId: landlord.id,
        status: 'COMPLETED'
      },
      select: { amount: true, processingFee: true }
    })

    const totalIncome = payments.reduce((sum, payment) => sum + (payment.amount - payment.processingFee), 0)

    // Get property IDs for filtering (filter out undefined values)
    const propertyIds = properties.map(p => p.id).filter((id): id is string => id !== undefined)

    // Get recent maintenance requests only if we have properties
    const maintenanceRequests = propertyIds.length > 0 
      ? await db.maintenanceRequest.findMany({
          where: { propertyId: { in: propertyIds } },
          include: {
            property: {
              select: { address: true, city: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      : []

    // Get compliance status only if we have properties
    const complianceRecords = propertyIds.length > 0
      ? await db.complianceRecord.findMany({
          where: { propertyId: { in: propertyIds } },
          orderBy: { dueDate: 'asc' },
          take: 5
        })
      : []

    // Get recent payments
    const recentPayments = await db.payment.findMany({
      where: { landlordId: landlord.id },
      include: {
        property: {
          select: { address: true, city: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Calculate metrics
    const stats = {
      properties: {
        total: propertiesCount,
        occupied: occupiedProperties,
        vacant: propertiesCount - occupiedProperties,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      },
      finances: {
        totalMonthlyRent: Math.round(totalMonthlyRent * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        averageRent: propertiesCount > 0 ? Math.round((totalMonthlyRent / propertiesCount) * 100) / 100 : 0
      },
      maintenance: {
        open: maintenanceRequests.filter(r => r.status === 'OPEN').length,
        inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
        total: maintenanceRequests.length
      },
      compliance: {
        compliant: complianceRecords.filter(r => r.status === 'COMPLIANT').length,
        pending: complianceRecords.filter(r => r.status === 'PENDING').length,
        overdue: complianceRecords.filter(r => r.status === 'OVERDUE').length,
        total: complianceRecords.length
      }
    }

    return NextResponse.json({
      stats,
      recentData: {
        maintenanceRequests,
        complianceRecords,
        recentPayments
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}