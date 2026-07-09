import { HttpError, assertFound } from '../../shared/errors';
import { auditRepository } from '../audit/auditRepository';
import { vehicleRepository, CreateVehicleInput } from './vehicleRepository';
import { VehicleStatus, VehicleType } from './vehicleTypes';

export const vehicleService = {
  create(input: CreateVehicleInput) {
    if (input.odometerKm < 0) throw new HttpError(400, 'Odometer cannot be negative');
    const existing = vehicleRepository.findByPlate(input.tenantId, input.plate);
    if (existing) throw new HttpError(409, 'Vehicle plate already exists for this tenant');
    const vehicle = vehicleRepository.create(input);
    auditRepository.record({ tenantId: input.tenantId, entityType: 'vehicle', entityId: vehicle.id, action: 'vehicle.created' });
    return vehicle;
  },

  list(filters: { tenantId: string; status?: VehicleStatus; type?: VehicleType }) {
    return vehicleRepository.list(filters);
  },

  updateOdometer(id: string, odometerKm: number) {
    const vehicle = assertFound(vehicleRepository.findById(id), 'Vehicle not found');
    if (odometerKm < vehicle.odometerKm) {
      throw new HttpError(400, 'Odometer cannot move backwards');
    }
    vehicle.odometerKm = odometerKm;
    vehicleRepository.save(vehicle);
    auditRepository.record({
      tenantId: vehicle.tenantId,
      entityType: 'vehicle',
      entityId: vehicle.id,
      action: 'vehicle.odometer_updated',
      metadata: { odometerKm }
    });
    return vehicle;
  },

  setStatus(id: string, status: VehicleStatus) {
    const vehicle = assertFound(vehicleRepository.findById(id), 'Vehicle not found');
    vehicle.status = status;
    return vehicleRepository.save(vehicle);
  }
};
