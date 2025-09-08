import { PATCH, POST } from '../route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/lib/audit';
import { NextRequest } from 'next/server';
import { UserRole, MaintenanceStatus } from '@prisma/client';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: {
    maintenanceRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
  },
}));
jest.mock('@/lib/logger');
jest.mock('@/lib/audit');

// Typecast mocks
const mockedGetServerSession = getServerSession as jest.Mock;
const mockedDb = db as jest.MockedDeep<typeof db>;

const MOCK_LANDLORD_ID = 'user-landlord-123';
const MOCK_TENANT_ID = 'user-tenant-456';
const MOCK_REQUEST_ID = 'req-abc-789';
const MOCK_PROPERTY_ID = 'prop-def-456';

describe('PATCH /api/maintenance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a maintenance request', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_LANDLORD_ID, role: UserRole.LANDLORD } });

    const mockRequest = { id: MOCK_REQUEST_ID, reportedBy: MOCK_TENANT_ID, propertyId: MOCK_PROPERTY_ID };
    mockedDb.maintenanceRequest.findUnique.mockResolvedValue(mockRequest as any);
    mockedDb.maintenanceRequest.update.mockResolvedValue({ ...mockRequest, status: MaintenanceStatus.IN_PROGRESS } as any);

    const request = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ id: MOCK_REQUEST_ID, status: MaintenanceStatus.IN_PROGRESS }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.maintenanceRequest.status).toBe(MaintenanceStatus.IN_PROGRESS);
    expect(mockedDb.maintenanceRequest.update).toHaveBeenCalledWith({
      where: { id: MOCK_REQUEST_ID },
      data: { status: MaintenanceStatus.IN_PROGRESS, assignedTo: undefined, actualCost: undefined, dueDate: undefined, priority: undefined },
    });
    expect(createAuditLog).toHaveBeenCalled();
  });

  it('should create an expense when a request is completed with a cost', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_LANDLORD_ID, role: UserRole.LANDLORD } });

    const mockRequest = { id: MOCK_REQUEST_ID, reportedBy: MOCK_TENANT_ID, propertyId: MOCK_PROPERTY_ID, title: 'Fix window' };
    const updatedMockRequest = { ...mockRequest, status: MaintenanceStatus.COMPLETED, actualCost: 150 };
    
    mockedDb.maintenanceRequest.findUnique.mockResolvedValue(mockRequest as any);
    mockedDb.maintenanceRequest.update.mockResolvedValue(updatedMockRequest as any);
    mockedDb.property.findUnique.mockResolvedValue({ id: MOCK_PROPERTY_ID, landlordId: MOCK_LANDLORD_ID } as any);
    mockedDb.payment.create.mockResolvedValue({} as any);

    const request = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ id: MOCK_REQUEST_ID, status: MaintenanceStatus.COMPLETED, actualCost: 150 }),
    });

    await PATCH(request);

    expect(mockedDb.payment.create).toHaveBeenCalledWith({
      data: {
        amount: 150,
        status: 'COMPLETED',
        type: 'EXPENSE',
        description: `Expense for maintenance: ${mockRequest.title}`,
        maintenanceId: MOCK_REQUEST_ID,
        propertyId: MOCK_PROPERTY_ID,
        landlordId: MOCK_LANDLORD_ID,
        dueDate: expect.any(Date),
        paymentDate: expect.any(Date),
      },
    });
  });

  it('should return 403 if a tenant tries to update another tenant\'s request', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'some-other-tenant', role: UserRole.TENANT } });
    mockedDb.maintenanceRequest.findUnique.mockResolvedValue({ id: MOCK_REQUEST_ID, reportedBy: MOCK_TENANT_ID } as any);

    const request = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ id: MOCK_REQUEST_ID, status: MaintenanceStatus.IN_PROGRESS }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('should return 404 if the maintenance request is not found', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_LANDLORD_ID, role: UserRole.LANDLORD } });
    mockedDb.maintenanceRequest.findUnique.mockResolvedValue(null);

    const request = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ id: MOCK_REQUEST_ID, status: MaintenanceStatus.IN_PROGRESS }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid input data', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_LANDLORD_ID, role: UserRole.LANDLORD } });

    const request = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ id: MOCK_REQUEST_ID, status: 'INVALID_STATUS' }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_FAILED');
  });
});

describe('POST /api/maintenance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const newRequestPayload = {
    title: 'Broken heater',
    description: 'The heater in the main living room is not working at all.',
    propertyId: MOCK_PROPERTY_ID,
    priority: 'HIGH' as const,
  };

  it('should successfully create a maintenance request for a tenant', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_TENANT_ID, role: UserRole.TENANT } });

    mockedDb.property.findUnique.mockResolvedValue({
      id: MOCK_PROPERTY_ID,
      landlordId: MOCK_LANDLORD_ID,
      tenancies: [{ tenantId: MOCK_TENANT_ID }],
    } as any);

    mockedDb.maintenanceRequest.create.mockResolvedValue({
      id: 'new-req-123',
      ...newRequestPayload,
      status: 'OPEN',
      reportedById: MOCK_TENANT_ID,
    } as any);

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify(newRequestPayload),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.maintenanceRequest.title).toBe(newRequestPayload.title);
    expect(mockedDb.maintenanceRequest.create).toHaveBeenCalledWith({
      data: {
        ...newRequestPayload,
        status: 'OPEN',
        reportedById: MOCK_TENANT_ID,
      },
    });
    expect(createAuditLog).toHaveBeenCalled();
  });

  it('should return 403 if a tenant tries to create a request for a property they do not rent', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_TENANT_ID, role: UserRole.TENANT } });

    // The property exists, but the tenancy link for this tenant is missing
    mockedDb.property.findUnique.mockResolvedValue({
      id: MOCK_PROPERTY_ID,
      landlordId: MOCK_LANDLORD_ID,
      tenancies: [],
    } as any);

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify(newRequestPayload),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('should return 400 for invalid input data', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: MOCK_TENANT_ID, role: UserRole.TENANT } });

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ ...newRequestPayload, title: '' }), // Invalid title
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_FAILED');
  });
});
