'use client';

import { useState } from 'react';
import { useStore } from '@/app/contexts/StoreContext';

interface AddDebtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

export function AddDebtDialog({ isOpen, onClose, customerId }: AddDebtDialogProps) {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    amount: '',
    description: '',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const { customers, addTransaction } = useStore();

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
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    addTransaction({
      customerId: formData.customerId,
      type: 'debt',
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
    });

    setFormData({
      customerId: customerId || '',
      amount: '',
      description: '',
      dueDate: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-3xl bg-white px-8 py-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Add New Debt</h2>

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
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Amount (₱)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="e.g., Rice, canned goods, snacks"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
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
              className="flex-1 rounded-xl bg-[#f31260] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(243,18,96,0.45)] hover:bg-[#e11d48]"
            >
              Add Debt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
