import { HttpError, assertFound } from '../../shared/errors';
import { auditRepository } from '../audit/auditRepository';
import { expenseRepository } from '../expenses/expenseRepository';
import { vehicleRepository } from '../vehicles/vehicleRepository';
import { workOrderRepository, CreateWorkOrderInput } from './workOrderRepository';
import { WorkOrderStatus } from './workOrderTypes';

const allowedTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

export const workOrderService = {
  create(input: CreateWorkOrderInput) {
    const vehicle = assertFound(vehicleRepository.findById(input.vehicleId), 'Vehicle not found');
    if (vehicle.tenantId !== input.tenantId) throw new HttpError(403, 'Vehicle belongs to another tenant');
    if (vehicle.status === 'retired') throw new HttpError(400, 'Retired vehicles cannot receive work orders');
    if (workOrderRepository.hasOpenWork(vehicle.id)) {
      throw new HttpError(409, 'Vehicle already has an open work order');
    }

    const workOrder = workOrderRepository.create(input);
    vehicle.status = 'in_maintenance';
    vehicleRepository.save(vehicle);
    auditRepository.record({ tenantId: input.tenantId, entityType: 'work_order', entityId: workOrder.id, action: 'work_order.created' });
    return workOrder;
  },

  list(filters: { tenantId: string; vehicleId?: string; status?: WorkOrderStatus }) {
    return workOrderRepository.list(filters);
  },

  updateStatus(id: string, status: WorkOrderStatus) {
    const workOrder = assertFound(workOrderRepository.findById(id), 'Work order not found');
    if (!allowedTransitions[workOrder.status].includes(status)) {
      throw new HttpError(400, `Cannot move work order from ${workOrder.status} to ${status}`);
    }

    workOrder.status = status;
    if (status === 'completed') workOrder.completedAt = new Date().toISOString();
    workOrderRepository.save(workOrder);

    const vehicle = assertFound(vehicleRepository.findById(workOrder.vehicleId), 'Vehicle not found');
    if (status === 'completed' || status === 'cancelled') {
      vehicle.status = 'active';
      vehicleRepository.save(vehicle);
    }

    auditRepository.record({
      tenantId: workOrder.tenantId,
      entityType: 'work_order',
      entityId: workOrder.id,
      action: 'work_order.status_changed',
      metadata: { status }
    });
    return workOrder;
  },

  addExpense(id: string, input: { amountCents: number; description: string }) {
    const workOrder = assertFound(workOrderRepository.findById(id), 'Work order not found');
    if (workOrder.status === 'cancelled') throw new HttpError(400, 'Cannot add expenses to cancelled work orders');
    if (input.amountCents <= 0) throw new HttpError(400, 'Expense amount must be positive');
    const expense = expenseRepository.create({
      tenantId: workOrder.tenantId,
      workOrderId: workOrder.id,
      vehicleId: workOrder.vehicleId,
      amountCents: input.amountCents,
      description: input.description
    });
    auditRepository.record({
      tenantId: workOrder.tenantId,
      entityType: 'expense',
      entityId: expense.id,
      action: 'expense.created',
      metadata: { workOrderId: workOrder.id, amountCents: input.amountCents }
    });
    return expense;
  }
};
