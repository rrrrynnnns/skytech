import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function GET() {
	try {
		const bookings = await prisma.booking.findMany({ orderBy: { submittedAt: 'desc' } });
		return NextResponse.json({ data: bookings, error: null });
	} catch (error) {
		return NextResponse.json({ data: null, error: error instanceof Error ? error.message : 'Unable to load bookings.' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		if (!body.name || !body.email || !body.contact || !body.address || !body.plan || !body.preferredDate) {
			return NextResponse.json({ data: null, error: 'Name, email, contact, address, plan, and preferred date are required.' }, { status: 400 });
		}
		const booking = await prisma.booking.create({ data: { id: `BK-${Date.now()}`, name: body.name, email: body.email, contact: body.contact, address: body.address, plan: body.plan, preferredDate: new Date(body.preferredDate), status: 'Pending', notes: body.message || null } });
		return NextResponse.json({ data: booking, error: null }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ data: null, error: error instanceof Error ? error.message : 'Unable to create booking.' }, { status: 500 });
	}
}
