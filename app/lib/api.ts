import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function requireRole(roles: string[]) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !roles.includes(role)) {
    return { session: null, response: NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 }) };
  }
  return { session, response: null };
}

export function apiError(error: unknown, status = 500) {
  return NextResponse.json({ data: null, error: error instanceof Error ? error.message : 'Request failed.' }, { status });
}
