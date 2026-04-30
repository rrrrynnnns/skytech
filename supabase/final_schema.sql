-- COMPLETE SUPABASE SQL SCHEMA FOR SARI-SARI UTANG
-- This script creates all tables, sets correct types, and foreign keys for your app.
-- Run this in the Supabase SQL Editor. It is safe to run multiple times.

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id text PRIMARY KEY,
    name text NOT NULL,
    phone text,
    email text,
    created_at timestamptz DEFAULT now()
);

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id text PRIMARY KEY,
    customer_id text REFERENCES customers(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    type text NOT NULL, -- e.g. 'debt' or 'payment'
    note text,
    transaction_date timestamptz DEFAULT now()
);

-- 3. ARCHIVED CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS archived_customers (
    id text PRIMARY KEY,
    name text,
    phone text,
    email text,
    archived_at timestamptz DEFAULT now()
);

-- 4. MIGRATE EXISTING ID COLUMNS TO TEXT (SAFE TO RUN MULTIPLE TIMES)
DO $$
BEGIN
    -- Customers.id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='customers' AND column_name='id' AND data_type <> 'text'
    ) THEN
        ALTER TABLE customers ALTER COLUMN id TYPE text USING id::text;
    END IF;
    -- Transactions.id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='transactions' AND column_name='id' AND data_type <> 'text'
    ) THEN
        ALTER TABLE transactions ALTER COLUMN id TYPE text USING id::text;
    END IF;
    -- Transactions.customer_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='transactions' AND column_name='customer_id' AND data_type <> 'text'
    ) THEN
        ALTER TABLE transactions ALTER COLUMN customer_id TYPE text USING customer_id::text;
    END IF;
    -- Archived_customers.id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='archived_customers' AND column_name='id' AND data_type <> 'text'
    ) THEN
        ALTER TABLE archived_customers ALTER COLUMN id TYPE text USING id::text;
    END IF;
END $$;

-- 5. DROP AND RECREATE FOREIGN KEY (SAFE TO RUN MULTIPLE TIMES)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='transactions' AND constraint_type='FOREIGN KEY' AND constraint_name='transactions_customer_id_fkey'
    ) THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_customer_id_fkey;
    END IF;
    -- Re-add foreign key
    ALTER TABLE transactions
        ADD CONSTRAINT transactions_customer_id_fkey
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
END $$;

-- 6. (OPTIONAL) ENABLE ROW LEVEL SECURITY (RLS) IF YOU WANT
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE archived_customers ENABLE ROW LEVEL SECURITY;

-- 7. (OPTIONAL) OPEN POLICIES FOR TESTING (REMOVE IN PRODUCTION)
-- CREATE POLICY "Allow all" ON customers FOR ALL USING (true);
-- CREATE POLICY "Allow all" ON transactions FOR ALL USING (true);
-- CREATE POLICY "Allow all" ON archived_customers FOR ALL USING (true);

-- 8. REFRESH SCHEMA CACHE (Supabase auto-refreshes, but wait 10-20s after running)
-- No direct SQL needed, just reload dashboard if needed.

-- DONE. Your tables are now ready for Supabase-only usage!