'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Transaction } from '@/app/lib/types';

type ArchivedCustomerRecord = {
  customer: Customer;
  transactions: Transaction[];
};

interface StoreContextType {
  customers: Customer[];
  archivedCustomers: ArchivedCustomerRecord[];
  transactions: Transaction[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalDebt' | 'lastTransactionDate'>) => void;
  updateCustomer: (
    customerId: string,
    updates: Pick<Customer, 'name' | 'phone' | 'email' | 'address'>,
  ) => void;
  archiveCustomer: (customerId: string) => void;
  restoreCustomer: (customerId: string) => void;
  deleteCustomer: (customerId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  getCustomerTransactions: (customerId: string) => Transaction[];
  getCustomerById: (customerId: string) => Customer | undefined;
  getTotalDebt: () => number;
  getCustomersWithDebt: () => Customer[];
  getThisWeekNetChange: () => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SAMPLE_DATA = {
  customers: [
    {
      id: '1',
      name: 'Maria Santos',
      phone: '09171234567',
      email: 'maria.santos@example.com',
      address: '123 Bahay Street, Barangay 1',
      totalDebt: 1500,
      lastTransactionDate: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Juan Dela Cruz',
      phone: '09281234567',
      email: 'juan.delacruz@example.com',
      address: '456 Lungsod Avenue, Barangay 2',
      totalDebt: 2500,
      lastTransactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Rosa Garcia',
      phone: '09351234567',
      email: 'rosa.garcia@example.com',
      address: '789 Siyudad Road, Barangay 3',
      totalDebt: 800,
      lastTransactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      name: 'Pedro Reyes',
      phone: '09451234567',
      email: 'pedro.reyes@example.com',
      address: '321 Palengke Lane, Barangay 4',
      totalDebt: 3200,
      lastTransactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  archivedCustomers: [] as ArchivedCustomerRecord[],
  transactions: [
    {
      id: '1',
      customerId: '1',
      type: 'debt' as const,
      amount: 500,
      description: 'Rice, canned goods',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      customerId: '1',
      type: 'debt' as const,
      amount: 1000,
      description: 'Groceries and snacks',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      customerId: '2',
      type: 'debt' as const,
      amount: 2500,
      description: 'Monthly grocery supply',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      customerId: '3',
      type: 'payment' as const,
      amount: 300,
      description: 'Partial payment',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      customerId: '4',
      type: 'debt' as const,
      amount: 3200,
      description: 'Soap, detergent, cleaning supplies',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [archivedCustomers, setArchivedCustomers] = useState<ArchivedCustomerRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    const storedArchivedCustomers = localStorage.getItem('archivedCustomers');
    const storedTransactions = localStorage.getItem('transactions');

    if (storedCustomers && storedArchivedCustomers && storedTransactions) {
      try {
        setCustomers(JSON.parse(storedCustomers));
        setArchivedCustomers(JSON.parse(storedArchivedCustomers));
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error('Failed to load data:', error);
        setCustomers(SAMPLE_DATA.customers);
        setArchivedCustomers(SAMPLE_DATA.archivedCustomers);
        setTransactions(SAMPLE_DATA.transactions);
      }
    } else {
      setCustomers(SAMPLE_DATA.customers);
      setArchivedCustomers(SAMPLE_DATA.archivedCustomers);
      setTransactions(SAMPLE_DATA.transactions);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('customers', JSON.stringify(customers));
      localStorage.setItem('archivedCustomers', JSON.stringify(archivedCustomers));
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [customers, archivedCustomers, transactions, isHydrated]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalDebt' | 'lastTransactionDate'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalDebt: 0,
      lastTransactionDate: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (
    customerId: string,
    updates: Pick<Customer, 'name' | 'phone' | 'email' | 'address'>,
  ) => {
    setCustomers(
      customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              ...updates,
            }
          : customer,
      ),
    );
  };

  const archiveCustomer = (customerId: string) => {
    const customerToArchive = customers.find((customer) => customer.id === customerId);

    if (!customerToArchive) {
      return;
    }

    const customerTransactions = transactions.filter((transaction) => transaction.customerId === customerId);

    setCustomers(customers.filter((customer) => customer.id !== customerId));
    setArchivedCustomers([
      ...archivedCustomers,
      {
        customer: customerToArchive,
        transactions: customerTransactions,
      },
    ]);
    setTransactions(transactions.filter((transaction) => transaction.customerId !== customerId));
  };

  const restoreCustomer = (customerId: string) => {
    const archivedRecord = archivedCustomers.find((record) => record.customer.id === customerId);

    if (!archivedRecord) {
      return;
    }

    setArchivedCustomers(
      archivedCustomers.filter((record) => record.customer.id !== customerId),
    );
    setCustomers([...customers, archivedRecord.customer]);
    setTransactions([...transactions, ...archivedRecord.transactions]);
  };

  const deleteCustomer = (customerId: string) => {
    const archivedMatch = archivedCustomers.some((record) => record.customer.id === customerId);

    if (archivedMatch) {
      setArchivedCustomers(
        archivedCustomers.filter((record) => record.customer.id !== customerId),
      );
      return;
    }

    setCustomers(customers.filter((c) => c.id !== customerId));
    setTransactions(transactions.filter((t) => t.customerId !== customerId));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    setTransactions([...transactions, newTransaction]);

    // Update customer's totalDebt
    setCustomers(
      customers.map((customer) => {
        if (customer.id === transactionData.customerId) {
          const debtChange =
            transactionData.type === 'debt'
              ? transactionData.amount
              : -transactionData.amount;
          return {
            ...customer,
            totalDebt: Math.max(0, customer.totalDebt + debtChange),
            lastTransactionDate: new Date().toISOString(),
          };
        }
        return customer;
      })
    );
  };

  const getCustomerTransactions = (customerId: string): Transaction[] => {
    return transactions
      .filter((t) => t.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCustomerById = (customerId: string): Customer | undefined => {
    return customers.find((c) => c.id === customerId);
  };

  const getTotalDebt = (): number => {
    return customers.reduce((sum, customer) => sum + customer.totalDebt, 0);
  };

  const getCustomersWithDebt = (): Customer[] => {
    return customers.filter((c) => c.totalDebt > 0).sort((a, b) => b.totalDebt - a.totalDebt);
  };

  const getThisWeekNetChange = (): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekTransactions = transactions.filter(
      (t) => new Date(t.date) >= oneWeekAgo
    );

    return weekTransactions.reduce((sum, t) => {
      const change = t.type === 'debt' ? t.amount : -t.amount;
      return sum + change;
    }, 0);
  };

  return (
    <StoreContext.Provider
      value={{
        customers,
        archivedCustomers,
        transactions,
        addCustomer,
        updateCustomer,
        archiveCustomer,
        restoreCustomer,
        deleteCustomer,
        addTransaction,
        getCustomerTransactions,
        getCustomerById,
        getTotalDebt,
        getCustomersWithDebt,
        getThisWeekNetChange,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
