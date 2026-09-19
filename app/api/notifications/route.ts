import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function GET() { return NextResponse.json({ data: await prisma.notification.findMany({ orderBy: { timestamp: 'desc' } }), error: null }); }
export async function POST(request: Request) { const body = await request.json(); if (!body.forRole || !body.type || !body.title || !body.body) return NextResponse.json({ data: null, error: 'Role, type, title, and body are required.' }, { status: 400 }); const notification = await prisma.notification.create({ data: { forRole: body.forRole, forUserId: body.forUserId || null, type: body.type, title: body.title, body: body.body } }); return NextResponse.json({ data: notification, error: null }, { status: 201 }); }
