-- Sky-Tech ISP migration for Supabase PostgreSQL.
-- Safe to run in Supabase SQL Editor. Existing store tables are preserved.

create extension if not exists pgcrypto;

do $$ begin create type public."Role" as enum ('admin', 'technician', 'subscriber'); exception when duplicate_object then null; end $$;
do $$ begin create type public."Plan" as enum ('Fiber_25Mbps', 'Fiber_50Mbps', 'Fiber_100Mbps'); exception when duplicate_object then null; end $$;
do $$ begin create type public."SubscriberStatus" as enum ('Active', 'Suspended', 'Disconnected'); exception when duplicate_object then null; end $$;
do $$ begin create type public."TechnicianStatus" as enum ('Active', 'Off_Duty', 'On_Leave'); exception when duplicate_object then null; end $$;
do $$ begin create type public."BillStatus" as enum ('Paid', 'Unpaid', 'Overdue'); exception when duplicate_object then null; end $$;
do $$ begin create type public."InstallationType" as enum ('Installation', 'Repair', 'Maintenance'); exception when duplicate_object then null; end $$;
do $$ begin create type public."InstallationStatus" as enum ('Scheduled', 'In_Progress', 'Completed', 'Cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public."BookingStatus" as enum ('Pending', 'Reviewed', 'Approved', 'Rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public."TicketType" as enum ('Billing_Inquiry', 'No_Internet_Connection', 'Slow_Internet_Connection'); exception when duplicate_object then null; end $$;
do $$ begin create type public."TicketStatus" as enum ('Open', 'In_Progress', 'Resolved', 'Closed'); exception when duplicate_object then null; end $$;
do $$ begin create type public."TicketPriority" as enum ('Low', 'Medium', 'High', 'Urgent'); exception when duplicate_object then null; end $$;
do $$ begin create type public."NotifType" as enum ('booking', 'billing', 'installation', 'system', 'task', 'assignment', 'update'); exception when duplicate_object then null; end $$;

create table if not exists public."User" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null unique,
  password text not null,
  role public."Role" not null,
  "subscriberId" text,
  "technicianId" text
);
create table if not exists public."Subscriber" (
  id text primary key,
  name text not null,
  email text not null,
  contact text not null,
  address text not null,
  plan public."Plan" not null,
  status public."SubscriberStatus" not null default 'Active',
  "connectionDate" timestamptz not null default now()
);
alter table public."Subscriber" add column if not exists province text;
alter table public."Subscriber" add column if not exists city text;
alter table public."Subscriber" add column if not exists barangay text;
alter table public."Subscriber" add column if not exists street text;
alter table public."Subscriber" add column if not exists "zipCode" text;
update public."Subscriber" set street = address where street is null;
create table if not exists public."Technician" (
  id text primary key,
  name text not null,
  email text not null unique,
  specialization text not null,
  status public."TechnicianStatus" not null default 'Active'
);
create table if not exists public."Bill" (
  id text primary key,
  "subscriberId" text not null references public."Subscriber"(id) on delete cascade,
  plan public."Plan" not null,
  "billingPeriod" text not null,
  amount numeric(12,2) not null check (amount >= 0),
  "dueDate" timestamptz not null,
  status public."BillStatus" not null default 'Unpaid',
  "paymentMethod" text,
  "referenceNumber" text
);
create table if not exists public."Installation" (
  id text primary key,
  "subscriberId" text not null references public."Subscriber"(id) on delete cascade,
  "technicianId" text not null references public."Technician"(id),
  address text not null,
  date timestamptz not null,
  time text not null,
  type public."InstallationType" not null,
  status public."InstallationStatus" not null default 'Scheduled',
  notes text
);
create table if not exists public."Booking" (
  id text primary key,
  name text not null,
  contact text not null,
  email text not null,
  address text not null,
  plan public."Plan" not null,
  "preferredDate" timestamptz not null,
  "submittedAt" timestamptz not null default now(),
  status public."BookingStatus" not null default 'Pending',
  notes text,
  "subscriberId" text references public."Subscriber"(id) on delete set null
);
create table if not exists public."Ticket" (
  id text primary key,
  "subscriberId" text not null references public."Subscriber"(id) on delete cascade,
  type public."TicketType" not null,
  subject text not null,
  description text not null,
  status public."TicketStatus" not null default 'Open',
  priority public."TicketPriority" not null default 'Medium',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "adminNote" text
);
create table if not exists public."Notification" (
  id text primary key default gen_random_uuid()::text,
  "forRole" public."Role" not null,
  "forUserId" text,
  type public."NotifType" not null,
  title text not null,
  body text not null,
  timestamp timestamptz not null default now(),
  read boolean not null default false
);
create table if not exists public."Message" (
  id text primary key default gen_random_uuid()::text,
  "fromId" text not null,
  "fromName" text not null,
  "fromRole" text not null,
  "toId" text not null,
  content text not null,
  timestamp timestamptz not null default now(),
  "isBot" boolean not null default false
);
create table if not exists public."SystemSettings" (
  id text primary key default 'singleton',
  "companyName" text not null,
  "companyEmail" text not null,
  phone text not null,
  address text not null,
  "lateFeePercent" numeric(5,2) not null default 0,
  "gracePeriodDays" integer not null default 0,
  "billingDay" integer not null default 1,
  plans jsonb not null default '[]'::jsonb
);

alter table public."User" enable row level security;
alter table public."Subscriber" enable row level security;
alter table public."Technician" enable row level security;
alter table public."Bill" enable row level security;
alter table public."Installation" enable row level security;
alter table public."Booking" enable row level security;
alter table public."Ticket" enable row level security;
alter table public."Notification" enable row level security;
alter table public."Message" enable row level security;
alter table public."SystemSettings" enable row level security;

-- The Next.js server uses Prisma with a server-side database connection.
-- Do not add open anon policies to these tables in production.
