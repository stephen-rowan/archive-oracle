# CLI Interface Contract: generate-seed-data

**Version**: 1.0  
**Date**: 2025-01-27  
**Type**: Command-Line Interface Specification

## Overview

The `generate-seed-data` tool is a Node.js CLI utility that transforms JSON meeting summary data into PostgreSQL seed SQL files.

## Command Syntax

```bash
node scripts/generate-seed-data.js <json-input-file> [schema-file]
```

### Arguments

1. **`<json-input-file>`** (required)
   - Path to JSON file containing array of meeting summary objects
   - Format: `[{...}, {...}]`
   - Must be valid JSON, readable file

2. **`[schema-file]`** (optional)
   - Path to PostgreSQL schema SQL file
   - Default: `./schema.sql` (relative to current working directory)
   - Must contain valid PostgreSQL CREATE TABLE statements

### Exit Codes

- `0`: Success - all files generated successfully
- `1`: Fatal error - invalid arguments, file not found, or JSON parsing failure
- `2`: Partial success - files generated but with errors/warnings (non-fatal)

## Input/Output Specification

### Input Files

1. **JSON Input File** (`<json-input-file>`)
   - **Format**: JSON array of meeting summary objects
   - **Structure**: See `data-model.md` for detailed structure
   - **Example**: `[{workgroup: "...", meetingInfo: {...}, agendaItems: [...], ...}]`
   - **Validation**: Must be valid JSON, must be array, must contain objects

2. **Schema SQL File** (`[schema-file]` or `./schema.sql`)
   - **Format**: PostgreSQL SQL file with CREATE TABLE statements
   - **Required Elements**: Table definitions, column definitions, constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL)
   - **Validation**: Must be readable file, must contain CREATE TABLE statements

### Output Files

All output files are written to the same directory as the input JSON file.

1. **`seed.sql`**
   - **Format**: PostgreSQL SQL file
   - **Contents**:
     - Optional TRUNCATE statements (commented out by default)
     - INSERT statements in dependency order (workgroups → names → tags → meetingsummaries)
     - All statements separated by newlines
   - **Encoding**: UTF-8
   - **Line Endings**: Platform-appropriate (LF on Unix, CRLF on Windows)

2. **`mapping.json`**
   - **Format**: JSON file
   - **Structure**:
     ```json
     {
       "version": "1.0",
       "generatedAt": "2025-01-27T12:00:00Z",
       "inputFile": "path/to/input.json",
       "schemaFile": "path/to/schema.sql",
       "mappings": [
         {
           "jsonPath": "workgroup",
           "table": "workgroups",
           "column": "workgroup",
           "transformation": "direct",
           "synthetic": false
         },
         {
           "jsonPath": "workgroup_id",
           "table": "workgroups",
           "column": "workgroup_id",
           "transformation": "deterministic-uuid",
           "synthetic": false,
           "context": "workgroup name"
         }
       ],
       "syntheticFields": [
         {
           "table": "workgroups",
           "column": "created_at",
           "generation": "timestamp",
           "source": "meeting date"
         }
       ],
       "statistics": {
         "totalRecords": 127,
         "workgroups": 5,
         "meetings": 127,
         "names": 45,
         "tags": 23,
         "errors": 0,
         "warnings": 2
       }
     }
     ```
   - **Encoding**: UTF-8

3. **`TESTDATA.md`**
   - **Format**: Markdown file
   - **Contents**:
     - Usage instructions
     - Data summary (what was generated)
     - Limitations and assumptions
     - Error/warning summary
     - Regeneration instructions
   - **Encoding**: UTF-8

## Behavior Specification

### Processing Flow

1. **Argument Validation**
   - Check that JSON input file path is provided
   - Check that JSON input file exists and is readable
   - Check that schema file exists (if provided) or `./schema.sql` exists (if not provided)
   - Exit with code 1 if validation fails

2. **JSON Parsing**
   - Read and parse JSON input file
   - Validate that root element is an array
   - Validate that array contains objects
   - Exit with code 1 if parsing fails

3. **Schema Parsing**
   - Read schema SQL file
   - Extract CREATE TABLE statements using regex patterns
   - Extract table names, columns, constraints, foreign keys
   - Build dependency graph from foreign keys
   - Exit with code 1 if schema parsing fails critically

