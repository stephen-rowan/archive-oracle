# Testing Guide: generate-seed-data.js

This guide explains how to test the `generate-seed-data.js` script.

## Quick Start

### 1. Create a Test JSON File

The script expects a JSON **array** of meeting summary objects. Create a test file:

```bash
cat > test-meetings.json << 'EOF'
[
  {
    "workgroup": "Test Workgroup",
    "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    "meetingInfo": {
      "name": "Test Meeting",
      "date": "2025-01-27",
      "host": "Alice",
      "documenter": "Bob",
      "peoplePresent": "Alice, Bob, Carol"
    },
    "agendaItems": [],
    "tags": {
      "topicsCovered": "testing, development",
      "emotions": "focused"
    },
    "type": "custom"
  },
  {
    "workgroup": "Another Workgroup",
    "meetingInfo": {
      "name": "Second Meeting",
      "date": "2025-01-28",
      "peoplePresent": "Dave, Eve"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF
```

**Note**: You can also convert the existing example file to an array:
```bash
# Convert single object to array
echo '[' > test-meetings.json
cat types/summaryFormData.example.json >> test-meetings.json
echo ']' >> test-meetings.json
```

### 2. Run the Script

```bash
# Using default schema.sql
node scripts/generate-seed-data.js test-meetings.json

# Or specify a custom schema file
node scripts/generate-seed-data.js test-meetings.json schema.sql
```

### 3. Verify Output Files

The script generates three files in the same directory as your input JSON:

```bash
# Check that files were created
ls -la test-meetings.json seed.sql mapping.json TESTDATA.md

# View the generated SQL
cat seed.sql

# View the mapping documentation
cat mapping.json | jq .

# View the usage guide
cat TESTDATA.md
```

## Test Cases

### Test Case 1: Basic Functionality

**Purpose**: Verify the script works with valid input.

```bash
# Create minimal valid input
cat > test-basic.json << 'EOF'
[
  {
    "workgroup": "Basic Test",
    "meetingInfo": {
      "name": "Basic Meeting",
      "date": "2025-01-27",
      "peoplePresent": "Alice"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF

# Run script
node scripts/generate-seed-data.js test-basic.json

# Verify exit code (should be 0 for success)
echo "Exit code: $?"

# Check outputs exist
test -f seed.sql && echo "✓ seed.sql created" || echo "✗ seed.sql missing"
test -f mapping.json && echo "✓ mapping.json created" || echo "✗ mapping.json missing"
test -f TESTDATA.md && echo "✓ TESTDATA.md created" || echo "✗ TESTDATA.md missing"
```

### Test Case 2: Multiple Records

**Purpose**: Test deduplication and multiple workgroups.

```bash
cat > test-multiple.json << 'EOF'
[
  {
    "workgroup": "Workgroup A",
    "meetingInfo": {
      "name": "Meeting 1",
      "date": "2025-01-27",
      "peoplePresent": "Alice, Bob"
    },
    "agendaItems": [],
    "tags": {"topicsCovered": "topic1"},
    "type": "custom"
  },
  {
    "workgroup": "Workgroup A",
    "meetingInfo": {
      "name": "Meeting 2",
      "date": "2025-01-28",
      "peoplePresent": "Alice, Bob, Carol"
    },
    "agendaItems": [],
    "tags": {"topicsCovered": "topic2"},
    "type": "custom"
  },
  {
    "workgroup": "Workgroup B",
    "meetingInfo": {
      "name": "Meeting 3",
      "date": "2025-01-29",
      "peoplePresent": "Dave, Eve"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF

node scripts/generate-seed-data.js test-multiple.json

# Verify workgroups are deduplicated (should see 2 workgroups, not 3)
grep -c "INSERT INTO workgroups" seed.sql
```

### Test Case 3: Error Handling - Missing Required Fields

**Purpose**: Test that missing required fields are handled gracefully.

