import { AllocationSection, ExpenseItem } from '../types';

export function computeAmountFromPercent(capital: number, percentage: number): number {
  return Number(((capital * percentage) / 100).toFixed(2));
}

export function totalAllocatedAmount(sections: AllocationSection[]): number {
  return sections.reduce((acc, s) => acc + s.amount, 0);
}

export function totalExpenses(expenses: ExpenseItem[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

export function remainingCapital(capital: number, expenses: ExpenseItem[]): number {
  return Number((capital - totalExpenses(expenses)).toFixed(2));
}

export function usedAmountForSection(sectionId: string, expenses: ExpenseItem[]): number {
  return expenses.filter(e => e.sectionId === sectionId).reduce((acc, e) => acc + e.amount, 0);
}

export function remainingForSection(section: AllocationSection, expenses: ExpenseItem[]): number {
  const used = usedAmountForSection(section.id, expenses);
  return Number((section.amount - used).toFixed(2));
}
