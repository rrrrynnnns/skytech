"use client";

import { Layout } from '@/app/components/Layout';
import { StatCard } from '@/app/components/StatCard';
import { AddDebtDialog } from '@/app/components/AddDebtDialog';
import { RecordPaymentDialog } from '@/app/components/RecordPaymentDialog';
import { useStore } from '@/app/contexts/StoreContext';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
  const {
    customers,
    transactions,
    getTotalDebt,
    getCustomersWithDebt,
    getThisWeekNetChange,
  } = useStore();

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  const totalDebt = getTotalDebt();
  const customersWithDebt = getCustomersWithDebt();
  const thisWeekChange = getThisWeekNetChange();

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-slate-500">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span>Real-time overview of your store&apos;s debt records</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Outstanding Debt"
            value={`₱${totalDebt.toFixed(2)}`}
            icon={<DollarSign className="h-7 w-7" />}
            color="red"
          />
          <StatCard
            title="Customers with Debt"
            value={`${customersWithDebt.length} / ${customers.length}`}
            icon={<AlertCircle className="h-7 w-7" />}
            color="yellow"
          />
          <StatCard
            title="Total Customers"
            value={customers.length}
            icon={<Users className="h-7 w-7" />}
            color="blue"
          />
          <StatCard
            title="This Week Activity"
            value={`₱${thisWeekChange.toFixed(2)}`}
            icon={<TrendingUp className="h-7 w-7" />}
            color="green"
          />
        </div>

        {/* Reminders & Recent Activity row */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Reminders */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between bg-linear-to-r from-[#ff2750] via-[#ff2f8c] to-[#ff5b1f] px-8 py-6 text-white">
              <div>
                <h2 className="text-2xl font-bold">Reminders</h2>
                <p className="text-sm text-pink-100">Customers with outstanding debt</p>
              </div>
              {customersWithDebt.length > 0 && (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-sm font-semibold">
                  {Math.min(customersWithDebt.length, 9)}
                </div>
              )}
            </div>

            <div className="bg-white px-8 py-4">
              {customersWithDebt.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No customers with outstanding debt 🎉
                </p>
              ) : (
                <div className="space-y-2">
                  {customersWithDebt.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-linear-to-br from-[#ff2f6b] to-[#ff5b1f] text-sm font-semibold text-white">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/customers/${customer.id}`}
                            className="text-[15px] font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-400">Outstanding</p>
                        <p className="text-[15px] font-bold text-[#ef4444]">
                          ₱{customer.totalDebt.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {customersWithDebt.length > 5 && (
                <div className="mt-3 text-right text-xs font-semibold text-blue-600">
                  <Link href="/customers">View all customers with debt →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between bg-linear-to-r from-[#2669ff] to-[#533bff] px-8 py-6 text-white">
              <div>
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <p className="text-sm text-blue-100">Latest transactions</p>
              </div>
              <Link
                href="/transactions"
                className="text-sm font-semibold text-white/80 hover:text-white"
              >
                View all
              </Link>
            </div>

            <div className="bg-white px-8 py-4">
              {recentTransactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => {
                    const customer = customers.find((c) => c.id === transaction.customerId);
                    const isDebt = transaction.type === 'debt';

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/customers/${transaction.customerId}`}
                              className="text-[15px] font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {customer?.name || 'Unknown'}
                            </Link>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                isDebt
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }`}
                            >
                              {isDebt ? 'Debt' : 'Payment'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{transaction.description}</p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right text-[15px] font-bold">
                          <p className={isDebt ? 'text-[#ef4444]' : 'text-[#16a34a]'}>
                            {isDebt ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddDebtDialog isOpen={showAddDebt} onClose={() => setShowAddDebt(false)} />
        <RecordPaymentDialog
          isOpen={showRecordPayment}
          onClose={() => setShowRecordPayment(false)}
        />
      </div>
    </Layout>
  );
}