```bash
cat > test-missing-fields.json << 'EOF'
[
  {
    "workgroup": "Test",
    "meetingInfo": {
      "name": "Missing Date"
      // Missing date field
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  },
  {
    // Missing workgroup
    "meetingInfo": {
      "name": "Missing Workgroup",
      "date": "2025-01-27"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF

node scripts/generate-seed-data.js test-missing-fields.json

# Should exit with code 2 (warnings/errors but not fatal)
echo "Exit code: $?"

# Check TESTDATA.md for error details
grep -i "error" TESTDATA.md
```

### Test Case 4: Invalid Date Format

**Purpose**: Test date parsing error handling.

```bash
cat > test-invalid-date.json << 'EOF'
[
  {
    "workgroup": "Test",
    "meetingInfo": {
      "name": "Invalid Date",
      "date": "not-a-date",
      "peoplePresent": "Alice"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF

node scripts/generate-seed-data.js test-invalid-date.json

# Should show warning/error about invalid date
# Exit code should be 2 (non-fatal error)
```

### Test Case 5: Empty Array Input

**Purpose**: Test edge case of empty input.

```bash
echo '[]' > test-empty.json

node scripts/generate-seed-data.js test-empty.json

# Should generate files but with warnings
# Check TESTDATA.md for warning about empty array
```

### Test Case 6: Invalid JSON

**Purpose**: Test JSON parsing error handling.

```bash
echo '{invalid json}' > test-invalid.json

node scripts/generate-seed-data.js test-invalid.json

# Should exit with code 1 (fatal error)
echo "Exit code: $?"
```

### Test Case 7: Missing Schema File

**Purpose**: Test schema file validation.

```bash
node scripts/generate-seed-data.js test-basic.json /nonexistent/schema.sql

# Should exit with code 1 (fatal error)
echo "Exit code: $?"
```

### Test Case 8: Tags Extraction

**Purpose**: Verify tags are extracted correctly from different tag types.

```bash
cat > test-tags.json << 'EOF'
[
  {
    "workgroup": "Test",
    "meetingInfo": {
      "name": "Tag Test",
      "date": "2025-01-27",
      "peoplePresent": "Alice"
    },
    "agendaItems": [],
    "tags": {
      "topicsCovered": "topic1, topic2",
      "emotions": "happy, excited",
      "gamesPlayed": "Chess, Checkers",
      "other": "special event"
    },
    "type": "custom"
  }
]
EOF

node scripts/generate-seed-data.js test-tags.json

# Verify tags in SQL output
grep -c "INSERT INTO tags" seed.sql
```

### Test Case 9: Names Extraction

**Purpose**: Verify names are extracted and deduplicated.

```bash
cat > test-names.json << 'EOF'
[
  {
    "workgroup": "Test",
    "meetingInfo": {
      "name": "Names Test",
      "date": "2025-01-27",
      "peoplePresent": "Alice, Bob, Carol"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  },
  {
    "workgroup": "Test",
    "meetingInfo": {
      "name": "Names Test 2",
      "date": "2025-01-28",
      "peoplePresent": "Alice, Bob"  // Alice and Bob should be deduplicated
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
EOF

node scripts/generate-seed-data.js test-names.json

# Should have 3 unique names (Alice, Bob, Carol), not 5
grep -c "INSERT INTO names" seed.sql
```

## Validation Tests

### Validate Generated SQL Syntax

```bash
# Check SQL syntax (if you have psql available)
psql --version 2>/dev/null && psql -c "\i seed.sql" --dry-run 2>&1 || echo "psql not available for syntax check"

# Or use a SQL linter if available
```

### Validate JSON Outputs

```bash
# Validate mapping.json is valid JSON
cat mapping.json | jq . > /dev/null && echo "✓ mapping.json is valid JSON" || echo "✗ mapping.json is invalid JSON"

# Check mapping.json structure
cat mapping.json | jq '.mappings | length'
cat mapping.json | jq '.statistics'
```

### Validate SQL INSERT Order

The script should order INSERTs to satisfy foreign key constraints:

```bash
# Check that workgroups come before meetingsummaries
awk '/INSERT INTO workgroups/,/INSERT INTO meetingsummaries/' seed.sql | head -20

# Verify order: workgroups → names → tags → meetingsummaries
grep -n "INSERT INTO" seed.sql
```

