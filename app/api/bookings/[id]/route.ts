import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireRole } from '@/app/lib/api';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const access = await requireRole(['admin']); if (access.response) return access.response; const { id } = await context.params; const body = await request.json(); return NextResponse.json({ data: await prisma.booking.update({ where: { id }, data: { status: body.status, notes: body.notes } }), error: null }); }
