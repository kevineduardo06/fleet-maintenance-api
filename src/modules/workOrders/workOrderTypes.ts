export type WorkOrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceCategory = 'preventive' | 'corrective' | 'inspection' | 'tires';

export interface WorkOrder {
  id: string;
  tenantId: string;
  vehicleId: string;
  category: ServiceCategory;
  status: WorkOrderStatus;
  openedAt: string;
  completedAt?: string;
  notes?: string;
}
