export interface MaintenancePlan {
  id: string;
  tenantId: string;
  vehicleId: string;
  name: string;
  intervalKm: number;
  intervalDays: number;
  lastServiceKm: number;
  lastServiceDate: string;
}

export interface DueMaintenance {
  planId: string;
  vehicleId: string;
  reason: 'mileage' | 'date' | 'both';
  kmOverdueBy: number;
  daysOverdueBy: number;
}
