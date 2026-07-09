export type VehicleStatus = 'active' | 'in_maintenance' | 'retired';
export type VehicleType = 'van' | 'truck' | 'car' | 'motorcycle';

export interface Vehicle {
  id: string;
  tenantId: string;
  plate: string;
  type: VehicleType;
  status: VehicleStatus;
  odometerKm: number;
  createdAt: string;
}
