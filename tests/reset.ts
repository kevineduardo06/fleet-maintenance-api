import { auditRepository } from '../src/modules/audit/auditRepository';
import { expenseRepository } from '../src/modules/expenses/expenseRepository';
import { maintenanceRepository } from '../src/modules/maintenance/maintenanceRepository';
import { vehicleRepository } from '../src/modules/vehicles/vehicleRepository';
import { workOrderRepository } from '../src/modules/workOrders/workOrderRepository';
import { resetIds } from '../src/shared/id';

export const resetTestState = () => {
  vehicleRepository.reset();
  workOrderRepository.reset();
  maintenanceRepository.reset();
  expenseRepository.reset();
  auditRepository.reset();
  resetIds();
};
