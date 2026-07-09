import { nextId } from '../../shared/id';
import { ServiceCategory, WorkOrder, WorkOrderStatus } from './workOrderTypes';

const workOrders: WorkOrder[] = [];

export interface CreateWorkOrderInput {
  tenantId: string;
  vehicleId: string;
  category: ServiceCategory;
  notes?: string;
}

export const workOrderRepository = {
  create(input: CreateWorkOrderInput): WorkOrder {
    const workOrder: WorkOrder = {
      id: nextId('wo'),
      tenantId: input.tenantId,
      vehicleId: input.vehicleId,
      category: input.category,
      status: 'open',
      openedAt: new Date().toISOString(),
      notes: input.notes
    };
    workOrders.push(workOrder);
    return workOrder;
  },

  findById(id: string): WorkOrder | undefined {
    return workOrders.find((workOrder) => workOrder.id === id);
  },

  list(filters: { tenantId: string; vehicleId?: string; status?: WorkOrderStatus }): WorkOrder[] {
    return workOrders.filter((workOrder) => {
      if (workOrder.tenantId !== filters.tenantId) return false;
      if (filters.vehicleId && workOrder.vehicleId !== filters.vehicleId) return false;
      if (filters.status && workOrder.status !== filters.status) return false;
      return true;
    });
  },

  hasOpenWork(vehicleId: string): boolean {
    return workOrders.some(
      (workOrder) =>
        workOrder.vehicleId === vehicleId &&
        (workOrder.status === 'open' || workOrder.status === 'in_progress')
    );
  },

  save(workOrder: WorkOrder): WorkOrder {
    const index = workOrders.findIndex((item) => item.id === workOrder.id);
    if (index === -1) workOrders.push(workOrder);
    else workOrders[index] = workOrder;
    return workOrder;
  },

  reset(): void {
    workOrders.length = 0;
  }
};
