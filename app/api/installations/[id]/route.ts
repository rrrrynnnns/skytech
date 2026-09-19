import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const body = await request.json(); return NextResponse.json(await prisma.installation.update({ where: { id }, data: { address: body.address, type: body.type, status: body.status?.replace(' ', '_'), date: body.date ? new Date(body.date) : undefined, time: body.time, notes: body.notes } })); }
