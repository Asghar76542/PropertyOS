import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: {
    message: {
      findMany: jest.fn(),
    },
  },
}));

// Typecast mocks
const mockedGetServerSession = getServerSession as jest.Mock;
const mockedDb = db as jest.MockedDeep<typeof db>;

const MOCK_USER_ID = 'user-123';
const MOCK_CONTACT_ID = 'contact-456';

describe('GET /api/messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch message history successfully', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_USER_ID } });
    mockedDb.message.findMany.mockResolvedValue([{ id: 'msg-1' }, { id: 'msg-2' }] as any);

    const request = new NextRequest(`http://localhost/api/messages?contactId=${MOCK_CONTACT_ID}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.messages.length).toBe(2);
    expect(mockedDb.message.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { fromId: MOCK_USER_ID, toId: MOCK_CONTACT_ID },
          { fromId: MOCK_CONTACT_ID, toId: MOCK_USER_ID },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { 
        from: { select: { name: true, email: true } },
        to: { select: { name: true, email: true } },
      },
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const request = new NextRequest(`http://localhost/api/messages?contactId=${MOCK_CONTACT_ID}`);
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 if contactId is missing', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_USER_ID } });
    const request = new NextRequest('http://localhost/api/messages');
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
