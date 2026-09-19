import 'next-auth';
declare module 'next-auth' { interface Session { user: { id?: string; role?: string; subscriberId?: string; technicianId?: string } & DefaultSession['user'] } }
declare module 'next-auth/jwt' { interface JWT { role?: string; subscriberId?: string; technicianId?: string } }
