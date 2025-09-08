import { GET } from '../dashboard/route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';

// Mock dependencies
jest.mock('next-auth');

// Manual mock for the Prisma client to ensure deep object structure
jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: {
    user: {
      findUnique: jest.fn(),
    },
    tenancy: {
      findFirst: jest.fn(),
    },
    maintenanceRequest: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Typecast mocks for easier usage
const mockedGetServerSession = getServerSession as jest.Mock;
const mockedDb = db as jest.Mocked<typeof db>;

const MOCK_TENANT_ID = 'user-tenant-123';
const MOCK_LANDLORD_ID = 'user-landlord-456';
const MOCK_PROPERTY_ID = 'prop-123';
const MOCK_TENANCY_ID = 'tenancy-123';

describe('GET /api/tenant/dashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return the correct dashboard data shape for a valid tenant', async () => {
    // 1. Setup Mock Data and Session
    mockedGetServerSession.mockResolvedValue({
      user: {
        id: MOCK_TENANT_ID,
        role: UserRole.TENANT,
      },
    });

    (mockedDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: MOCK_TENANT_ID,
      name: 'Test Tenant',
      email: 'tenant@test.com',
      role: UserRole.TENANT,
    } as any);

    (mockedDb.tenancy.findFirst as jest.Mock).mockResolvedValue({
      id: MOCK_TENANCY_ID,
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2025-01-01T00:00:00.000Z'),
      monthlyRent: 1200,
      deposit: 1500,
      propertyId: MOCK_PROPERTY_ID,
      property: {
        id: MOCK_PROPERTY_ID,
        address: '123 Fake St',
        city: 'Testville',
        landlord: {
          name: 'Test Landlord',
          email: 'landlord@test.com',
        },
      },
      payments: [
        {
          id: 'payment-1',
          amount: 1200,
          status: 'COMPLETED',
          dueDate: new Date('2024-08-01T00:00:00.000Z'),
          paymentDate: new Date('2024-08-01T00:00:00.000Z'),
          method: 'bank_transfer',
        },
        {
          id: 'payment-2',
          amount: 1200,
          status: 'PENDING',
          dueDate: new Date('2024-09-01T00:00:00.000Z'),
          paymentDate: null,
          method: null,
        },
      ],
      documents: [
        {
            id: 'doc-1',
            documentType: 'LEASE_AGREEMENT',
            originalName: 'lease.pdf',
            fileSize: 204800,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        }
      ],
    } as any);

    (mockedDb.maintenanceRequest.findMany as jest.Mock).mockResolvedValue([
        {
            id: 'req-1',
            title: 'Leaky Faucet',
            status: 'OPEN',
            priority: 'MEDIUM',
            createdAt: new Date('2024-08-15T00:00:00.000Z'),
            dueDate: null,
        }
    ]);

    // 2. Call the API Route Handler
    const request = new NextRequest('http://localhost/api/tenant/dashboard');
    const response = await GET(request);
    const data = await response.json();

    // 3. Assertions
    expect(response.status).toBe(200);
    // Snapshot test to ensure the data structure remains consistent
    expect(data).toMatchSnapshot();
    // Check that no errors were logged
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should return a 401 Unauthorized error if there is no session', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/tenant/dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe('UNAUTHORIZED');
    expect(logger.error).toHaveBeenCalled();
  });

    it('should return a 403 Insufficient Permissions error for a non-tenant user', async () => {
    mockedGetServerSession.mockResolvedValue({
        user: {
            id: MOCK_LANDLORD_ID,
            role: UserRole.LANDLORD,
        },
    });

    const request = new NextRequest('http://localhost/api/tenant/dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
    expect(logger.error).toHaveBeenCalled();
  });
});