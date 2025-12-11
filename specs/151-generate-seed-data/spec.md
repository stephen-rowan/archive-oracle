# Feature Specification: Generate Test Seed Data From JSON and Map to schema.sql

**Feature Branch**: `151-generate-seed-data`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Generate Test Seed Data From JSON and Map to schema.sql"

## Clarifications

### Session 2025-01-27

- Q: When the tool encounters invalid or malformed data (invalid dates, missing required fields, constraint violations), what should happen? → A: Log errors and continue — skip invalid records, generate partial output with warnings
- Q: When the JSON contains duplicate workgroup IDs or meeting identifiers (same workgroup_id or same meeting name/date/workgroup combination appearing multiple times), how should the system handle them? → A: Use first occurrence — process first occurrence, skip subsequent duplicates with warning
- Q: For required database fields with no corresponding JSON data, how should synthetic values be generated? → A: Deterministic based on context — derive values from JSON context (e.g., hash workgroup name for workgroup_id, use meeting date for timestamps)
- Q: Where should the generated files (seed.sql, mapping.json, TESTDATA.md) be written, and what should the tool's interface look like? → A: Same directory as JSON input — write files next to the input JSON file
- Q: What is the expected structure of the input JSON file? → A: Array of objects — single JSON file containing array of meeting summary objects `[{...}, {...}]`
- Q: How does the system handle very large JSON files (e.g., thousands of meeting summaries)? → A: Hybrid approach with threshold — stream/process incrementally if file exceeds 1000 meeting summaries, otherwise load into memory

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate SQL Seed File from JSON Data (Priority: P1)

A developer needs to populate their local database with realistic test data derived from production meeting summaries. They provide a JSON file containing meeting summary data and a SQL schema file, and receive a complete `seed.sql` file that can be executed to populate their local database with properly structured test data.

**Why this priority**: This is the core value proposition - enabling developers to quickly set up local test environments with realistic data without manual data entry or complex transformation scripts.

**Independent Test**: Can be fully tested by running the tool with valid JSON and schema inputs, verifying that the generated `seed.sql` file executes successfully against a fresh database and produces the expected data structure.

**Acceptance Scenarios**:

1. **Given** a valid JSON file with meeting summaries and a valid `schema.sql` file, **When** the tool processes both files, **Then** it generates a `seed.sql` file containing INSERT statements for all relevant tables
2. **Given** the generated `seed.sql` file, **When** it is executed against a fresh database with the schema applied, **Then** all INSERT statements succeed without constraint violations
3. **Given** JSON data containing nested structures (agendaItems, decisionItems, actionItems), **When** the tool processes the data, **Then** it creates parent records first, then child records with proper foreign key relationships
4. **Given** JSON data with comma-separated lists (e.g., peoplePresent), **When** the tool processes the data, **Then** it normalizes the data into appropriate table structures (e.g., individual person records and join table entries)

---

### User Story 2 - Document JSON to SQL Mapping (Priority: P2)

A developer needs to understand how JSON fields map to database tables and columns to verify correctness, troubleshoot issues, or extend the mapping logic. They receive a `mapping.json` file that clearly documents the transformation rules.

**Why this priority**: Understanding the mapping is essential for debugging, validation, and future maintenance. Without clear documentation, developers cannot verify correctness or extend the tool.

**Independent Test**: Can be fully tested by verifying that the `mapping.json` file accurately reflects all transformations performed, with clear documentation of source JSON paths and target SQL table/column mappings.

**Acceptance Scenarios**:

1. **Given** JSON data is processed, **When** the mapping documentation is generated, **Then** it contains entries for every JSON field that maps to a database column
2. **Given** the mapping documentation, **When** a developer reviews it, **Then** they can trace any JSON field to its corresponding database table and column
3. **Given** synthetic values are generated for missing JSON fields, **When** the mapping documentation is generated, **Then** it clearly indicates which fields were synthesized and why

---

### User Story 3 - Provide Developer Usage Documentation (Priority: P2)

A developer needs clear instructions on how to use the generated seed data files with their local Supabase or Postgres database. They receive a `TESTDATA.md` file with step-by-step instructions and explanations.

