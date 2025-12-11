# Research: Generate Test Seed Data Tool

**Date**: 2025-01-27  
**Phase**: 0 - Outline & Research  
**Purpose**: Resolve technical unknowns and establish implementation approach

## Research Questions & Findings

### 1. PostgreSQL SQL Parser Library

**Question**: Which library should be used to parse `schema.sql` CREATE TABLE statements to extract table definitions, columns, constraints, and foreign keys?

**Decision**: Use a lightweight SQL parsing approach with regex/string parsing rather than a full SQL parser library.

**Rationale**: 
- Full SQL parsers (e.g., `node-sql-parser`, `pg-query-parser`) are overkill for this use case
- We only need to extract table definitions, not parse arbitrary SQL
- PostgreSQL CREATE TABLE syntax is relatively consistent and can be parsed with regex patterns
- Reduces external dependencies (important for CLI tool simplicity)
- Existing codebase doesn't use SQL parsing libraries, suggesting lightweight approach is acceptable

**Alternatives Considered**:
- `node-sql-parser`: Full SQL parser, supports PostgreSQL, but adds significant dependency overhead
- `pg-query-parser`: PostgreSQL-specific, but requires native bindings and more complex setup
- Manual regex parsing: Lightweight, no dependencies, sufficient for CREATE TABLE extraction

**Implementation Approach**:
- Parse CREATE TABLE statements using regex patterns
- Extract table name, column definitions (name, type, constraints)
- Identify PRIMARY KEY, FOREIGN KEY, UNIQUE constraints
- Identify NOT NULL constraints and DEFAULT values
- Build dependency graph from FOREIGN KEY relationships

### 2. Command-Line Argument Parsing

**Question**: Should we use a library like `yargs` or `commander` for CLI argument parsing, or use `process.argv` directly?

**Decision**: Use `process.argv` directly for simplicity.

**Rationale**:
- Tool has minimal CLI interface: input JSON file path, optional schema.sql path (defaults to `./schema.sql`)
- No complex argument parsing needed (no flags, subcommands, or validation beyond file existence)
- Reduces dependencies (important for standalone utility)
- Existing codebase scripts (`scripts/export-schema.sh`) use simple bash scripts, suggesting minimal CLI complexity is acceptable

**Alternatives Considered**:
- `yargs`: Popular, feature-rich, but unnecessary for simple file path arguments
- `commander`: Also popular, but adds dependency for minimal benefit
- `process.argv`: Built-in, sufficient for this use case

**Implementation Approach**:
- Parse `process.argv[2]` as JSON input file path (required)
- Parse `process.argv[3]` as schema.sql path (optional, default: `./schema.sql`)
- Validate file existence before processing
- Exit with error code and message if arguments invalid

### 3. Testing Framework

**Question**: Should we set up a formal testing framework (Jest, Mocha) or rely on manual testing?

**Decision**: Manual testing initially, with option to add formal tests later if needed.

