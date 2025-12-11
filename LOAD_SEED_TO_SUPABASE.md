# How to Load seed.sql to Supabase Using CLI

This guide shows you how to upload/load your generated `seed.sql` file to Supabase using the Supabase CLI.

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   # Check if installed
   supabase --version
   
   # Install if needed (macOS)
   brew install supabase/tap/supabase
   
   # Or install via npm
   npm install -g supabase
   ```

2. **Logged into Supabase CLI**
   ```bash
   supabase login
   ```

3. **Project linked** (for remote projects)
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

## Method 1: Local Supabase Development (Recommended for Testing)

### Step 1: Start Local Supabase

```bash
# Start Supabase locally
supabase start
```

**Note**: If you encounter an "unhealthy" auth container error (common on Apple Silicon Macs), use:
```bash
# Start Supabase with health check bypass
supabase start --ignore-health-check

# Or use the npm script
npm run supabase:start
```

This will start a local PostgreSQL instance on port `54322`.

### Step 2: Copy seed.sql to Supabase Directory

```bash
# Copy your seed.sql to the supabase directory
cp test-output/seed.sql supabase/seed.sql

# Or if you have a different location
cp /path/to/your/seed.sql supabase/seed.sql
```

### Step 3: Reset Database (Loads seed.sql automatically)

```bash
# This resets the database and automatically runs supabase/seed.sql
supabase db reset
```

**Note**: `supabase db reset` will:
- Drop all tables
- Re-run all migrations
- Execute `supabase/seed.sql` automatically

### Step 4: Verify Data Loaded

```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:54322/postgres

# Or use Supabase CLI
supabase db psql

# Then run queries:
SELECT COUNT(*) FROM workgroups;
SELECT COUNT(*) FROM meetingsummaries;
SELECT COUNT(*) FROM names;
SELECT COUNT(*) FROM tags;
```

## Method 2: Direct psql Connection (Local)

If you prefer to load the seed file directly without resetting:

```bash
# Load seed.sql directly into local Supabase
psql -h localhost -p 54322 -U postgres -d postgres -f test-output/seed.sql

# Or with password prompt
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f test-output/seed.sql
```

## Method 3: Remote Supabase Project (Production/Staging)

### Option A: Using db push with seed file

1. **Copy seed.sql to supabase directory:**
   ```bash
   cp test-output/seed.sql supabase/seed.sql
   ```

2. **Push to remote database:**
   ```bash
   # Push migrations and seed data
   supabase db push --include-seed
   ```

   **Note**: This requires your seed file to be in `supabase/seed.sql` or configured in `config.toml`.

### Option B: Using psql (Direct SQL execution)

```bash
# For local Supabase - Execute seed.sql directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed.sql

# Note: supabase db psql does NOT support the -f flag
# You must use psql directly with the connection string
```

### Option C: Using psql with connection string

1. **Get your connection string from Supabase Dashboard:**
   - Go to: Settings → Database → Connection string
   - Copy the "URI" connection string

2. **Load seed.sql:**
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f test-output/seed.sql
   ```

   Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual values.

## Method 4: Using Supabase Seed File Configuration

If you want to use multiple seed files or organize them differently:

1. **Create a seeds directory:**
   ```bash
   mkdir -p supabase/seeds
   cp test-output/seed.sql supabase/seeds/meetings.sql
   ```

2. **Configure in `supabase/config.toml`:**
   ```toml
   [db.seed]
   enabled = true
   sql_paths = ['./seeds/meetings.sql']
   ```

3. **Reset or push:**
   ```bash
   # For local
   supabase db reset
   
   # For remote
   supabase db push --include-seed
   ```

## Quick Reference Commands

### Local Development
```bash
# Start Supabase (use --ignore-health-check if auth container is unhealthy)
supabase start --ignore-health-check
# Or: npm run supabase:start

# Copy seed file
cp test-output/seed.sql supabase/seed.sql

# Reset and load seed
supabase db reset

# Or load directly
psql -h localhost -p 54322 -U postgres -d postgres -f test-output/seed.sql
```

### Remote Project
```bash
# Link project (first time)
supabase link --project-ref YOUR_PROJECT_REF

# Copy seed file
cp test-output/seed.sql supabase/seed.sql

# Push with seed
supabase db push --include-seed

# Or execute directly
supabase db execute -f test-output/seed.sql
```

## Troubleshooting

### Issue: "seed.sql not found"
**Solution**: Make sure the file is in the `supabase/` directory:
```bash
ls -la supabase/seed.sql
```

### Issue: "Permission denied" or "Connection refused"
**Solution**: 
- For local: Make sure `supabase start` is running
- For remote: Verify you're logged in: `supabase login`
- Check project is linked: `supabase projects list`

### Issue: "supabase_auth container is not ready: unhealthy"
**Solution**: 
This is a known issue on some systems (especially Apple Silicon Macs) where Docker's health check fails due to architecture mismatches. The auth service is actually working correctly. Use:
```bash
# Start with health check bypass
supabase start --ignore-health-check

# Or use the npm script
npm run supabase:start
```
The services will function normally despite the health check warning.

### Issue: "Foreign key constraint violation"
**Solution**: 
- Your seed.sql should have INSERTs in the correct order (workgroups → names → tags → meetingsummaries)
- Check that all referenced IDs exist
- Review `TESTDATA.md` for any warnings

### Issue: "Duplicate key violation"
**Solution**:
- The seed file may contain data that already exists
- Use `TRUNCATE` statements (uncomment them in seed.sql) before inserting:
  ```sql
  TRUNCATE TABLE meetingsummaries CASCADE;
  TRUNCATE TABLE workgroups CASCADE;
  TRUNCATE TABLE names CASCADE;
  TRUNCATE TABLE tags CASCADE;
  ```

### Issue: "Table does not exist"
**Solution**:
- Make sure migrations have been applied first
- Run `supabase db reset` to apply all migrations
- Or manually apply schema: `supabase db push`

## Verification After Loading

After loading seed data, verify it was loaded correctly:

```bash
# Connect to database
supabase db psql

# Or for local
psql postgresql://postgres:postgres@localhost:54322/postgres

# Run verification queries
SELECT COUNT(*) as workgroups FROM workgroups;
SELECT COUNT(*) as meetings FROM meetingsummaries;
SELECT COUNT(*) as names FROM names;
SELECT COUNT(*) as tags FROM tags;

# Check specific data
SELECT * FROM workgroups LIMIT 5;
SELECT name, date FROM meetingsummaries LIMIT 5;
```

## Best Practices

1. **Always test locally first** before pushing to remote
2. **Use transactions** in seed files for data integrity (optional)
3. **Keep seed files version controlled** in your repository
4. **Document seed data** using the generated `TESTDATA.md` and `mapping.json`
5. **Use `--include-seed` flag** when pushing to ensure seed data is included
6. **Backup before loading** if working with production data

## Example Workflow

```bash
# 1. Generate seed data
node scripts/generate-seed-data.js your-meetings.json

# 2. Verify outputs
./verify-outputs.sh test-output

# 3. Start local Supabase (if not running)
supabase start --ignore-health-check
# Or: npm run supabase:start

# 4. Copy seed file
cp test-output/seed.sql supabase/seed.sql

# 5. Reset database (loads seed automatically)
supabase db reset

# 6. Verify data
supabase db psql -c "SELECT COUNT(*) FROM workgroups;"
```

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Seeding Your Database Guide](https://supabase.com/docs/guides/local-development/seeding-your-database)
- [Database Migrations Guide](https://supabase.com/docs/guides/database/migrations)
