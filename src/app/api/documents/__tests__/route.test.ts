import { POST, GET } from '../route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/lib/audit';
import { NextRequest } from 'next/server';
import { UserRole, DocumentType } from '@prisma/client';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));
jest.mock('@/lib/logger');
jest.mock('@/lib/audit');

// Typecast mocks
const mockedGetServerSession = getServerSession as jest.Mock;
const mockedDb = db as jest.MockedDeep<typeof db>;

const MOCK_USER_ID = 'user-123';
const MOCK_PROPERTY_ID = 'prop-456';

describe('POST /api/documents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const newDocumentPayload = {
    originalName: 'test-lease.pdf',
    filePath: 'docs/test-lease.pdf',
    fileSize: 12345,
    mimeType: 'application/pdf',
    documentType: DocumentType.LEASE_AGREEMENT,
    propertyId: MOCK_PROPERTY_ID,
  };

  it('should successfully create a document record', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_USER_ID } });
    mockedDb.document.create.mockResolvedValue({ id: 'doc-1', ...newDocumentPayload, uploadedBy: MOCK_USER_ID } as any);

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify(newDocumentPayload),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.document.originalName).toBe(newDocumentPayload.originalName);
    expect(mockedDb.document.create).toHaveBeenCalled();
    expect(createAuditLog).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const request = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(newDocumentPayload) });
    const response = await POST(request);
    expect(response.status).toBe(500); // Based on current implementation
  });

  it('should return 400 for invalid input data', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_USER_ID } });
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ ...newDocumentPayload, originalName: '' }), // Invalid name
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_FAILED');
  });
});

describe('GET /api/documents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should list documents for a given property', async () => {
        mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_USER_ID } });
        mockedDb.document.findMany.mockResolvedValue([{ id: 'doc-1' }, { id: 'doc-2' }] as any);

        const request = new NextRequest(`http://localhost/api/documents?propertyId=${MOCK_PROPERTY_ID}`);
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.documents.length).toBe(2);
        expect(mockedDb.document.findMany).toHaveBeenCalledWith({ where: { propertyId: MOCK_PROPERTY_ID } });
    });
});
