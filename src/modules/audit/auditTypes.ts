export interface AuditLog {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
