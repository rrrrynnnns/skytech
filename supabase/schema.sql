begin;

create extension if not exists pgcrypto;

-- Repair old lowercase columns to camelCase columns used by the app.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'totaldebt'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'totalDebt'
  ) then
    execute 'alter table public.customers rename column totaldebt to "totalDebt"';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'lasttransactiondate'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'lastTransactionDate'
  ) then
    execute 'alter table public.customers rename column lasttransactiondate to "lastTransactionDate"';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'customerid'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'customerId'
  ) then
    execute 'alter table public.transactions rename column customerid to "customerId"';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'duedate'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'dueDate'
  ) then
    execute 'alter table public.transactions rename column duedate to "dueDate"';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'archived_customers' and column_name = 'archivedat'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'archived_customers' and column_name = 'archivedAt'
  ) then
    execute 'alter table public.archived_customers rename column archivedat to "archivedAt"';
  end if;
end $$;

create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  address text not null,
  "totalDebt" numeric(12,2) not null default 0,
  "lastTransactionDate" timestamptz
);

alter table public.customers
  add column if not exists "totalDebt" numeric(12,2) not null default 0,
  add column if not exists "lastTransactionDate" timestamptz;

create table if not exists public.transactions (
  id text primary key,
  "customerId" text not null,
  type text not null check (type in ('debt', 'payment')),
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  date timestamptz not null default now(),
  "dueDate" timestamptz
);

alter table public.transactions
  add column if not exists "customerId" text,
  add column if not exists "dueDate" timestamptz;

-- Align existing ID columns to text so app UUID IDs can be inserted.
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'transactions'
      and constraint_name = 'transactions_customerId_fkey'
  ) then
    alter table public.transactions drop constraint "transactions_customerId_fkey";
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'id' and data_type <> 'text'
  ) then
    alter table public.customers alter column id drop default;
    alter table public.customers alter column id type text using id::text;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'id' and data_type <> 'text'
  ) then
    alter table public.transactions alter column id drop default;
    alter table public.transactions alter column id type text using id::text;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'customerId' and data_type <> 'text'
  ) then
    alter table public.transactions alter column "customerId" type text using "customerId"::text;
  end if;
end $$;

-- Ensure FK exists and cascades on delete.
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'transactions'
      and constraint_name = 'transactions_customerId_fkey'
  ) then
    alter table public.transactions
      add constraint "transactions_customerId_fkey"
      foreign key ("customerId") references public.customers(id) on delete cascade;
  end if;
end $$;

create table if not exists public.archived_customers (
  id text primary key,
  customer jsonb not null,
  transactions jsonb not null default '[]'::jsonb,
  "archivedAt" timestamptz not null default now()
);

alter table public.archived_customers
  add column if not exists "archivedAt" timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'archived_customers' and column_name = 'id' and data_type <> 'text'
  ) then
    alter table public.archived_customers alter column id drop default;
    alter table public.archived_customers alter column id type text using id::text;
  end if;
end $$;

create index if not exists idx_customers_name on public.customers (name);
create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_customers_total_debt on public.customers ("totalDebt");
create index if not exists idx_transactions_customer_id on public.transactions ("customerId");
create index if not exists idx_transactions_date on public.transactions (date desc);
create index if not exists idx_transactions_type on public.transactions (type);
create index if not exists idx_transactions_due_date on public.transactions ("dueDate");

create or replace function public.recompute_customer_balance(p_customer_id text)
returns void
language plpgsql
as $$
begin
  update public.customers c
  set
    "totalDebt" = greatest(
      coalesce((
        select sum(
          case
            when t.type = 'debt' then t.amount
            when t.type = 'payment' then -t.amount
            else 0
          end
        )
        from public.transactions t
        where t."customerId" = p_customer_id
      ), 0),
      0
    ),
    "lastTransactionDate" = (
      select max(t.date)
      from public.transactions t
      where t."customerId" = p_customer_id
    )
  where c.id = p_customer_id;
end;
$$;

create or replace function public.handle_transactions_balance_sync()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recompute_customer_balance(new."customerId");
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.recompute_customer_balance(new."customerId");
    if old."customerId" is distinct from new."customerId" then
      perform public.recompute_customer_balance(old."customerId");
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    perform public.recompute_customer_balance(old."customerId");
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_transactions_balance_sync on public.transactions;
create trigger trg_transactions_balance_sync
after insert or update or delete on public.transactions
for each row execute function public.handle_transactions_balance_sync();

-- Backfill computed fields from existing transactions.
update public.customers c
set
  "totalDebt" = greatest(
    coalesce((
      select sum(
        case
          when t.type = 'debt' then t.amount
          when t.type = 'payment' then -t.amount
          else 0
        end
      )
      from public.transactions t
      where t."customerId" = c.id
    ), 0),
    0
  ),
  "lastTransactionDate" = (
    select max(t.date)
    from public.transactions t
    where t."customerId" = c.id
  );

alter table public.customers enable row level security;
alter table public.transactions enable row level security;
alter table public.archived_customers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customers'
      and policyname = 'customers_full_access'
  ) then
    create policy customers_full_access
      on public.customers
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'transactions'
      and policyname = 'transactions_full_access'
  ) then
    create policy transactions_full_access
      on public.transactions
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'archived_customers'
      and policyname = 'archived_customers_full_access'
  ) then
    create policy archived_customers_full_access
      on public.archived_customers
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;

commit;