**Why this priority**: Even perfect seed data is useless if developers don't know how to apply it. Clear documentation reduces setup time and support requests.

**Independent Test**: Can be fully tested by verifying that a developer following the documentation can successfully load seed data into their local database without errors.

**Acceptance Scenarios**:

1. **Given** the `TESTDATA.md` documentation, **When** a developer follows the instructions, **Then** they can successfully load seed data into their local database
2. **Given** the documentation, **When** a developer reads it, **Then** they understand what data was generated, what assumptions were made, and how to regenerate if the source JSON changes
3. **Given** the documentation includes usage steps, **When** a developer follows them, **Then** they can execute the seed file using either `psql` or Supabase CLI commands

---

### Edge Cases

- **Invalid or malformed data**: When JSON contains invalid dates, missing required fields, or constraint violations, the system logs errors with details (record identifier, field, issue description) and continues processing, skipping the invalid record. Generated output includes a summary of skipped records and warnings in both console output and documentation.
- **Duplicate identifiers**: When JSON contains duplicate workgroup IDs or meeting identifiers (same workgroup_id or same meeting name/date/workgroup combination), the system processes the first occurrence and skips subsequent duplicates with a warning logged. This ensures referential integrity while allowing partial processing.
- **Unknown JSON fields**: When JSON contains fields that don't exist in the schema, the system logs warnings but continues processing, ignoring unmapped fields.
- **Empty arrays or null values**: Empty arrays are skipped (no rows created). Null values in nested structures are handled according to schema constraints (NOT NULL fields require synthetic values or cause record skip with logging).
- **Missing required fields without defaults**: When required database fields have no corresponding JSON data and no reasonable default exists, the system logs an error, skips the record, and continues processing.
- **Very large JSON files**: When JSON file contains more than 1000 meeting summaries, the system uses stream/incremental processing to avoid excessive memory consumption. For files with 1000 or fewer records, the system loads the entire JSON into memory for simpler processing. This hybrid approach balances performance and memory efficiency.
- **Broken foreign key relationships**: When foreign key relationships cannot be established (e.g., workgroup_id references a non-existent workgroup), the system logs an error, skips the dependent record, and continues processing remaining records.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse and validate JSON input file containing an array of meeting summary objects (format: `[{...}, {...}]`)
- **FR-002**: System MUST parse and analyze `schema.sql` to identify all table definitions, primary keys, foreign keys, required fields, data types, and constraints
- **FR-003**: System MUST build a complete mapping structure documenting how JSON fields correspond to SQL tables and columns
- **FR-004**: System MUST generate synthetic test values deterministically based on JSON context for required database fields that have no corresponding JSON data (e.g., derive UUIDs from workgroup names using hashing, use meeting dates for timestamp fields, generate consistent values for same input context)
- **FR-005**: System MUST generate UUIDs using `gen_random_uuid()` for UUID primary key fields unless schema specifies otherwise
- **FR-006**: System MUST order INSERT statements in dependency order (reference tables → parent tables → child tables → join tables)
- **FR-007**: System MUST normalize comma-separated lists (e.g., peoplePresent) into appropriate normalized table structures
- **FR-008**: System MUST create parent records before dependent records to satisfy foreign key constraints
- **FR-009**: System MUST generate a `seed.sql` file containing TRUNCATE statements (optional but recommended) and all INSERT statements
- **FR-010**: System MUST generate a `mapping.json` file documenting all JSON → SQL field mappings
- **FR-011**: System MUST generate a `TESTDATA.md` file with developer documentation including usage instructions, data summary, limitations, and error/warning summary
- **FR-022**: System MUST write all generated output files (`seed.sql`, `mapping.json`, `TESTDATA.md`) to the same directory as the input JSON file
- **FR-019**: System MUST log all errors and warnings encountered during processing (invalid data, skipped records, constraint violations) to both console output and include summary in generated documentation
- **FR-020**: System MUST continue processing and generate partial output when encountering invalid records, rather than failing completely
- **FR-012**: System MUST validate that generated INSERT statements satisfy NOT NULL constraints
- **FR-013**: System MUST validate that all foreign key references point to existing parent rows
- **FR-014**: System MUST validate that data types match schema requirements (date, timestamp, text[], enum, uuid)
- **FR-015**: System MUST ensure no duplicate primary keys are generated
- **FR-021**: System MUST detect duplicate workgroup IDs and meeting identifiers (based on unique constraint: name, date, workgroup_id, user_id), process the first occurrence, and skip subsequent duplicates with warning logged
- **FR-016**: System MUST document which tables contain test data and which are intentionally left empty
- **FR-017**: System MUST handle nested collections (agendaItems, decisionItems, actionItems) by creating one row per element
- **FR-018**: System MUST extract unique people from comma-separated lists and create appropriate person records and join table entries
- **FR-023**: System MUST use stream/incremental processing for JSON files containing more than 1000 meeting summaries to manage memory efficiently, and MAY use in-memory processing for files with 1000 or fewer records

