# Supabase RLS Policy Fix for archived_customers

## Problem
When archiving customers, you receive the error:
```
Supabase archive insert error: "new row violates row-level security policy for table \"archived_customers\""
```

## Root Cause
The Row-Level Security (RLS) policy on the `archived_customers` table is either:
1. Not properly configured
2. Using overly restrictive `with check` conditions
3. Missing for the INSERT operation

## Solution

### Step 1: Run the SQL Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents from `supabase/fix_archived_customers_rls.sql`
5. Click **Run**

### Step 2: Verify the Fix
After running the migration, verify the policies are in place by running:
```sql
SELECT * FROM pg_policies WHERE tablename = 'archived_customers';
```

You should see 5 policies:
- `archived_customers_select_policy`
- `archived_customers_insert_policy`
- `archived_customers_update_policy`
- `archived_customers_delete_policy`

### Step 3: Test
Try archiving a customer again. The operation should now succeed.

## What the Fix Does
- **Drops all existing policies** that might be causing conflicts
- **Creates specific policies** for SELECT, INSERT, UPDATE, and DELETE operations
- **Allows access** for both `anon` and `authenticated` users (required for this app's setup)
- **Uses `WITH CHECK (true)`** to ensure inserts are never blocked

## Technical Details
The `archived_customers` table has this structure:
```
- id (text, primary key)
- customer (jsonb, NOT NULL) - stores the full customer object
- transactions (jsonb, NOT NULL) - stores the array of transactions
- archivedAt (timestamptz) - timestamp when archived
```

The new RLS policies explicitly allow:
- **SELECT**: All users can read archived customer records
- **INSERT**: All users can archive new customers
- **UPDATE**: All users can modify archived records
- **DELETE**: All users can delete archived records

## If the Problem Persists
1. Check that RLS is actually enabled on the table:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'archived_customers';
   ```
   
2. If `rowsecurity` is `false`, enable it:
   ```sql
   ALTER TABLE public.archived_customers ENABLE ROW LEVEL SECURITY;
   ```

3. Check your authentication in the app - make sure users are properly authenticated through Supabase Auth

## References
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- Related error location: `app/contexts/StoreContext.tsx:147` (archiveCustomer function)
