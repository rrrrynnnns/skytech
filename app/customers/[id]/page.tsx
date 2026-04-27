"use client";

import { Layout } from '@/app/components/Layout';
import { AddDebtDialog } from '@/app/components/AddDebtDialog';
import { RecordPaymentDialog } from '@/app/components/RecordPaymentDialog';
import { SendReminderDialog } from '@/app/components/SendReminderDialog';
import { useStore } from '@/app/contexts/StoreContext';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Archive,
  Pencil,
  ArrowUpRight,
  CalendarDays,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Plus,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const {
    getCustomerById,
    getCustomerTransactions,
    archiveCustomer,
    updateCustomer,
  } = useStore();
  const customer = getCustomerById(customerId);
  const transactions = getCustomerTransactions(customerId);

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showSendReminder, setShowSendReminder] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const transactionsWithBalance = useMemo(() => {
    let balance = 0;
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const withBalance = sorted.map((transaction) => {
      balance += transaction.type === 'debt' ? transaction.amount : -transaction.amount;
      return { ...transaction, balance };
    });

    // Show newest transactions first while keeping correct running balance
    return withBalance.reverse();
  }, [transactions]);

  if (!customer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg text-slate-600">Customer not found</p>
          <button
            onClick={() => router.push('/customers')}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customers</span>
          </button>
        </div>
      </Layout>
    );
  }

  const handleArchive = () => {
    archiveCustomer(customerId);
    router.push('/archive');
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
    });
    setEditError('');
    setShowEditDialog(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim() || !editForm.address.trim()) {
      setEditError('Name, phone, and address are required.');
      return;
    }

    updateCustomer(customerId, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim() || undefined,
      address: editForm.address.trim(),
    });
    setShowEditDialog(false);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/customers')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-md hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-[#2563ff] to-[#0047ff] text-2xl font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.6)]">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  {customer.name}
                </h1>
                <p className="text-sm font-medium text-slate-500">Customer Details</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddDebt(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f31260] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#e11d48]"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Add Debt</span>
            </button>
            <button
              onClick={() => setShowRecordPayment(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#15803d]"
            >
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSendReminder(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
            >
              <Mail className="h-4 w-4" />
              <span>Send Reminder</span>
            </button>
            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1d4ed8]"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-600"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </button>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Phone */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-[#e5f0ff] px-7 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-md">
                <Phone className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-slate-800">Phone</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{customer.phone}</p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-[#e5f9ff] px-7 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00bcd4] text-white shadow-md">
                <Mail className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-slate-800">Email</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {customer.email || 'maria.santos@example.com'}
            </p>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-[#f5e9ff] px-7 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b5cf6] text-white shadow-md">
                <MapPin className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-slate-800">Address</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{customer.address}</p>
          </div>

          {/* Outstanding Debt */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-[#ffe5f0] px-7 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f31260] text-white shadow-md">
                <DollarSign className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-slate-800">Outstanding Debt</p>
            </div>
            <p
              className={`text-3xl font-extrabold ${
                customer.totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              ₱{customer.totalDebt.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_22px_55px_rgba(15,23,42,0.15)]">
          <div className="flex items-center justify-between bg-slate-900 px-8 py-6 text-white">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Transaction History</h2>
              <p className="mt-1 text-sm text-slate-300">
                {transactions.length} total transaction{transactions.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>

          {transactions.length === 0 ? (
            <p className="px-8 py-10 text-center text-slate-500">No transactions yet</p>
          ) : (
            <div className="divide-y divide-slate-100 bg-slate-50/60">
              {transactionsWithBalance.map((transaction) => {
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
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 bg-white px-8 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-5 py-1.5 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)] ${
                            isDebt
                              ? 'bg-linear-to-r from-[#ff416c] to-[#ff4b2b]'
                              : 'bg-linear-to-r from-[#00c851] to-[#00bfa5]'
                          }`}
                        >
                          {isDebt ? 'Debt' : 'Payment'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <CalendarDays className="h-4 w-4" />
                          {dateLabel}
                        </span>
                        {dueLabel && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                            <Clock className="h-4 w-4" />
                            Due: {dueLabel}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {transaction.description}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <div
                        className={`text-lg font-bold ${
                          isDebt ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {isDebt ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Balance:{' '}
                        <span className="font-semibold text-slate-900">
                          ₱{transaction.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddDebtDialog
        isOpen={showAddDebt}
        onClose={() => setShowAddDebt(false)}
        customerId={customerId}
      />
      <RecordPaymentDialog
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        customerId={customerId}
      />
      <SendReminderDialog
        isOpen={showSendReminder}
        onClose={() => setShowSendReminder(false)}
        customerId={customerId}
      />

      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Archive Customer?</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to archive {customer.name}? This will move the customer to the
              archive page.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 rounded-lg bg-slate-600 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-3xl bg-white px-8 py-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Edit Customer</h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
                  placeholder="e.g., Maria Santos"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
                  placeholder="09171234567"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
                  placeholder="Full address"
                />
              </div>

              {editError && <p className="text-sm font-semibold text-red-600">{editError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#2563eb] px-4 py-2 font-semibold text-white transition hover:bg-[#1d4ed8]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
