import { nextId } from '../../shared/id';
import { MaintenancePlan } from './maintenanceTypes';

const plans: MaintenancePlan[] = [];

export interface CreateMaintenancePlanInput {
  tenantId: string;
  vehicleId: string;
  name: string;
  intervalKm: number;
  intervalDays: number;
  lastServiceKm: number;
  lastServiceDate: string;
}

export const maintenanceRepository = {
  create(input: CreateMaintenancePlanInput): MaintenancePlan {
    const plan: MaintenancePlan = { id: nextId('plan'), ...input };
    plans.push(plan);
    return plan;
  },

  listByTenant(tenantId: string): MaintenancePlan[] {
    return plans.filter((plan) => plan.tenantId === tenantId);
  },

  findById(id: string): MaintenancePlan | undefined {
    return plans.find((plan) => plan.id === id);
  },

  save(plan: MaintenancePlan): MaintenancePlan {
    const index = plans.findIndex((item) => item.id === plan.id);
    if (index === -1) plans.push(plan);
    else plans[index] = plan;
    return plan;
  },

  reset(): void {
    plans.length = 0;
  }
};
