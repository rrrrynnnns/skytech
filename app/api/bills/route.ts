import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireRole } from '@/app/lib/api';
export async function GET(request: Request) {
	const access = await requireRole(['admin', 'subscriber']);
	if (access.response) return access.response;
	const status = new URL(request.url).searchParams.get('status');
	const isSubscriber = access.session?.user?.role === 'subscriber';
	const subscriberId = isSubscriber ? access.session.user.subscriberId : new URL(request.url).searchParams.get('subscriberId');
	const bills = await prisma.bill.findMany({ where: { ...(subscriberId ? { subscriberId } : {}), ...(status && status !== 'All' ? { status: status as 'Paid' | 'Unpaid' | 'Overdue' } : {}) }, orderBy: { dueDate: 'desc' } });
	if (!isSubscriber || !subscriberId) return NextResponse.json({ data: bills, error: null });

	const [subscriber, systemSettings] = await Promise.all([
		prisma.subscriber.findUnique({ where: { id: subscriberId } }),
		prisma.systemSettings.findUnique({ where: { id: 'singleton' } }),
	]);
	const plans = Array.isArray(systemSettings?.plans) ? systemSettings.plans as Array<{ name?: string; price?: number }> : [];
	const planName = subscriber?.plan.replace(/_/g, ' ') || '';
	const currentPlan = plans.find((plan) => plan.name?.replace(/\s+/g, '').toLowerCase() === planName.replace(/\s+/g, '').toLowerCase());
	const currentPrice = currentPlan?.price;
	let currentBills = bills;
	if (!currentBills.length && subscriber && currentPrice !== undefined) {
		const now = new Date();
		const createdBill = await prisma.bill.create({
			data: {
				id: `BILL-${subscriber.id}-${Date.now()}`,
				subscriberId: subscriber.id,
				plan: subscriber.plan,
				billingPeriod: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
				amount: Number(currentPrice),
				dueDate: new Date(now.getFullYear(), now.getMonth(), 30),
				status: 'Unpaid',
			},
		});
		currentBills = [createdBill];
	} else if (currentPrice !== undefined) {
		currentBills = currentBills.map((bill) => ({ ...bill, amount: Number(currentPrice) }));
	}
	return NextResponse.json({ data: currentBills, error: null });
}
