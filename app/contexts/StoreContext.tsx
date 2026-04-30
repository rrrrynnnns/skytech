'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Transaction } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabaseClient';

type ArchivedCustomerRecord = {
  customer: Customer;
  transactions: Transaction[];
};

interface StoreContextType {
  customers: Customer[];
  archivedCustomers: ArchivedCustomerRecord[];
  transactions: Transaction[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalDebt' | 'lastTransactionDate'>) => Promise<void>;
  updateCustomer: (
    customerId: string,
    updates: Pick<Customer, 'name' | 'phone' | 'email' | 'address'>,
  ) => Promise<void>;
  archiveCustomer: (customerId: string) => Promise<void>;
  restoreCustomer: (customerId: string) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  getCustomerTransactions: (customerId: string) => Transaction[];
  getCustomerById: (customerId: string) => Customer | undefined;
  getTotalDebt: () => number;
  getCustomersWithDebt: () => Customer[];
  getThisWeekNetChange: () => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [archivedCustomers, setArchivedCustomers] = useState<ArchivedCustomerRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      const [{ data: customersData, error: customersError }, { data: transactionsData, error: transactionsError }] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('transactions').select('*'),
      ]);

      const {
        data: archivedCustomersData,
        error: archivedCustomersError,
      } = await supabase.from('archived_customers').select('*');

      if (customersError) {
        console.error('Supabase customers error:', customersError.message);
      }
      if (archivedCustomersError) {
        const isMissingArchiveTable =
          archivedCustomersError.code === 'PGRST205' ||
          archivedCustomersError.message.includes("Could not find the table 'public.archived_customers'");

        if (!isMissingArchiveTable) {
          console.error('Supabase archived customers error:', archivedCustomersError.message);
        }
      }
      if (transactionsError) {
        console.error('Supabase transactions error:', transactionsError.message);
      }

      setCustomers((customersData || []) as Customer[]);
      
      // Deduplicate archived customers by ID to prevent duplicate key errors
      const uniqueArchivedCustomers = Array.from(
        new Map(
          ((archivedCustomersData || []) as ArchivedCustomerRecord[]).map((record) => [
            record.customer.id,
            record,
          ])
        ).values()
      );
      setArchivedCustomers(uniqueArchivedCustomers);
      
      setTransactions((transactionsData || []) as Transaction[]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'totalDebt' | 'lastTransactionDate'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      totalDebt: 0,
      lastTransactionDate: new Date().toISOString(),
    };

    const { error } = await supabase.from('customers').insert([
      {
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        totalDebt: newCustomer.totalDebt,
        lastTransactionDate: newCustomer.lastTransactionDate,
      },
    ]);

    if (error) {
      console.error('Supabase insert customer error:', error.message);
      return;
    }

    setCustomers((prev) => [...prev, newCustomer]);
  };

  const updateCustomer = async (
    customerId: string,
    updates: Pick<Customer, 'name' | 'phone' | 'email' | 'address'>,
  ) => {
    const { error } = await supabase.from('customers').update(updates).eq('id', customerId);

    if (error) {
      console.error('Supabase update customer error:', error.message);
      return;
    }

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              ...updates,
            }
          : customer,
      ),
    );
  };

  const archiveCustomer = async (customerId: string) => {
    const customerToArchive = customers.find((customer) => customer.id === customerId);

    if (!customerToArchive) {
      console.error('Customer not found for archiving:', customerId);
      return;
    }

    const customerTransactions = transactions.filter((transaction) => transaction.customerId === customerId);

    // Prepare archive data with explicit validation
    const archiveData = {
      id: customerId,
      customer: customerToArchive,
      transactions: customerTransactions,
    };

    const { error: archiveInsertError } = await supabase.from('archived_customers').upsert([archiveData]);

    if (archiveInsertError) {
      console.error('Supabase archive insert error:', {
        message: archiveInsertError.message,
        code: archiveInsertError.code,
        details: archiveInsertError.details,
        hint: archiveInsertError.hint,
      });
      // RLS policy issue hint
      if (archiveInsertError.message.includes('row-level security')) {
        console.error(
          'RLS Policy Issue: Check that the archived_customers table has proper INSERT permissions.',
          'See ARCHIVE_RLS_FIX.md for solution.'
        );
      }
      return;
    }

    const { error: customerDeleteError } = await supabase.from('customers').delete().eq('id', customerId);
    if (customerDeleteError) {
      console.error('Supabase archive customer delete error:', customerDeleteError.message);
      return;
    }

    const { error: transactionDeleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('customerId', customerId);

    if (transactionDeleteError) {
      console.error('Supabase archive transactions delete error:', transactionDeleteError.message);
      return;
    }

    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    setArchivedCustomers((prev) => {
      // Prevent duplicates: remove any existing record with this ID and add the new one
      const filtered = prev.filter((record) => record.customer.id !== customerId);
      return [
        ...filtered,
        {
          customer: customerToArchive,
          transactions: customerTransactions,
        },
      ];
    });
    setTransactions((prev) => prev.filter((transaction) => transaction.customerId !== customerId));
  };

  const restoreCustomer = async (customerId: string) => {
    const archivedRecord = archivedCustomers.find((record) => record.customer.id === customerId);

    if (!archivedRecord) {
      return;
    }

    const { error: customerInsertError } = await supabase.from('customers').upsert([archivedRecord.customer]);
    if (customerInsertError) {
      console.error('Supabase restore customer error:', customerInsertError.message);
      return;
    }

    if (archivedRecord.transactions.length > 0) {
      const { error: transactionInsertError } = await supabase
        .from('transactions')
        .upsert(archivedRecord.transactions);

      if (transactionInsertError) {
        console.error('Supabase restore transactions error:', transactionInsertError.message);
        return;
      }
    }

    const { error: archiveDeleteError } = await supabase
      .from('archived_customers')
      .delete()
      .eq('id', customerId);

    if (archiveDeleteError) {
      console.error('Supabase restore archive delete error:', archiveDeleteError.message);
      return;
    }

    setArchivedCustomers((prev) => prev.filter((record) => record.customer.id !== customerId));
    setCustomers((prev) => {
      // Prevent duplicates: remove any existing customer with this ID and add the restored one
      const filtered = prev.filter((customer) => customer.id !== customerId);
      return [...filtered, archivedRecord.customer];
    });
    setTransactions((prev) => {
      // Prevent duplicates: remove any existing transactions and add restored ones
      const filtered = prev.filter((transaction) => transaction.customerId !== customerId);
      return [...filtered, ...archivedRecord.transactions];
    });
  };

  const deleteCustomer = async (customerId: string) => {
    const archivedMatch = archivedCustomers.some((record) => record.customer.id === customerId);

    if (archivedMatch) {
      const { error } = await supabase.from('archived_customers').delete().eq('id', customerId);
      if (error) {
        console.error('Supabase delete archived customer error:', error.message);
        return;
      }

      setArchivedCustomers((prev) => prev.filter((record) => record.customer.id !== customerId));
    } else {
      const { error: transactionDeleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('customerId', customerId);

      if (transactionDeleteError) {
        console.error('Supabase delete transactions error:', transactionDeleteError.message);
        return;
      }

      const { error: customerDeleteError } = await supabase.from('customers').delete().eq('id', customerId);
      if (customerDeleteError) {
        console.error('Supabase delete customer error:', customerDeleteError.message);
        return;
      }

      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setTransactions((prev) => prev.filter((t) => t.customerId !== customerId));
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };

    const { error: transactionInsertError } = await supabase.from('transactions').insert([newTransaction]);
    if (transactionInsertError) {
      console.error('Supabase insert transaction error:', transactionInsertError.message);
      return;
    }

    setTransactions((prev) => [...prev, newTransaction]);

    // Maintain local totals for immediate UI feedback.
    setCustomers((prev) =>
      prev.map((customer) => {
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
      }),
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

  if (isLoading) {
    return null;
  }

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
