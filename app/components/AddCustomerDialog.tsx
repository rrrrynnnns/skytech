'use client';

import { useState } from 'react';
import { useStore } from '@/app/contexts/StoreContext';

interface AddCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerDialog({ isOpen, onClose }: AddCustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');
  const { addCustomer } = useStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
    });

    setFormData({ name: '', phone: '', email: '', address: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-3xl bg-white px-8 py-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Add New Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="e.g., Maria Santos"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Phone (09XXXXXXXXX)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="09171234567"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="Full address"
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
              className="flex-1 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.6)] hover:bg-[#1d4ed8]"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
