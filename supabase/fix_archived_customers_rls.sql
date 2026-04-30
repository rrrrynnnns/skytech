-- Fix Supabase RLS Policy for archived_customers table
-- Run this script in the Supabase SQL Editor to resolve the RLS violation error

-- 1. Ensure archived_customers table has RLS enabled
ALTER TABLE public.archived_customers ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing problematic policy if it exists
DROP POLICY IF EXISTS archived_customers_full_access ON public.archived_customers;
DROP POLICY IF EXISTS archived_customers_insert_policy ON public.archived_customers;
DROP POLICY IF EXISTS archived_customers_select_policy ON public.archived_customers;
DROP POLICY IF EXISTS archived_customers_update_policy ON public.archived_customers;
DROP POLICY IF EXISTS archived_customers_delete_policy ON public.archived_customers;

-- 3. Create new comprehensive RLS policies for archived_customers

-- Allow SELECT for all authenticated users and anon
CREATE POLICY archived_customers_select_policy
  ON public.archived_customers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT for all authenticated users and anon
CREATE POLICY archived_customers_insert_policy
  ON public.archived_customers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow UPDATE for all authenticated users and anon
CREATE POLICY archived_customers_update_policy
  ON public.archived_customers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow DELETE for all authenticated users and anon
CREATE POLICY archived_customers_delete_policy
  ON public.archived_customers
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Verify the policies are in place
-- Run this query to check: SELECT * FROM pg_policies WHERE tablename = 'archived_customers';
