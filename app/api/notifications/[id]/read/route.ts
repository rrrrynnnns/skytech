import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PUT(_: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const notification = await prisma.notification.update({ where: { id }, data: { read: true } }); return NextResponse.json({ data: notification, error: null }); }
