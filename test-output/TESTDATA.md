# Test Data Usage Guide

**Generated**: 2025-12-11T08:35:51.701Z
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

#### Understanding Circular Dependency Warnings

These warnings occur because some tables have **self-referencing foreign keys**:
- `docs_page.parent_page_id` → `docs_page.id`
- `nods_page.parent_page_id` → `nods_page.id`

**Are these warnings a problem?**

- **No, if you're not inserting data into these tables**: The warnings are informational and don't affect execution. If your seed data doesn't include rows for these tables, they can be safely ignored.
- **Yes, if you need to insert hierarchical data**: Self-referencing tables require special handling for INSERT ordering.

**How to resolve if inserting hierarchical data:**

If you need to insert data into tables with parent-child relationships:

1. **Insert root nodes first**: Rows with `parent_page_id = NULL`
2. **Then insert child nodes**: Rows that reference those root nodes
3. **Continue level by level**: Insert each level of the hierarchy sequentially

The current topological sort algorithm detects these cycles but doesn't automatically handle hierarchical ordering. For hierarchical data, you may need to:
- Manually order INSERTs for these tables in your seed data
- Insert rows with NULL foreign keys first, then rows that reference them
- Or enhance the script to detect self-referencing tables and handle them specially

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

### Circular Dependency Warnings
If you see warnings about circular dependencies (e.g., `docs_page`, `nods_page`):
- These are **informational only** if no data is inserted into those tables
- They occur because these tables have self-referencing foreign keys (parent-child relationships)
- The script still works correctly - it just can't automatically determine optimal INSERT order for hierarchical data
- If inserting hierarchical data, manually order INSERTs: root nodes (NULL parent) first, then children

