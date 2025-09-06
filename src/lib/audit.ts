import { db } from './db';
import { User } from '@prisma/client';

interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  metadata?: Record<string, any>;
  result: 'success' | 'failure';
  errorDetails?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes,
        metadata: data.metadata || {},
        result: data.result,
        errorDetails: data.errorDetails,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // In a real application, you might want to handle this error more gracefully
    // For example, by logging it to a separate error log or a monitoring service
  }
}