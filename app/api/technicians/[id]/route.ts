import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) { const { id } = await context.params; const body = await request.json(); return NextResponse.json({ data: await prisma.technician.update({ where: { id }, data: { name: body.name, email: body.email, specialization: body.specialization, status: body.status?.replace(' ', '_') } }), error: null }); }
export async function DELETE(_: Request, context: Context) { const { id } = await context.params; await prisma.$transaction([prisma.installation.deleteMany({ where: { technicianId: id } }), prisma.user.deleteMany({ where: { technicianId: id } }), prisma.technician.delete({ where: { id } })]); return new NextResponse(null, { status: 204 }); }
