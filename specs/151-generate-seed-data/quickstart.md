# Quickstart: Generate Test Seed Data Tool

**Date**: 2025-01-27  
**Purpose**: Quick reference guide for using the seed data generation tool

## Prerequisites

- Node.js 20.3.1+ installed
- Access to a JSON file containing meeting summary data (array format)
- Access to `schema.sql` file (or specify custom path)

## Installation

The tool is a standalone Node.js script. No installation required - just ensure Node.js is available:

```bash
node --version  # Should show 20.3.1 or higher
```

## Basic Usage

### Step 1: Prepare Your JSON File

Ensure your JSON file contains an array of meeting summary objects:

```json
[
  {
    "workgroup": "Ambassador Town Hall",
    "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    "meetingInfo": {
      "name": "Weekly",
      "date": "2025-09-10",
      "host": "Alice",
      "documenter": "Bob",
      "peoplePresent": "Alice, Bob, Carol, Dave",
      ...
    },
    "agendaItems": [...],
    "tags": {...},
    "type": "custom"
  }
]
```

### Step 2: Run the Tool

```bash
# Basic usage (uses ./schema.sql by default)
node scripts/generate-seed-data.js path/to/your-meetings.json

# With custom schema file
node scripts/generate-seed-data.js path/to/your-meetings.json path/to/schema.sql
```

### Step 3: Check Generated Files

The tool generates three files in the same directory as your input JSON:

```
/path/to/your-meetings/
├── your-meetings.json    # Your input file
├── seed.sql             # Generated SQL seed file
├── mapping.json         # Mapping documentation
└── TESTDATA.md         # Usage documentation
```

## Loading Seed Data into Database

### Option 1: Using psql

```bash
# Connect to your database
psql -h localhost -U your_user -d your_database

# Run the seed file
\i /path/to/seed.sql
```

### Option 2: Using Supabase CLI

```bash
# If using Supabase local development
supabase db reset  # Resets database and applies migrations

# Then apply seed file
psql -h localhost -p 54322 -U postgres -d postgres -f /path/to/seed.sql
```

### Option 3: Direct psql Command

```bash
psql -h localhost -U your_user -d your_database -f /path/to/seed.sql
```

## Understanding the Output

### seed.sql

Contains INSERT statements in the correct order:

```sql
-- Optional TRUNCATE statements (commented out)
-- TRUNCATE TABLE meetingsummaries CASCADE;
-- TRUNCATE TABLE workgroups CASCADE;
-- TRUNCATE TABLE names CASCADE;
-- TRUNCATE TABLE tags CASCADE;

-- Workgroups (inserted first - no dependencies)
INSERT INTO workgroups (workgroup_id, workgroup, created_at, user_id, preferred_template)
VALUES ('abc-123-uuid', 'Ambassador Town Hall', '2025-09-10 00:00:00', 'user-uuid', NULL);

-- Names (reference table)
INSERT INTO names (name, user_id, approved, created_at)
VALUES ('Alice', 'user-uuid', true, '2025-09-10 00:00:00');

-- Tags (reference table)
INSERT INTO tags (tag, type, user_id, created_at)
VALUES ('inclusivity', 'topicsCovered', 'user-uuid', '2025-09-10 00:00:00');

-- Meeting summaries (depends on workgroups)
INSERT INTO meetingsummaries (meeting_id, name, date, workgroup_id, user_id, template, summary, confirmed, created_at, updated_at)
VALUES ('meeting-uuid', 'Weekly', '2025-09-10 00:00:00', 'abc-123-uuid', 'user-uuid', 'custom', '{"workgroup": "...", ...}', false, '2025-09-10 00:00:00', '2025-09-10 00:00:00');
```

### mapping.json

Documents how JSON fields map to database columns:

```json
{
  "version": "1.0",
  "mappings": [
    {
      "jsonPath": "workgroup",
      "table": "workgroups",
      "column": "workgroup",
      "transformation": "direct"
    }
  ],
  "statistics": {
    "totalRecords": 127,
    "workgroups": 5,
    "meetings": 127
  }
}
```

### TESTDATA.md

Contains:
- Usage instructions
- Data summary (what was generated)
- Error/warning summary
- Limitations and assumptions

## Common Issues and Solutions

### Issue: "JSON file not found"

**Solution**: Check that the file path is correct and the file exists:

```bash
ls -la path/to/your-meetings.json  # Verify file exists
```

### Issue: "Schema file not found"

**Solution**: Either provide the schema file path or ensure `./schema.sql` exists:

```bash
# Option 1: Specify schema file
node scripts/generate-seed-data.js input.json /path/to/schema.sql

# Option 2: Ensure schema.sql is in current directory
ls -la schema.sql  # Verify file exists
```

### Issue: "Invalid JSON"

**Solution**: Validate your JSON file:

```bash
# Check JSON syntax
cat your-file.json | jq .  # Should parse without errors
```

### Issue: Foreign Key Constraint Violations

**Solution**: The tool should handle this automatically by ordering INSERTs correctly. If you see errors:

1. Check `TESTDATA.md` for error details
2. Verify that workgroups are inserted before meetings
3. Check that all referenced workgroup_ids exist

### Issue: Duplicate Key Violations

**Solution**: The tool skips duplicates automatically. Check `TESTDATA.md` for warnings about skipped duplicates.

## Advanced Usage

### Regenerating Seed Data

If your source JSON changes, simply run the tool again:

```bash
node scripts/generate-seed-data.js updated-meetings.json
```

The tool will overwrite existing `seed.sql`, `mapping.json`, and `TESTDATA.md` files.

### Custom Schema File

If your schema is in a different location:

```bash
node scripts/generate-seed-data.js input.json /custom/path/to/schema.sql
```

### Processing Large Files

The tool should handle 127+ meeting summaries efficiently. For very large files (1000+ records), processing may take longer. Check `TESTDATA.md` for processing statistics.

## Next Steps

1. **Review Generated Files**: Check `seed.sql`, `mapping.json`, and `TESTDATA.md`
2. **Test in Development**: Load seed data into a development database first
3. **Verify Data**: Query the database to ensure data looks correct
4. **Check Warnings**: Review `TESTDATA.md` for any warnings or errors

## Getting Help

- Check `TESTDATA.md` for detailed error/warning information
- Review `mapping.json` to understand how JSON fields map to database columns
- See `data-model.md` for detailed data transformation rules
- See `contracts/cli-interface.md` for complete CLI specification

## Example Workflow

```bash
# 1. Prepare your JSON file
cat > meetings.json << EOF
[
  {
    "workgroup": "My Workgroup",
    "workgroup_id": "123e4567-e89b-12d3-a456-426614174000",
    "meetingInfo": {
      "name": "Weekly Standup",
      "date": "2025-01-27",
      "host": "Alice",
      "peoplePresent": "Alice, Bob"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF

# 2. Generate seed data
node scripts/generate-seed-data.js meetings.json

# 3. Review generated files
cat seed.sql
cat mapping.json
cat TESTDATA.md

# 4. Load into database
psql -h localhost -U postgres -d mydb -f seed.sql

# 5. Verify data
psql -h localhost -U postgres -d mydb -c "SELECT * FROM workgroups;"
psql -h localhost -U postgres -d mydb -c "SELECT * FROM meetingsummaries;"
```
