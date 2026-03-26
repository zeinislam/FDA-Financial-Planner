export type AllocationSection = {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  phoneNumber?: string;
};

export type ExpenseItem = {
  id: string;
  sectionId: string;
  description: string;
  amount: number;
  date: string;
  image?: string;
};

export type FinancialState = {
  capital: number;
  sections: AllocationSection[];
  expenses: ExpenseItem[];
};
