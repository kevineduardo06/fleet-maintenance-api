import { nextId } from '../../shared/id';
import { Expense } from './expenseTypes';

const expenses: Expense[] = [];

export interface CreateExpenseInput {
  tenantId: string;
  workOrderId: string;
  vehicleId: string;
  amountCents: number;
  description: string;
}

export const expenseRepository = {
  create(input: CreateExpenseInput): Expense {
    const expense: Expense = {
      id: nextId('exp'),
      ...input,
      createdAt: new Date().toISOString()
    };
    expenses.push(expense);
    return expense;
  },

  list(filters: { tenantId: string; vehicleId?: string }): Expense[] {
    return expenses.filter((expense) => {
      if (expense.tenantId !== filters.tenantId) return false;
      if (filters.vehicleId && expense.vehicleId !== filters.vehicleId) return false;
      return true;
    });
  },

  reset(): void {
    expenses.length = 0;
  }
};
