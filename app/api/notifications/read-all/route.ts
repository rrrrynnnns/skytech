import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PUT() { await prisma.notification.updateMany({ data: { read: true } }); return NextResponse.json({ data: { updated: true }, error: null }); }
