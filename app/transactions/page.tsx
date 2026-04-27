"use client";

import { Layout } from '@/app/components/Layout';
import { StatCard } from '@/app/components/StatCard';
import { useStore } from '@/app/contexts/StoreContext';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

type FilterType = 'all' | 'debts' | 'payments';

export default function TransactionsPage() {
  const { transactions, customers } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (filter === 'debts') {
      result = result.filter((t) => t.type === 'debt');
    } else if (filter === 'payments') {
      result = result.filter((t) => t.type === 'payment');
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter]);

  // Calculate summary
  const summary = useMemo(() => {
    const debts = transactions.filter((t) => t.type === 'debt').reduce((sum, t) => sum + t.amount, 0);
    const payments = transactions.filter((t) => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalDebts: debts,
      totalPayments: payments,
      netOutstanding: debts - payments,
    };
  }, [transactions]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[12px] font-semibold text-blue-600">
              {transactions.length}
            </span>
            <span>Total transactions</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Total Debts Added"
            value={`₱${summary.totalDebts.toFixed(2)}`}
            icon={<TrendingUp className="h-7 w-7" />}
            color="red"
          />
          <StatCard
            title="Total Payments Received"
            value={`₱${summary.totalPayments.toFixed(2)}`}
            icon={<TrendingDown className="h-7 w-7 rotate-180" />}
            color="green"
          />
          <StatCard
            title="Net Outstanding"
            value={`₱${summary.netOutstanding.toFixed(2)}`}
            icon={<DollarSign className="h-7 w-7" />}
            color="blue"
          />
        </div>

        {/* Filter */}
        <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center gap-4 px-8 py-5">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
              </span>
              <span>Filter:</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { value: 'all' as FilterType, label: 'All Transactions' },
                { value: 'debts' as FilterType, label: 'Debts Only' },
                { value: 'payments' as FilterType, label: 'Payments Only' },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`min-w-[140px] rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
                    filter === btn.value
                      ? btn.value === 'debts'
                        ? 'bg-[#f31260] text-white shadow-[0_12px_30px_rgba(243,18,96,0.45)]'
                        : btn.value === 'payments'
                        ? 'bg-[#16a34a] text-white shadow-[0_12px_30px_rgba(22,163,74,0.45)]'
                        : 'bg-[#2563eb] text-white shadow-[0_12px_30px_rgba(37,99,235,0.55)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.14)]">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const customer = customers.find((c) => c.id === transaction.customerId);
                    const isDebt = transaction.type === 'debt';
                    const dateLabel = new Date(transaction.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    });

                    const dueLabel =
                      transaction.dueDate && isDebt
                        ? new Date(transaction.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          })
                        : null;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-slate-100 bg-white last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <span>{dateLabel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-[#2563ff] to-[#0047ff] text-xs font-semibold text-white">
                              {(customer?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <Link
                                href={`/customers/${transaction.customerId}`}
                                className="text-sm font-semibold text-slate-900 hover:text-blue-600"
                              >
                                {customer?.name || 'Unknown'}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-5 py-1.5 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)] ${
                              isDebt
                                ? 'bg-gradient-to-r from-[#ff416c] to-[#ff4b2b]'
                                : 'bg-gradient-to-r from-[#00c851] to-[#00bfa5]'
                            }`}
                          >
                            {isDebt ? 'Debt' : 'Payment'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {dueLabel ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                              <Clock className="h-4 w-4" />
                              {dueLabel}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold">
                          <span className={isDebt ? 'text-red-600' : 'text-emerald-600'}>
                            {isDebt ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