**Rationale**:
- Codebase doesn't have existing test framework setup (no `jest.config.js`, `mocha.opts`, or test directories)
- Manual testing is acceptable for CLI utilities (can test with real JSON files)
- Can add formal tests later if tool becomes more complex or needs regression testing
- Follows existing codebase patterns (utilities in `scripts/` and `utils/` don't have formal tests)

**Alternatives Considered**:
- Jest: Popular Node.js testing framework, but requires setup and doesn't match codebase patterns
- Mocha: Also popular, but same concerns as Jest
- Node.js built-in test runner: Available in Node.js 18+, but still requires test structure setup
- Manual testing: Immediate, no setup, sufficient for MVP

**Implementation Approach**:
- Test manually with sample JSON files and verify generated SQL executes correctly
- Document test cases in `TESTDATA.md` (which is already a requirement)
- Add formal tests later if tool evolves or becomes critical path

### 4. Deterministic UUID Generation Strategy

**Question**: How should we generate deterministic UUIDs from JSON context (e.g., workgroup names) to ensure reproducible seed data?

**Decision**: Use SHA-256 hash of context string, then format as UUID v4.

**Rationale**:
- UUIDs must be deterministic: same input (e.g., workgroup name) → same UUID
- SHA-256 provides good distribution and collision resistance
- Can use Node.js built-in `crypto` module (no external dependencies)
- Format hash output as UUID v4 format (8-4-4-4-12 hex digits) for PostgreSQL compatibility

**Alternatives Considered**:
- UUID v5 (namespace-based): Standard approach, but requires namespace UUID management
- Simple hash → UUID conversion: More straightforward, sufficient for test data
- Incremental UUIDs: Not deterministic based on input context

**Implementation Approach**:
- Use `crypto.createHash('sha256').update(contextString).digest('hex')`
- Take first 32 hex characters and format as UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- For `gen_random_uuid()` calls in SQL, use deterministic function: `gen_random_uuid()` with seed (PostgreSQL doesn't support seeded random, so we'll generate UUIDs in Node.js and insert as literals)

**Note**: Actually, PostgreSQL's `gen_random_uuid()` is non-deterministic. For deterministic UUIDs, we'll generate them in Node.js using the hash approach and insert as literal UUID strings in SQL.

### 5. SQL INSERT Statement Ordering Strategy

**Question**: How should we determine the correct order for INSERT statements to satisfy foreign key constraints?

**Decision**: Build dependency graph from FOREIGN KEY constraints, then perform topological sort.

**Rationale**:
- Foreign keys create dependencies: child tables must be inserted after parent tables
- Topological sort ensures all dependencies are satisfied
- Standard graph algorithm, well-understood approach
- Can handle complex dependency chains (e.g., A → B → C)

**Alternatives Considered**:
- Hardcoded table order: Fragile, breaks if schema changes
- Dependency graph + topological sort: Robust, handles any schema structure

**Implementation Approach**:
1. Parse schema.sql to extract all FOREIGN KEY constraints
2. Build directed graph: table → [dependent tables]
3. Perform topological sort (Kahn's algorithm or DFS-based)
4. Generate INSERT statements in sorted order
5. Handle circular dependencies (shouldn't occur in valid schema, but log warning if detected)

### 6. Handling Comma-Separated Lists (peoplePresent)

**Question**: How should we normalize comma-separated lists like `peoplePresent: "Alice, Bob, Carol"` into normalized table structures?

**Decision**: Extract unique names, create entries in `names` table (if not exists), and create join table entries if needed.

**Rationale**:
- `peoplePresent` is stored as comma-separated string in JSON
- `names` table has unique constraint on `name` column
- Need to extract individual names, normalize (trim whitespace), and create/update `names` records
- For meeting-to-person relationships, check if join table exists in schema (doesn't appear to exist in current schema - `peoplePresent` is stored in JSONB `summary` column)

**Alternatives Considered**:
- Store as JSONB array in `summary` column: Matches current schema structure (no normalization needed)
- Create separate `meeting_attendees` join table: Would require schema changes, out of scope

**Implementation Approach**:
- Extract names from `peoplePresent` string: split by comma, trim whitespace
- For each unique name, check if exists in `names` table (based on unique constraint)
- Insert into `names` table if not exists (with deterministic user_id if needed)
- Store `peoplePresent` as-is in JSONB `summary.meetingInfo.peoplePresent` (matches current schema)

**Note**: After reviewing schema.sql, `peoplePresent` is stored in the JSONB `summary` column, not normalized into a separate table. So we don't need to create join table entries - just ensure names exist in `names` table for referential integrity if other parts of the system reference them.

### 7. Error Handling and Logging Strategy

**Question**: How should we handle errors and log warnings during processing?

**Decision**: Use `console.error()` for errors, `console.warn()` for warnings, continue processing on non-fatal errors.

**Rationale**:
- CLI tool should output to stderr for errors (standard practice)
- Warnings should be visible but not stop processing
- Error summary should be included in generated `TESTDATA.md` documentation
- Simple, no external logging library needed

**Alternatives Considered**:
- `winston` or `pino`: Feature-rich logging, but unnecessary for CLI utility
- `console` methods: Built-in, sufficient, follows Node.js conventions

**Implementation Approach**:
- Collect errors and warnings in arrays during processing
- Log to console in real-time (`console.error`, `console.warn`)
- Include summary in `TESTDATA.md` with counts and examples
- Exit with non-zero code if fatal errors occur (e.g., invalid JSON, schema parsing failure)

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SQL Parser | Regex/string parsing | Lightweight, no dependencies, sufficient for CREATE TABLE extraction |
| CLI Args | `process.argv` | Simple interface, no library needed |
| Testing | Manual testing | Matches codebase patterns, sufficient for MVP |
| UUID Generation | SHA-256 hash → UUID format | Deterministic, built-in crypto module |
| INSERT Ordering | Dependency graph + topological sort | Robust, handles any schema structure |
| People Lists | Extract to `names` table, store in JSONB | Matches current schema structure |
| Logging | `console.error/warn` | Built-in, standard CLI practice |

## Remaining Open Questions

None - all NEEDS CLARIFICATION items resolved.

## Next Steps

Proceed to Phase 1: Design & Contracts
- Generate `data-model.md` with entity relationships
- Generate API contracts (CLI interface specification)
- Generate `quickstart.md` with usage instructions
- Update agent context with new technology decisions
