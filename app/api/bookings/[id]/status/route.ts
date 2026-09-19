import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const { status } = await request.json(); return NextResponse.json(await prisma.booking.update({ where: { id }, data: { status } })); }
