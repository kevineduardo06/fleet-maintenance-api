export interface Expense {
  id: string;
  tenantId: string;
  workOrderId: string;
  vehicleId: string;
  amountCents: number;
  description: string;
  createdAt: string;
}
