import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const { status, adminNote } = await request.json(); return NextResponse.json({ data: await prisma.ticket.update({ where: { id }, data: { status, adminNote } }), error: null }); }
