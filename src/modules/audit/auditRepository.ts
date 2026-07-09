import { nextId } from '../../shared/id';
import { AuditLog } from './auditTypes';

const logs: AuditLog[] = [];

export const auditRepository = {
  record(input: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const log: AuditLog = {
      id: nextId('audit'),
      ...input,
      createdAt: new Date().toISOString()
    };
    logs.push(log);
    return log;
  },

  list(tenantId: string): AuditLog[] {
    return logs.filter((log) => log.tenantId === tenantId);
  },

  reset(): void {
    logs.length = 0;
  }
};
