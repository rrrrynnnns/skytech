import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireRole } from '@/app/lib/api';
export async function GET() {
	const access = await requireRole(['admin', 'technician']); if (access.response) return access.response;
	const installations = await prisma.installation.findMany({ where: access.session?.user?.role === 'technician' && access.session.user.technicianId ? { technicianId: access.session.user.technicianId } : undefined, orderBy: { date: 'asc' }, include: { technician: true } });
	const data = await Promise.all(installations.map(async (installation) => ({ ...installation, subscriber: await prisma.subscriber.findUnique({ where: { id: installation.subscriberId }, select: { name: true, address: true, province: true, city: true, barangay: true, street: true, zipCode: true } }) })));
	return NextResponse.json({ data, error: null });
}
export async function POST(request: Request) {
	const access = await requireRole(['admin']); if (access.response) return access.response;
	try {
		const body = await request.json();
		if ((!body.subscriberId && !body.subscriberName) || (!body.technicianId && !body.technicianName) || !body.address || !body.date || !body.time || !body.type) return NextResponse.json({ data: null, error: 'Subscriber, technician, address, date, time, and type are required.' }, { status: 400 });
		const subscriber = body.subscriberId ? null : await prisma.subscriber.findFirst({ where: { name: body.subscriberName } });
		const technician = body.technicianId ? null : await prisma.technician.findFirst({ where: { name: body.technicianName } });
		if ((!body.subscriberId && !subscriber) || (!body.technicianId && !technician)) return NextResponse.json({ data: null, error: 'Selected subscriber or technician was not found.' }, { status: 404 });
		const existingInstallations = await prisma.installation.findMany({ select: { id: true } });
		const highestId = existingInstallations.reduce((highest, installation) => { const numericId = /^\d{7}$/.test(installation.id) ? Number(installation.id) : 1000000; return Math.max(highest, numericId); }, 1000000);
		const installation = await prisma.installation.create({ data: { id: String(highestId + 1), subscriberId: body.subscriberId || subscriber?.id, technicianId: body.technicianId || technician?.id, address: body.address, date: new Date(body.date), time: body.time, type: body.type, status: body.status || 'Scheduled', notes: body.notes || null } });
		return NextResponse.json({ data: installation, error: null }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ data: null, error: error instanceof Error ? error.message : 'Unable to create installation.' }, { status: 500 });
	}
}
