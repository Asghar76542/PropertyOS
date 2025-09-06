import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(
  request: Request,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params

    // Verify the tenant exists
    const tenant = await db.user.findUnique({
      where: {
        id: tenantId,
        role: UserRole.TENANT
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Get messages for this tenant
    const messages = await db.message.findMany({
      where: {
        toId: tenantId
      },
      include: {
        from: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Count unread messages
    const unreadCount = await db.message.count({
      where: {
        toId: tenantId,
        read: false
      }
    })

    const formattedMessages = messages.map(message => ({
      id: message.id,
      from: `${message.from.name} (${message.from.role === 'LANDLORD' ? 'Landlord' : 'System'})`,
      subject: message.subject,
      message: message.body,
      date: message.createdAt.toISOString(),
      unread: !message.read
    }))

    return NextResponse.json({
      unreadMessages: unreadCount,
      recentMessages: formattedMessages
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params
    const { messageId } = await request.json()

    // Mark message as read
    const updatedMessage = await db.message.update({
      where: {
        id: messageId,
        toId: tenantId
      },
      data: {
        read: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