### Key Entities *(include if feature involves data)*

- **Meeting Summary**: Represents a single meeting record with workgroup association, meeting metadata (date, host, documenter, attendees), agenda items, decisions, actions, tags, and working documents
- **Workgroup**: Represents an organizational group that holds meetings, identified by workgroup_id UUID
- **Agenda Item**: Represents a topic discussed in a meeting, containing status, narrative, discussion points, decision items, and action items
- **Decision Item**: Represents a decision made during a meeting, containing decision text, rationale, effect scope, and opposing views
- **Action Item**: Represents a task assigned during a meeting, containing text, assignee, due date, and status
- **Person**: Represents an individual who may attend meetings or be assigned action items, extracted from comma-separated lists
- **Tag**: Represents topics covered or emotions expressed in meetings, categorized by type
- **Working Document**: Represents a document referenced during a meeting, containing title and link

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can generate complete seed data from JSON input in under 5 minutes
- **SC-002**: Generated `seed.sql` file executes successfully against a fresh database with zero constraint violations
- **SC-003**: 100% of required database fields are populated (either from JSON or synthetic values)
- **SC-004**: All foreign key relationships are correctly established (100% referential integrity)
- **SC-005**: Generated seed data preserves the structure and relationships present in the source JSON (e.g., all meetings maintain their workgroup associations, all agenda items link to correct meetings)
- **SC-006**: Documentation enables developers to load seed data into local database without external help (measured by successful independent execution following documentation)
- **SC-007**: Mapping documentation covers 100% of JSON fields that map to database columns
- **SC-008**: System handles JSON files containing at least 127 meeting summaries without errors or performance degradation
- **SC-009**: System efficiently processes JSON files containing up to 1000 meeting summaries using in-memory processing, and handles larger files (1000+ records) using stream/incremental processing without memory exhaustion

## Assumptions

- JSON file contains an array of meeting summary objects, each following a consistent structure with expected fields (workgroup, workgroup_id, meetingInfo, agendaItems, tags, etc.)
- Schema.sql file contains valid PostgreSQL CREATE TABLE statements
- Target database is PostgreSQL-compatible (Supabase uses PostgreSQL)
- Developers have access to either `psql` command-line tool or Supabase CLI for executing SQL files
- Synthetic values MUST be deterministic and derived from JSON context (e.g., hash workgroup name to generate workgroup_id, use meeting date for timestamp fields, generate consistent values for same input context to ensure reproducible seed data)
- UUIDs can be generated using PostgreSQL's `gen_random_uuid()` function
- TRUNCATE statements are acceptable for resetting test data (may require CASCADE for foreign key constraints)

## Dependencies

- Access to source JSON file containing meeting summaries
- Access to `schema.sql` file with complete database schema definitions
- PostgreSQL-compatible database for validation testing
- Understanding of the expected JSON structure and schema relationships

## Out of Scope

- Real-time data synchronization or incremental updates
- Data migration from production database (only JSON → SQL transformation)
- Data anonymization or privacy filtering (assumes test data is already appropriate)
- Performance optimization for very large datasets (beyond basic handling of 127+ records)
- Support for multiple database dialects (PostgreSQL/Supabase only)
- Interactive data editing or manual correction interfaces
- Validation of business logic beyond database constraints
