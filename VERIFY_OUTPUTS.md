# How to Verify generate-seed-data.js Outputs

After running the `generate-seed-data.js` script, you'll want to verify that the outputs are correct. This guide provides both automated and manual verification methods.

## Quick Verification (Automated)

Use the provided verification script:

```bash
# If outputs are in test-output directory (default)
./verify-outputs.sh test-output

# Or specify a different directory
./verify-outputs.sh /path/to/output/directory
```

The script checks:
- ✅ All three output files exist (`seed.sql`, `mapping.json`, `TESTDATA.md`)
- ✅ File sizes and line counts
- ✅ JSON syntax validity
- ✅ SQL INSERT statement presence and ordering
- ✅ Statistics consistency across files
- ✅ Error/warning counts

## Manual Verification

### 1. Check Output Files Exist

The script generates three files in the same directory as your input JSON:

```bash
# List the output files
ls -lh test-output/
# Should show:
# - seed.sql
# - mapping.json  
# - TESTDATA.md
```

### 2. Verify seed.sql

**Check file exists and has content:**
```bash
wc -l test-output/seed.sql
# Should show multiple lines (at least 10+)
```

**Check INSERT statements:**
```bash
grep -c "INSERT INTO" test-output/seed.sql
# Should match the number of records you expect
```

**Verify INSERT order (workgroups before meetingsummaries):**
```bash
# First workgroup INSERT should come before first meeting INSERT
grep -n "INSERT INTO" test-output/seed.sql | head -5
```

**Preview SQL content:**
```bash
head -20 test-output/seed.sql
```

### 3. Verify mapping.json

**Check JSON is valid:**
```bash
# If you have jq installed
jq empty test-output/mapping.json && echo "Valid JSON"

# Or use Python
python3 -m json.tool test-output/mapping.json > /dev/null && echo "Valid JSON"
```

**View statistics:**
```bash
jq '.statistics' test-output/mapping.json
```

**View mappings:**
```bash
jq '.mappings[] | "\(.jsonPath) → \(.table).\(.column)"' test-output/mapping.json
```

**Check for errors/warnings:**
```bash
jq '.statistics.errors, .statistics.warnings' test-output/mapping.json
```

### 4. Verify TESTDATA.md

**Check key sections exist:**
```bash
grep -E "Data Summary|Error and Warning Summary|Usage Instructions" test-output/TESTDATA.md
```

**View statistics:**
```bash
grep -A 5 "Data Summary" test-output/TESTDATA.md
```

**Check error/warning counts:**
```bash
grep -E "Total Errors|Total Warnings" test-output/TESTDATA.md
```

**Read the full file:**
```bash
cat test-output/TESTDATA.md
```

### 5. Cross-File Validation

**Verify statistics match between files:**

```bash
# Extract statistics from mapping.json
jq '.statistics | {workgroups, meetings, names, tags}' test-output/mapping.json

# Extract from TESTDATA.md (manual check)
grep -E "Workgroups|Meetings|Names|Tags" test-output/TESTDATA.md
```

**Verify INSERT counts match statistics:**

```bash
# Count INSERTs in seed.sql
echo "Workgroups: $(grep -c 'INSERT INTO workgroups' test-output/seed.sql)"
echo "Meetings: $(grep -c 'INSERT INTO meetingsummaries' test-output/seed.sql)"
echo "Names: $(grep -c 'INSERT INTO names' test-output/seed.sql)"
echo "Tags: $(grep -c 'INSERT INTO tags' test-output/seed.sql)"

# Compare with mapping.json statistics
jq '.statistics | {workgroups, meetings, names, tags}' test-output/mapping.json
```

## Expected Output Structure

### seed.sql
- Header comments explaining TRUNCATE statements
- INSERT statements in dependency order:
  1. `workgroups` (no dependencies)
  2. `names` (no dependencies)
  3. `tags` (no dependencies)
  4. `meetingsummaries` (depends on `workgroups`)

### mapping.json
- `version`: "1.0"
- `generatedAt`: ISO timestamp
- `inputFile`: path to input JSON
- `schemaFile`: path to schema SQL
- `mappings`: array of field mappings
- `syntheticFields`: array of generated fields
- `statistics`: counts of records, errors, warnings

### TESTDATA.md
- Usage instructions (psql, Supabase CLI)
- Data summary statistics
- Error and warning details
- Regeneration instructions
- Common issues and solutions

## Common Issues

### Issue: Files not generated
**Check:**
- Script ran without fatal errors (exit code 0 or 2)
- Input JSON file path was correct
- Schema file exists and is readable
- Output directory is writable

### Issue: Statistics don't match
**Check:**
- Input JSON had the expected number of records
- No records were skipped due to errors
- Check `mapping.json` for error details

### Issue: SQL syntax errors
**Check:**
- String escaping (single quotes should be doubled: `''`)
- UUID format (should match PostgreSQL UUID format)
- Date format (should be `YYYY-MM-DD HH:MM:SS`)

### Issue: Circular dependency warnings
**Note:** These warnings are informational if you're not inserting data into `docs_page` or `nods_page` tables. They occur because these tables have self-referencing foreign keys. See `TESTDATA.md` for details.

## Next Steps After Verification

1. **Review TESTDATA.md** for usage instructions
2. **Check mapping.json** to understand data transformations
3. **Test seed.sql** in a development database:
   ```bash
   psql -h localhost -U your_user -d your_database -f test-output/seed.sql
   ```
4. **Verify data in database** after loading:
   ```sql
   SELECT COUNT(*) FROM workgroups;
   SELECT COUNT(*) FROM meetingsummaries;
   SELECT COUNT(*) FROM names;
   SELECT COUNT(*) FROM tags;
   ```

## Troubleshooting

If verification fails:

1. **Check script exit code:**
   ```bash
   echo $?  # Should be 0 (success) or 2 (warnings)
   ```

2. **Review console output** from the script run for errors/warnings

3. **Check TESTDATA.md** for detailed error/warning information

4. **Validate input JSON:**
   ```bash
   jq empty your-input.json && echo "Valid JSON"
   ```

5. **Check schema file:**
   ```bash
   grep -c "CREATE TABLE" schema.sql
   ```
