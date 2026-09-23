import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireRole } from '@/app/lib/api';

function getMonthlyDueDate(year: number, monthIndex: number, billingDay: number) {
	const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
	const safeDay = Math.min(Math.max(1, billingDay), lastDayOfMonth);
	return new Date(Date.UTC(year, monthIndex, safeDay, 12, 0, 0, 0));
}

function getDueDateForBillingPeriod(billingPeriod: string | null | undefined, billingDay = 30) {
	if (!billingPeriod || !/^\d{4}-\d{2}$/.test(billingPeriod)) {
		return null;
	}
	const [yearStr, monthStr] = billingPeriod.split('-');
	const year = Number(yearStr);
	const monthIndex = Number(monthStr) - 1;
	if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
		return null;
	}
	return getMonthlyDueDate(year, monthIndex, billingDay);
}

export async function GET(request: Request) {
	const access = await requireRole(['admin', 'subscriber']);
	if (access.response) return access.response;
	const status = new URL(request.url).searchParams.get('status');
	const isSubscriber = access.session?.user?.role === 'subscriber';
	const subscriberId = isSubscriber ? access.session.user.subscriberId : new URL(request.url).searchParams.get('subscriberId');
	const bills = await prisma.bill.findMany({ where: { ...(subscriberId ? { subscriberId } : {}), ...(status && status !== 'All' ? { status: status as 'Paid' | 'Unpaid' | 'Overdue' } : {}) }, orderBy: { dueDate: 'desc' }, include: { subscriber: { select: { name: true } } } });
	const systemSettings = await prisma.systemSettings.findUnique({ where: { id: 'singleton' } });
	const billingDay = Number(systemSettings?.billingDay ?? 30);
	const normalizedBills = bills.map((bill) => ({
		...bill,
		dueDate: getDueDateForBillingPeriod(bill.billingPeriod, billingDay) ?? bill.dueDate,
	}));
	if (!isSubscriber || !subscriberId) return NextResponse.json({ data: normalizedBills, error: null });

	const [subscriber] = await Promise.all([
		prisma.subscriber.findUnique({ where: { id: subscriberId } }),
	]);
	const plans = Array.isArray(systemSettings?.plans) ? systemSettings.plans as Array<{ name?: string; price?: number }> : [];
	const planName = subscriber?.plan.replace(/_/g, ' ') || '';
	const currentPlan = plans.find((plan) => plan.name?.replace(/\s+/g, '').toLowerCase() === planName.replace(/\s+/g, '').toLowerCase());
	const currentPrice = currentPlan?.price;
	let currentBills = normalizedBills;
	if (!currentBills.length && subscriber && currentPrice !== undefined) {
		const now = new Date();
		const createdBill = await prisma.bill.create({
			data: {
				id: `BILL-${subscriber.id}-${Date.now()}`,
				subscriberId: subscriber.id,
				plan: subscriber.plan,
				billingPeriod: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
				amount: Number(currentPrice),
				dueDate: getMonthlyDueDate(now.getFullYear(), now.getMonth(), billingDay),
				status: 'Unpaid',
			},
		});
		currentBills = [{ ...createdBill, subscriber: { name: subscriber.name } }];
	} else if (currentPrice !== undefined) {
		currentBills = currentBills.map((bill) => ({ ...bill, amount: Number(currentPrice) }));
	}
	return NextResponse.json({ data: currentBills, error: null });
}
