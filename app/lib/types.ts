export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalDebt: number;
  lastTransactionDate: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  type: 'debt' | 'payment';
  amount: number;
  description: string;
  date: string; // ISO format
  dueDate?: string; // ISO date for debt due date
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}
