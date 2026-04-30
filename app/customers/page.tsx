'use client';

import { Layout } from '@/app/components/Layout';
import { AddCustomerDialog } from '@/app/components/AddCustomerDialog';
import { AddDebtDialog } from '@/app/components/AddDebtDialog';
import { RecordPaymentDialog } from '@/app/components/RecordPaymentDialog';
import { useStore } from '@/app/contexts/StoreContext';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone, Plus, Search, UserPlus } from 'lucide-react';

type FilterType = 'all' | 'with-debt' | 'no-debt';

export default function CustomersPage() {
  const { customers } = useStore();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCustomers = useMemo(() => {
    let result = customers;

    // Apply filter
    if (filter === 'with-debt') {
      result = result.filter((c) => c.totalDebt > 0);
    } else if (filter === 'no-debt') {
      result = result.filter((c) => c.totalDebt === 0);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) => {
        const email = c.email || '';
        return (
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          email.toLowerCase().includes(term) ||
          c.address.toLowerCase().includes(term)
        );
      });
    }

    // Sort by debt (highest first)
    return result.sort((a, b) => b.totalDebt - a.totalDebt);
  }, [customers, filter, searchTerm]);

  const handleAddDebt = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowAddDebt(true);
  };

  const handleRecordPayment = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowRecordPayment(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Customers</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[13px] font-semibold text-blue-600">
                {customers.length}
              </span>
              <span>Total customers</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
            <button
              onClick={() => {
                setSelectedCustomerId(undefined);
                setShowAddDebt(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f31260] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#e11d48] min-h-[44px]"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Add Debt</span>
            </button>
            <button
              onClick={() => {
                setSelectedCustomerId(undefined);
                setShowRecordPayment(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#15803d] min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1d4ed8] min-h-[44px]"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-3xl bg-white p-4 md:p-5 shadow-md">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
              </span>
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-14 pr-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/70"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'all' as FilterType, label: 'All' },
                { value: 'with-debt' as FilterType, label: 'With Debt' },
                { value: 'no-debt' as FilterType, label: 'No Debt' },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`flex-1 min-w-[70px] rounded-2xl px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition min-h-[40px] ${
                    filter === btn.value
                      ? btn.value === 'with-debt'
                        ? 'bg-[#f31260] text-white shadow-[0_10px_24px_rgba(243,18,96,0.4)]'
                        : btn.value === 'no-debt'
                        ? 'bg-[#16a34a] text-white shadow-[0_10px_24px_rgba(22,163,74,0.4)]'
                        : 'bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.45)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg text-gray-600">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Outstanding Debt
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 bg-white last:border-b-0 transition-colors duration-150 hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="group flex items-center gap-3 transition-transform duration-150 ease-out active:scale-[0.97]"
                        >
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-[#2563ff] to-[#0047ff] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.5)] group-hover:shadow-[0_10px_22px_rgba(37,99,235,0.6)]">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                                {customer.name}
                              </span>
                              {customer.totalDebt > 0 && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                  Debt
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 align-middle text-sm text-slate-600">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[13px]">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{customer.email || 'No email set'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2 text-[13px]">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{customer.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold">
                        <span
                          className={
                            customer.totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'
                          }
                        >
                          ₱{customer.totalDebt.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700">
                        {customer.lastTransactionDate
                          ? new Date(customer.lastTransactionDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddCustomerDialog isOpen={showAddCustomer} onClose={() => setShowAddCustomer(false)} />
      <AddDebtDialog
        isOpen={showAddDebt}
        onClose={() => setShowAddDebt(false)}
        customerId={selectedCustomerId}
      />
      <RecordPaymentDialog
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        customerId={selectedCustomerId}
      />
    </Layout>
  );
}
