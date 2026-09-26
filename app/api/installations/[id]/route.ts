import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await context.params;
		const body = await request.json();
		const status = body.status?.replaceAll(' ', '_');
		if (status) await prisma.$executeRaw`UPDATE "Installation" SET "status" = CAST(${status} AS "InstallationStatus") WHERE "id" = ${id}`;
		const installation = await prisma.installation.update({ where: { id }, data: { address: body.address, type: body.type, date: body.date ? new Date(body.date) : undefined, time: body.time, notes: body.notes } });
		return NextResponse.json(status ? await prisma.installation.findUnique({ where: { id } }) : installation);
	} catch (error) {
		return NextResponse.json({ data: null, error: error instanceof Error ? error.message : 'Unable to update installation.' }, { status: 500 });
	}
}
