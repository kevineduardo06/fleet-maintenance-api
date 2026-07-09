import { HttpError, assertFound } from '../../shared/errors';
import { addDays } from '../../shared/date';
import { vehicleRepository } from '../vehicles/vehicleRepository';
import { maintenanceRepository, CreateMaintenancePlanInput } from './maintenanceRepository';
import { DueMaintenance } from './maintenanceTypes';

const dateDiffInDays = (fromDate: string, toDate: string): number => {
  const from = new Date(`${fromDate}T00:00:00.000Z`).getTime();
  const to = new Date(`${toDate}T00:00:00.000Z`).getTime();
  return Math.floor((to - from) / 86400000);
};

export const maintenanceService = {
  createPlan(input: CreateMaintenancePlanInput) {
    const vehicle = assertFound(vehicleRepository.findById(input.vehicleId), 'Vehicle not found');
    if (vehicle.tenantId !== input.tenantId) throw new HttpError(403, 'Vehicle belongs to another tenant');
    if (input.intervalKm <= 0 || input.intervalDays <= 0) throw new HttpError(400, 'Intervals must be positive');
    if (input.lastServiceKm > vehicle.odometerKm) throw new HttpError(400, 'Last service km cannot exceed current odometer');
    return maintenanceRepository.create(input);
  },

  listDue(tenantId: string, asOfDate: string): DueMaintenance[] {
    return maintenanceRepository.listByTenant(tenantId).flatMap((plan) => {
      const vehicle = vehicleRepository.findById(plan.vehicleId);
      if (!vehicle || vehicle.tenantId !== tenantId || vehicle.status === 'retired') return [];
      const kmOverdueBy = vehicle.odometerKm - (plan.lastServiceKm + plan.intervalKm);
      const daysOverdueBy = dateDiffInDays(addDays(plan.lastServiceDate, plan.intervalDays), asOfDate);
      const dueByMileage = kmOverdueBy >= 0;
      const dueByDate = daysOverdueBy >= 0;
      if (!dueByMileage && !dueByDate) return [];
      const reason = dueByMileage && dueByDate ? 'both' : dueByMileage ? 'mileage' : 'date';
      return [{ planId: plan.id, vehicleId: plan.vehicleId, reason, kmOverdueBy: Math.max(0, kmOverdueBy), daysOverdueBy: Math.max(0, daysOverdueBy) }];
    });
  },

  markServiced(planId: string, input: { odometerKm: number; serviceDate: string }) {
    const plan = assertFound(maintenanceRepository.findById(planId), 'Maintenance plan not found');
    const vehicle = assertFound(vehicleRepository.findById(plan.vehicleId), 'Vehicle not found');
    if (input.odometerKm > vehicle.odometerKm) throw new HttpError(400, 'Service km cannot exceed current odometer');
    plan.lastServiceKm = input.odometerKm;
    plan.lastServiceDate = input.serviceDate;
    return maintenanceRepository.save(plan);
  }
};
