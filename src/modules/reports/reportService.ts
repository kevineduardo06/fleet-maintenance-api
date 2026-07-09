import { expenseRepository } from '../expenses/expenseRepository';
import { vehicleRepository } from '../vehicles/vehicleRepository';

export const reportService = {
  fleetCosts(tenantId: string) {
    const expenses = expenseRepository.list({ tenantId });
    const vehicles = vehicleRepository.list({ tenantId });
    const totalsByVehicle = vehicles.map((vehicle) => {
      const vehicleExpenses = expenses.filter((expense) => expense.vehicleId === vehicle.id);
      return {
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        totalCents: vehicleExpenses.reduce((sum, expense) => sum + expense.amountCents, 0),
        expenseCount: vehicleExpenses.length
      };
    });
    return {
      tenantId,
      totalCents: totalsByVehicle.reduce((sum, item) => sum + item.totalCents, 0),
      vehicles: totalsByVehicle
    };
  }
};
