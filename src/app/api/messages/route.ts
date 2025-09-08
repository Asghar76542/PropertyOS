import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { AppError, ErrorCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('contactId');

  if (!contactId) {
    return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const messages = await db.message.findMany({
      where: {
        OR: [
          { fromId: userId, toId: contactId },
          { fromId: contactId, toId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        from: { select: { name: true, email: true } },
        to: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ messages });

  } catch (error) {
    logger.error('[MESSAGES_API_GET]', { error, userId });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
