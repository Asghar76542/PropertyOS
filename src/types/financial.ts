export interface Property {
  id: string;
  address: string;
  monthlyRent: number;
  isAvailable: boolean;
  tenancies: Tenancy[];
}

export interface Tenancy {
  id: string;
  tenant: {
    name: string;
  };
  payments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paymentDate: string | null;
  property: {
    address: string;
  };
  tenancy: {
    tenant: {
      name: string;
    };
  };
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  actualCost: number | null;
  property: {
    address: string;
  };
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  monthlyRent: number;
  collectedRent: number;
  collectionRate: number;
  netIncome: number;
  totalExpenses: number;
  occupancyRate: number;
  occupiedProperties: number;
  totalProperties: number;
  overdueRent: number;
}