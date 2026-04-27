'use client';

import { useMemo, useState } from 'react';
import { Archive, Mail, MapPin, Phone, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { useStore } from '@/app/contexts/StoreContext';

type FilterType = 'all' | 'with-debt' | 'no-debt';
type ConfirmAction = 'restore' | 'delete';

export default function ArchivePage() {
	const { archivedCustomers, restoreCustomer, deleteCustomer } = useStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState<FilterType>('all');
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
	const [selectedCustomerName, setSelectedCustomerName] = useState('');

	const filteredCustomers = useMemo(() => {
		let result = archivedCustomers;

		if (filter === 'with-debt') {
			result = result.filter((record) => record.customer.totalDebt > 0);
		} else if (filter === 'no-debt') {
			result = result.filter((record) => record.customer.totalDebt === 0);
		}

		if (!searchTerm.trim()) {
			return result.sort((a, b) => b.customer.totalDebt - a.customer.totalDebt);
		}

		const term = searchTerm.toLowerCase();

		const searched = result.filter(
			(record) =>
				record.customer.name.toLowerCase().includes(term) ||
				record.customer.phone.toLowerCase().includes(term),
		);

		return searched.sort((a, b) => b.customer.totalDebt - a.customer.totalDebt);
	}, [archivedCustomers, filter, searchTerm]);

	const openConfirmDialog = (action: ConfirmAction, customerId: string, customerName: string) => {
		setConfirmAction(action);
		setSelectedCustomerId(customerId);
		setSelectedCustomerName(customerName);
	};

	const closeConfirmDialog = () => {
		setConfirmAction(null);
		setSelectedCustomerId(null);
		setSelectedCustomerName('');
	};

	const handleConfirmAction = () => {
		if (!confirmAction || !selectedCustomerId) {
			return;
		}

		if (confirmAction === 'restore') {
			restoreCustomer(selectedCustomerId);
		} else {
			deleteCustomer(selectedCustomerId);
		}

		closeConfirmDialog();
	};

	return (
		<Layout>
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tight text-slate-900">Archive</h1>
					<p className="text-sm text-slate-500">Manage archived customers</p>
				</div>

				<div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="relative flex-1">
							<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
									<Search className="h-4 w-4" />
								</span>
							</span>
							<input
								type="text"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Search archived customers..."
								className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-14 pr-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/70"
							/>
						</div>

						<div className="flex items-center gap-2">
							{[
								{ value: 'all' as FilterType, label: 'All' },
								{ value: 'with-debt' as FilterType, label: 'With Debt' },
								{ value: 'no-debt' as FilterType, label: 'No Debt' },
							].map((btn) => (
								<button
									key={btn.value}
									onClick={() => setFilter(btn.value)}
									className={`min-w-20 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
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

				{archivedCustomers.length === 0 ? (
					<div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
						<div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
							<Archive className="h-12 w-12" />
						</div>
						<p className="mt-4 text-lg font-semibold text-slate-700">No archived customers</p>
					</div>
				) : filteredCustomers.length === 0 ? (
					<div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
						<p className="text-lg font-semibold text-slate-700">No customers match your search</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
						<div className="overflow-x-auto">
							<table className="min-w-full table-auto">
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
										<th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredCustomers.map((record) => (
										<tr
											key={record.customer.id}
											className="border-b border-slate-100 bg-white last:border-b-0 transition-colors duration-150 hover:bg-slate-50/80"
										>
											<td className="px-6 py-4">
												<div className="group flex items-center gap-3">
													<div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-[#2563ff] to-[#0047ff] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.5)]">
														{record.customer.name.charAt(0).toUpperCase()}
													</div>
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<span className="text-sm font-semibold text-slate-900">
																{record.customer.name}
															</span>
															{record.customer.totalDebt > 0 && (
																<span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
																	Debt
																</span>
															)}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 align-middle text-sm text-slate-600">
												<div className="flex flex-col gap-1">
													<div className="flex items-center gap-2 text-[13px]">
														<Phone className="h-4 w-4 text-slate-400" />
														<span>{record.customer.phone}</span>
													</div>
													<div className="flex items-center gap-2 text-[12px] text-slate-500">
														<Mail className="h-4 w-4 text-slate-400" />
														<span>{record.customer.email || 'No email set'}</span>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-slate-600">
												<div className="flex items-center gap-2 text-[13px]">
													<MapPin className="h-4 w-4 text-slate-400" />
													<span>{record.customer.address}</span>
												</div>
											</td>
											<td
												className={`px-6 py-4 text-right text-sm font-bold ${
													record.customer.totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'
												}`}
											>
												₱{record.customer.totalDebt.toFixed(2)}
											</td>
											<td className="px-6 py-4 align-top">
												<div className="flex flex-wrap justify-end gap-2">
													<button
														type="button"
														onClick={() =>
															openConfirmDialog(
																'restore',
																record.customer.id,
																record.customer.name,
															)
														}
														className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
													>
														<RotateCcw className="h-4 w-4" />
														Restore
													</button>
													<button
														type="button"
														onClick={() =>
															openConfirmDialog(
																'delete',
																record.customer.id,
																record.customer.name,
															)
														}
														className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
													>
														<Trash2 className="h-4 w-4" />
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{confirmAction && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
					<div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_26px_70px_rgba(15,23,42,0.6)]">
						<h2 className="mb-4 text-2xl font-bold text-gray-900">
							{confirmAction === 'restore' ? 'Restore Customer?' : 'Delete Customer?'}
						</h2>
						<p className="mb-6 text-gray-600">
							{confirmAction === 'restore'
								? `Are you sure you want to restore ${selectedCustomerName}? This will move the customer back to your active list.`
								: `Are you sure you want to permanently delete ${selectedCustomerName}? This action cannot be undone.`}
						</p>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={closeConfirmDialog}
								className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirmAction}
								className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition ${
									confirmAction === 'restore'
										? 'bg-green-600 hover:bg-green-700'
										: 'bg-red-600 hover:bg-red-700'
								}`}
							>
								{confirmAction === 'restore' ? 'Restore' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}
		</Layout>
	);
}