## Automated Test Script

Create a comprehensive test runner:

```bash
cat > test-script.sh << 'EOF'
#!/bin/bash
set -e

echo "🧪 Testing generate-seed-data.js"
echo "================================"

# Test 1: Basic functionality
echo ""
echo "Test 1: Basic functionality"
cat > test-basic.json << 'INNER'
[
  {
    "workgroup": "Test",
    "meetingInfo": {
      "name": "Test Meeting",
      "date": "2025-01-27",
      "peoplePresent": "Alice"
    },
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
INNER

node scripts/generate-seed-data.js test-basic.json
if [ $? -eq 0 ]; then
  echo "✓ Test 1 passed"
else
  echo "✗ Test 1 failed"
  exit 1
fi

# Test 2: Multiple records
echo ""
echo "Test 2: Multiple records"
cat > test-multiple.json << 'INNER'
[
  {
    "workgroup": "A",
    "meetingInfo": {"name": "M1", "date": "2025-01-27", "peoplePresent": "Alice"},
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  },
  {
    "workgroup": "B",
    "meetingInfo": {"name": "M2", "date": "2025-01-28", "peoplePresent": "Bob"},
    "agendaItems": [],
    "tags": {},
    "type": "custom"
  }
]
INNER

node scripts/generate-seed-data.js test-multiple.json
if [ $? -eq 0 ] || [ $? -eq 2 ]; then
  echo "✓ Test 2 passed"
else
  echo "✗ Test 2 failed"
  exit 1
fi

# Test 3: Error handling
echo ""
echo "Test 3: Error handling (invalid JSON)"
echo 'invalid json' > test-invalid.json
node scripts/generate-seed-data.js test-invalid.json 2>&1 | grep -q "ERROR" && echo "✓ Test 3 passed" || echo "✗ Test 3 failed"

# Cleanup
rm -f test-*.json seed.sql mapping.json TESTDATA.md

echo ""
echo "✅ All tests completed!"
EOF

chmod +x test-script.sh
./test-script.sh
```

## Manual Verification Checklist

After running the script, verify:

- [ ] `seed.sql` file exists and contains INSERT statements
- [ ] `mapping.json` exists and is valid JSON
- [ ] `TESTDATA.md` exists and contains usage instructions
- [ ] SQL INSERTs are ordered correctly (workgroups → names → tags → meetingsummaries)
- [ ] No duplicate workgroups in SQL (check workgroup_id values)
- [ ] No duplicate names in SQL (check name values)
- [ ] All UUIDs are valid format (8-4-4-4-12 hex pattern)
- [ ] All dates are in correct format (YYYY-MM-DD HH:MM:SS)
- [ ] Foreign key references are valid (workgroup_id in meetingsummaries exists in workgroups)
- [ ] Exit code is appropriate (0 = success, 1 = fatal error, 2 = warnings)

## Testing with Database

If you want to test loading the generated SQL into a database:

```bash
# Using Supabase local development
supabase start
psql -h localhost -p 54322 -U postgres -d postgres -f seed.sql

# Verify data was inserted
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM workgroups;"
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM meetingsummaries;"
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM names;"
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM tags;"
```

## Troubleshooting

### Script exits with code 1
- Check that JSON file exists and is valid
- Check that schema.sql exists (or provide path)
- Check console output for specific error messages

### Script exits with code 2
- Check TESTDATA.md for warnings/errors
- Some records may have been skipped due to validation issues
- Generated files should still be usable

### Generated SQL has syntax errors
- Check that schema.sql contains valid CREATE TABLE statements
- Verify foreign key relationships are correct
- Check TESTDATA.md for constraint violations

### Missing data in output
- Check TESTDATA.md for skipped records
- Verify input JSON has all required fields
- Check console output for warnings about missing fields

## Next Steps

1. Review the generated `TESTDATA.md` for detailed information
2. Check `mapping.json` to understand field transformations
3. Load `seed.sql` into a test database to verify data integrity
4. Test edge cases specific to your use case
