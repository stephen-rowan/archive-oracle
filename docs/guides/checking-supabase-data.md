# How to Check Supabase Database Data

There are several ways to inspect the data in your Supabase database. Here are the most common methods:

## Method 1: Supabase Dashboard (Easiest)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in and select your project
3. Navigate to **Table Editor** in the left sidebar
4. Click on any table to view its data
5. You can filter, sort, and search data directly in the UI

**Pros:** No code needed, visual interface, easy filtering  
**Cons:** Requires web access, may be slower for large datasets

## Method 2: Using the Inspection Script

A Node.js script is available to quickly check your database:

```bash
# Show row counts for all tables
node scripts/inspect-supabase-data.js

# Show sample data from a specific table
node scripts/inspect-supabase-data.js meetingsummaries
node scripts/inspect-supabase-data.js workgroups
node scripts/inspect-supabase-data.js users
```

**Available tables:**
- `admin`
- `archives`
- `docs_page`
- `docs_page_section`
- `document_copies`
- `documents`
- `documents_test`
- `meetingsummaries`
- `meetingsummaries_test`
- `missingsummaries`
- `names`
- `nods_page`
- `nods_page_section`
- `tags`
- `users`
- `workgroups`

## Method 3: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Connect to your database
supabase db connect

# Or use psql directly with connection string
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Then run SQL queries
SELECT COUNT(*) FROM meetingsummaries;
SELECT * FROM meetingsummaries LIMIT 10;
```

## Method 4: Create a Custom Query Script

You can create your own script using the Supabase client:

```javascript
const { supabase } = require("../lib/supabaseClient");

async function checkData() {
  // Get all meeting summaries
  const { data, error } = await supabase
    .from('meetingsummaries')
    .select('*')
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }
}

checkData();
```

## Method 5: Using SQL Editor in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Write and run SQL queries:

```sql
-- Count rows in each table
SELECT 'meetingsummaries' as table_name, COUNT(*) as count FROM meetingsummaries
UNION ALL
SELECT 'workgroups', COUNT(*) FROM workgroups
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'names', COUNT(*) FROM names
UNION ALL
SELECT 'tags', COUNT(*) FROM tags;

-- Get recent meeting summaries
SELECT meeting_id, name, date, confirmed, created_at 
FROM meetingsummaries 
ORDER BY created_at DESC 
LIMIT 20;

-- Check specific workgroup data
SELECT * FROM workgroups WHERE workgroup = 'Your Workgroup Name';
```

## Environment Variables

Make sure you have these set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under **API**.

## Troubleshooting

**"Missing Supabase environment variables" error:**
- Check that `.env.local` exists in the project root
- Verify the variable names are correct (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Make sure there are no extra spaces or quotes around the values

**"Permission denied" or RLS errors:**
- Some tables have Row Level Security (RLS) enabled
- You may need to authenticate or use a service role key for certain queries
- Check the `schema.sql` file to see which policies are in place

**Connection issues:**
- Verify your Supabase project is active
- Check your internet connection
- Ensure the URL and keys are correct
