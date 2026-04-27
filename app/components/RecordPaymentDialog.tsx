'use client';

import { useState } from 'react';
import { useStore } from '@/app/contexts/StoreContext';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

export function RecordPaymentDialog({ isOpen, onClose, customerId }: RecordPaymentDialogProps) {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    amount: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const { customers, addTransaction, getCustomerById } = useStore();

  const customersWithDebt = customers.filter((c) => c.totalDebt > 0);
  const selectedCustomer = formData.customerId ? getCustomerById(formData.customerId) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    if (selectedCustomer && paymentAmount > selectedCustomer.totalDebt) {
      setError(`Payment cannot exceed outstanding debt of ₱${selectedCustomer.totalDebt.toFixed(2)}`);
      return;
    }

    addTransaction({
      customerId: formData.customerId,
      type: 'payment',
      amount: paymentAmount,
      description: formData.notes || 'Payment received',
      date: new Date().toISOString(),
    });

    setFormData({
      customerId: customerId || '',
      amount: '',
      notes: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-3xl bg-white px-8 py-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Record Payment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Customer
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              disabled={!!customerId}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
            >
              <option value="">Select a customer</option>
              {customersWithDebt.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - Outstanding: ₱{customer.totalDebt.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3">
              <p className="text-sm text-slate-700">
                Outstanding Balance:{' '}
                <span className="font-bold text-blue-600">
                  ₱{selectedCustomer.totalDebt.toFixed(2)}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Payment Amount (₱)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              max={selectedCustomer ? selectedCustomer.totalDebt : undefined}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/70"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/70"
              placeholder="Payment notes"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(22,163,74,0.6)] hover:bg-[#15803d]"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
