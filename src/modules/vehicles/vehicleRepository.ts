import { nextId } from '../../shared/id';
import { Vehicle, VehicleStatus, VehicleType } from './vehicleTypes';

const vehicles: Vehicle[] = [];

export interface CreateVehicleInput {
  tenantId: string;
  plate: string;
  type: VehicleType;
  odometerKm: number;
}

export const vehicleRepository = {
  create(input: CreateVehicleInput): Vehicle {
    const vehicle: Vehicle = {
      id: nextId('veh'),
      tenantId: input.tenantId,
      plate: input.plate,
      type: input.type,
      status: 'active',
      odometerKm: input.odometerKm,
      createdAt: new Date().toISOString()
    };
    vehicles.push(vehicle);
    return vehicle;
  },

  findById(id: string): Vehicle | undefined {
    return vehicles.find((vehicle) => vehicle.id === id);
  },

  findByPlate(tenantId: string, plate: string): Vehicle | undefined {
    return vehicles.find((vehicle) => vehicle.tenantId === tenantId && vehicle.plate === plate);
  },

  list(filters: { tenantId: string; status?: VehicleStatus; type?: VehicleType }): Vehicle[] {
    return vehicles.filter((vehicle) => {
      if (vehicle.tenantId !== filters.tenantId) return false;
      if (filters.status && vehicle.status !== filters.status) return false;
      if (filters.type && vehicle.type !== filters.type) return false;
      return true;
    });
  },

  save(vehicle: Vehicle): Vehicle {
    const index = vehicles.findIndex((item) => item.id === vehicle.id);
    if (index === -1) vehicles.push(vehicle);
    else vehicles[index] = vehicle;
    return vehicle;
  },

  reset(): void {
    vehicles.length = 0;
  }
};
