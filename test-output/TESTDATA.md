# Test Data Usage Guide

**Generated**: 2025-12-11T08:32:38.054Z
**Source File**: test-meetings.json

## Usage Instructions

### Option 1: Using psql

```bash
psql -h localhost -U your_user -d your_database -f /Users/stephen/Documents/GitHub/archive-oracle/test-output/seed.sql
```

### Option 2: Using Supabase CLI

```bash
# If using Supabase local development
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres -f /Users/stephen/Documents/GitHub/archive-oracle/test-output/seed.sql
```

## Data Summary

- **Total Records Processed**: 2
- **Workgroups**: 2
- **Meetings**: 2
- **Names**: 5
- **Tags**: 5

## Limitations and Assumptions

- UUIDs are generated deterministically using SHA-256 hashing
- Dates are parsed from ISO format (YYYY-MM-DD)
- Duplicate records are skipped with warnings
- Foreign key constraints are satisfied by INSERT ordering

## Error and Warning Summary

- **Total Errors**: 0
- **Total Warnings**: 2

### Warnings

- Circular dependency detected involving table: docs_page
- Circular dependency detected involving table: nods_page

## Regeneration Instructions

To regenerate seed data:

```bash
node scripts/generate-seed-data.js test-meetings.json
```

## Common Issues and Solutions

### Foreign Key Constraint Violations
The tool automatically orders INSERTs to satisfy foreign keys. If you see errors:
1. Check TESTDATA.md for error details
2. Verify that workgroups are inserted before meetings
3. Check that all referenced workgroup_ids exist

### Duplicate Key Violations
The tool skips duplicates automatically. Check TESTDATA.md for warnings about skipped duplicates.

