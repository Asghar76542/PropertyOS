import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { AppError, ErrorCode, generateRequestId } from '@/lib/errors'

export async function GET(request: Request) {
  const requestId = generateRequestId();
  let session;
  try {
    session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    // Verify user has proper role
    if (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const landlordId = session.user.id;

    const [properties, payments, maintenanceRequests, complianceRecords] = await db.$transaction([
      db.property.findMany({
        where: { landlordId: landlordId },
        select: { id: true, monthlyRent: true, isAvailable: true }
      }),
      db.payment.findMany({
        where: { landlordId: landlordId },
        select: { amount: true, processingFee: true, status: true, paymentDate: true }
      }),
      db.maintenanceRequest.findMany({
        where: { property: { landlordId: landlordId } },
        select: { status: true }
      }),
      db.complianceRecord.findMany({
        where: { property: { landlordId: landlordId } },
        select: { status: true }
      })
    ]);

    const propertiesCount = properties.length;
    const totalMonthlyRent = properties.reduce((sum, property) => sum + property.monthlyRent, 0);
    const occupiedProperties = properties.filter(p => !p.isAvailable).length;
    const occupancyRate = propertiesCount > 0 ? (occupiedProperties / propertiesCount) * 100 : 0;
    const totalIncome = payments.filter(p => p.status === 'COMPLETED').reduce((sum, payment) => sum + (payment.amount - payment.processingFee), 0);

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
    };

    const propertyIds = properties.map(p => p.id);

    const [recentMaintenanceRequests, recentComplianceRecords, recentPayments] = await db.$transaction([
        db.maintenanceRequest.findMany({
            where: { propertyId: { in: propertyIds } },
            include: {
                property: {
                    select: { address: true, city: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        db.complianceRecord.findMany({
            where: { propertyId: { in: propertyIds } },
            orderBy: { dueDate: 'asc' },
            take: 5
        }),
        db.payment.findMany({
            where: { landlordId: landlordId },
            include: {
                property: {
                    select: { address: true, city: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);


    return NextResponse.json({
      stats,
      recentData: {
        maintenanceRequests: recentMaintenanceRequests,
        complianceRecords: recentComplianceRecords,
        recentPayments: recentPayments
      }
    })
  } catch (error) {
    logger.error('Error fetching dashboard stats:', { error, requestId, userId: session?.user?.id })
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details 
        }, 
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: requestId
      }, 
      { status: 500 }
    )
  }
}