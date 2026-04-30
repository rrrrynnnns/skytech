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

  const handleSubmit = async (e: React.FormEvent) => {
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

    await addCustomer({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white px-6 py-6 md:px-8 md:py-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Add New Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="e.g., Maria Santos"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="e.g., 09171234567"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="e.g., maria@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="e.g., Barangay San Juan, Cainta"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-11"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="order-1 sm:order-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition min-h-11"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
