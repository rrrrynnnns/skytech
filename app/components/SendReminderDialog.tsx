'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/app/contexts/StoreContext';

interface SendReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

type ReminderType = 'friendly' | 'due-today' | 'urgent';

const REMINDER_TEMPLATES: Record<ReminderType, string> = {
  friendly:
    'Hi {name}, pa-remind lang po na may utang kayo na ₱{balance} sa tindahan. Sana po mabayaran soon. Salamat!',
  'due-today':
    'Hi {name}, pa-remind lang po na due na po ang inyong utang na ₱{balance} sa tindahan today. Sana po mabayaran agad. Salamat!',
  urgent:
    'Hi {name}, urgent reminder lang po na kailangan na pong mabayaran ang utang ninyo na ₱{balance} sa tindahan. Pakiasikaso po agad. Salamat!',
};

const formatBalance = (amount: number) => amount.toFixed(2);

export function SendReminderDialog({ isOpen, onClose, customerId }: SendReminderDialogProps) {
  const { customers } = useStore();
  const initialCustomerId = customerId || customers[0]?.id || '';

  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [reminderType, setReminderType] = useState<ReminderType>('friendly');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedCustomerId(customerId || customers[0]?.id || '');
    setReminderType('friendly');
    setError('');
    setSuccessMessage('');
  }, [isOpen, customerId, customers]);

  useEffect(() => {
    if (!selectedCustomer) {
      setMessage('');
      return;
    }

    const template = REMINDER_TEMPLATES[reminderType]
      .replaceAll('{name}', selectedCustomer.name)
      .replaceAll('{balance}', formatBalance(selectedCustomer.totalDebt));

    setMessage(template);
  }, [selectedCustomer, reminderType]);

  if (!isOpen) return null;

  const reminderTypeLabel =
    reminderType === 'friendly'
      ? 'Friendly Reminder'
      : reminderType === 'due-today'
        ? 'Due Today'
        : 'Urgent Reminder';

  const handleSend = async () => {
    setError('');
    setSuccessMessage('');

    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }

    if (!selectedCustomer.email) {
      setError('Selected customer has no email address.');
      return;
    }

    if (selectedCustomer.totalDebt <= 0) {
      setError('Selected customer has no outstanding balance.');
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedCustomer.email,
          subject: reminderTypeLabel,
          outstandingBalance: selectedCustomer.totalDebt,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reminder email.');
        return;
      }

      setSuccessMessage('Reminder email sent successfully.');
    } catch {
      setError('Failed to send reminder email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white px-8 py-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
        <h2 className="mb-5 text-2xl font-semibold text-slate-900">Send Reminder</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Customer <span className="text-red-500">*</span>
            </label>
            {customerId ? (
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {selectedCustomer?.name || 'Select Customer'}
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Outstanding Balance
            </label>
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
              ₱ {selectedCustomer ? formatBalance(selectedCustomer.totalDebt) : '0.00'}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="mt-1 font-normal text-slate-900">
                {selectedCustomer?.email || 'No email set'}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Reminder Type
            </label>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
            >
              <option value="friendly">Friendly Reminder</option>
              <option value="due-today">Due Today</option>
              <option value="urgent">Urgent Reminder</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Message Preview <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/70"
              placeholder="Write your reminder message..."
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          {successMessage && <p className="text-sm font-semibold text-emerald-600">{successMessage}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(249,115,22,0.45)] hover:bg-[#ea580c]"
            >
              {isSending ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}