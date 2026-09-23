import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireRole } from '@/app/lib/api';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
	const access = await requireRole(['admin', 'technician']);
	if (access.response) return access.response;

	const { id } = await context.params;
	const { status, adminNote, technicianId, visitDate, visitTime } = await request.json();
	const normalizedStatus = String(status || '').replace(/\s+/g, '_');
	const allowedStatuses = ['Open', 'In_Progress', 'Resolved', 'Closed'];
	if (!allowedStatuses.includes(normalizedStatus)) {
		return NextResponse.json({ data: null, error: 'Invalid ticket status.' }, { status: 400 });
	}

	const data = {
		status: normalizedStatus as 'Open' | 'In_Progress' | 'Resolved' | 'Closed',
		adminNote,
		...(access.session?.user?.role === 'admin' ? {
			technicianId: technicianId || null,
			visitDate: visitDate ? new Date(`${visitDate}T12:00:00.000Z`) : null,
			visitTime: visitTime || null,
		} : {}),
	};

	return NextResponse.json({
		data: await prisma.ticket.update({ where: { id }, data }),
		error: null,
	});
}