4. **Data Transformation**
   - For each meeting summary in JSON array:
     - Extract workgroup data → workgroups table
     - Extract names from peoplePresent → names table
     - Extract tags → tags table
     - Extract meeting data → meetingsummaries table
   - Generate deterministic UUIDs for required fields
   - Validate data types and constraints
   - Collect errors and warnings

5. **Dependency Resolution**
   - Build dependency graph from foreign keys
   - Perform topological sort to determine INSERT order
   - Validate no circular dependencies

6. **SQL Generation**
   - Generate INSERT statements in dependency order
   - Format SQL with proper escaping and quoting
   - Include TRUNCATE statements (commented out)

7. **Documentation Generation**
   - Generate `mapping.json` with transformation documentation
   - Generate `TESTDATA.md` with usage instructions and summary

8. **File Writing**
   - Write `seed.sql` to output directory
   - Write `mapping.json` to output directory
   - Write `TESTDATA.md` to output directory
   - Exit with code 0 (success) or 2 (partial success with warnings)

### Error Handling

1. **Fatal Errors** (exit code 1):
   - Invalid arguments (missing JSON file path)
   - JSON input file not found or not readable
   - JSON parsing failure (invalid JSON syntax)
   - Schema file not found or not readable
   - Critical schema parsing failure (no tables extracted)

2. **Non-Fatal Errors** (exit code 2, continue processing):
   - Invalid UUID format (generate deterministic UUID)
   - Invalid date format (skip record, log warning)
   - Missing required field (skip record, log warning)
   - Duplicate unique constraint (skip duplicate, log warning)
   - Broken foreign key reference (skip record, log warning)

3. **Warnings** (exit code 2, continue processing):
   - Unknown JSON fields (log warning, ignore)
   - Empty arrays (skip, log warning)
   - Null values in nested structures (handle per schema constraints)

### Logging

- **Errors**: Output to `stderr` using `console.error()`
- **Warnings**: Output to `stderr` using `console.warn()`
- **Info**: Output to `stdout` using `console.log()` (optional, for progress)

**Log Format**:
```
ERROR: [record-id] Invalid date format: "invalid-date" (skipping record)
WARN: [record-id] Duplicate workgroup_id: "abc-123" (using first occurrence)
```

## Example Usage

### Basic Usage

```bash
# Generate seed data from input.json, using default schema.sql
node scripts/generate-seed-data.js input.json

# Generate seed data with custom schema file
node scripts/generate-seed-data.js input.json /path/to/custom-schema.sql
```

### Expected Output

```
Processing 127 meeting summaries...
Extracted 5 workgroups
Extracted 45 unique names
Extracted 23 unique tags
Generated 127 meeting summaries
Writing seed.sql...
Writing mapping.json...
Writing TESTDATA.md...
Done! Generated files in /path/to/input/directory/
Warnings: 2 (see TESTDATA.md for details)
```

### Generated Files

```
/path/to/input/directory/
├── input.json           # Original input
├── seed.sql            # Generated SQL seed file
├── mapping.json        # Mapping documentation
└── TESTDATA.md         # Usage documentation
```

## Validation Rules

### Input Validation

1. JSON file must exist and be readable
2. JSON file must contain valid JSON
3. JSON root must be an array
4. Array must contain objects (not primitives)
5. Schema file must exist and be readable
6. Schema file must contain CREATE TABLE statements

### Output Validation

1. `seed.sql` must be valid SQL (syntax check)
2. `seed.sql` INSERT statements must be in dependency order
3. `mapping.json` must be valid JSON
4. `TESTDATA.md` must be valid Markdown
5. All foreign key references must point to existing rows
6. All unique constraints must be satisfied (no duplicates)

## Performance Requirements

- Process 127+ meeting summaries in under 5 minutes (SC-001)
- Memory usage should be reasonable (stream processing if needed for very large files)
- No external network calls or database connections required

## Compatibility

- **Node.js**: 20.3.1+ (or compatible versions)
- **Platform**: macOS, Linux, Windows
- **PostgreSQL**: Compatible with Supabase (PostgreSQL 12+)
- **File System**: Standard file system (no special permissions required)
