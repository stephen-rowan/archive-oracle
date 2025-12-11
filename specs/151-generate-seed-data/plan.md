# Implementation Plan: Generate Test Seed Data From JSON and Map to schema.sql

**Branch**: `151-generate-seed-data` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/151-generate-seed-data/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature creates a command-line tool that generates PostgreSQL seed data files (`seed.sql`) from JSON meeting summary data, mapping JSON fields to database schema tables. The tool parses `schema.sql` to understand table structures, dependencies, and constraints, then transforms JSON meeting summaries into properly ordered INSERT statements with correct foreign key relationships. The tool also generates mapping documentation (`mapping.json`) and developer usage instructions (`TESTDATA.md`). The technical approach involves SQL parsing, JSON transformation, dependency graph resolution for INSERT ordering, and deterministic UUID generation for referential integrity.

## Technical Context

**Language/Version**: Node.js 20.3.1, TypeScript 5.1.3 (or JavaScript ES5+)  
**Primary Dependencies**: 
- PostgreSQL SQL parser library (NEEDS CLARIFICATION: which library for parsing CREATE TABLE statements)
- Built-in Node.js modules: `fs`, `path`, `crypto` (for deterministic UUID generation)
- JSON parsing (built-in `JSON.parse`)
- Command-line argument parsing (NEEDS CLARIFICATION: use `process.argv` directly or a library like `yargs`/`commander`)

**Storage**: File-based I/O (read JSON input, write SQL/markdown/JSON output files)  
**Testing**: NEEDS CLARIFICATION (no formal test framework detected in codebase - consider Jest, Mocha, or Node.js built-in test runner)  
**Target Platform**: Node.js CLI tool (cross-platform: macOS, Linux, Windows)  
**Project Type**: Standalone CLI utility (single Node.js script or small module)  
**Performance Goals**: Process JSON files with 127+ meeting summaries in under 5 minutes (as per SC-001)  
**Constraints**: 
- Must generate deterministic UUIDs (same input → same UUID) for reproducible seed data
- Must handle invalid/malformed data gracefully (skip with warnings, continue processing)
- Must preserve referential integrity (all foreign keys must reference existing rows)
- Must order INSERTs correctly to satisfy foreign key constraints
- Output files written to same directory as input JSON file

**Scale/Scope**: 
- Input: Single JSON file containing array of meeting summary objects (127+ records expected)
- Output: Three files (`seed.sql`, `mapping.json`, `TESTDATA.md`) written to input directory
- Database schema: ~15 tables (workgroups, meetingsummaries, names, tags, archives, etc.) with foreign key relationships
- JSON structure: Nested objects with arrays (agendaItems containing actionItems/decisionItems, comma-separated lists for peoplePresent)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (with notes)

**Analysis**: The constitution file (`.specify/memory/constitution.md`) appears to be a template that hasn't been filled in with project-specific principles. However, based on the codebase structure and this feature's requirements:

**Applicable Principles** (inferred from codebase patterns):
- **Simplicity**: CLI tool with clear single responsibility (JSON → SQL transformation)
- **Deterministic Output**: Synthetic values must be deterministic for reproducible test data
- **Error Handling**: Graceful degradation (skip invalid records, log warnings, continue processing)
- **Documentation**: Generate comprehensive mapping documentation and usage instructions

**No Violations**: This is a standalone utility tool that doesn't introduce architectural complexity or violate development principles. It follows existing codebase patterns (file-based utilities in `utils/`, scripts in `scripts/`).

**Note**: Constitution template should be filled in for future features, but doesn't block this implementation.

## Project Structure

### Documentation (this feature)

```text
specs/151-generate-seed-data/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Standalone CLI utility script in `scripts/` directory (consistent with existing `scripts/export-schema.sh`, `scripts/export-schema-supabase-cli.sh`)

```text
scripts/
├── generate-seed-data.js    # Main CLI entry point (or .ts if TypeScript)
└── generate-seed-data/     # Alternative: module structure if more complex
    ├── index.js
    ├── sql-parser.js        # Parse schema.sql to extract table definitions
    ├── json-transformer.js  # Transform JSON to SQL INSERT statements
    ├── dependency-resolver.js # Resolve INSERT ordering based on foreign keys
    └── uuid-generator.js    # Deterministic UUID generation

# No separate tests/ directory needed initially (manual testing acceptable per codebase patterns)
# If formal testing added later, place in scripts/generate-seed-data/__tests__/
```

**Rationale**: 
- Follows existing codebase pattern (utilities in `scripts/` or `utils/`)
- Simple single-file script sufficient for MVP (can refactor to module structure if complexity grows)
- No need for separate test directory initially (codebase doesn't have formal test framework setup)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this is a straightforward CLI utility with clear single responsibility.

## Phase Completion Status

### Phase 0: Outline & Research ✅ COMPLETE

**Deliverables**:
- ✅ `research.md` - Resolved all NEEDS CLARIFICATION items:
  - SQL parser approach (regex/string parsing)
  - CLI argument parsing (`process.argv`)
  - Testing strategy (manual testing)
  - Deterministic UUID generation (SHA-256 hash)
  - INSERT ordering (dependency graph + topological sort)
  - Error handling and logging strategy

**Status**: All technical unknowns resolved, ready for implementation.

### Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- ✅ `data-model.md` - Complete data model documentation:
  - Input JSON structure
  - Database schema entities and relationships
  - Data transformation rules
  - Validation rules
  - Error handling scenarios
  - Deterministic value generation strategies

- ✅ `contracts/cli-interface.md` - CLI interface specification:
  - Command syntax and arguments
  - Input/output file formats
  - Behavior specification
  - Error handling and exit codes
  - Validation rules
  - Performance requirements

- ✅ `quickstart.md` - Developer usage guide:
  - Installation instructions
  - Basic usage examples
  - Database loading instructions
  - Common issues and solutions
  - Example workflow

- ✅ Agent context updated - Technology decisions added to `.cursor/rules/specify-rules.mdc`

**Status**: Design complete, contracts defined, ready for task breakdown (Phase 2).

## Next Steps

**Phase 2**: Task Breakdown (via `/speckit.tasks` command)
- Break down implementation into specific, actionable tasks
- Define task dependencies and ordering
- Estimate complexity and effort

**Implementation**: After task breakdown, proceed with:
1. Implement SQL parser module
2. Implement JSON transformer module
3. Implement dependency resolver module
4. Implement UUID generator module
5. Implement main CLI script
6. Test with sample JSON files
7. Generate documentation

## Summary

This implementation plan defines a CLI tool that transforms JSON meeting summary data into PostgreSQL seed SQL files. The tool parses `schema.sql` to understand table structures and dependencies, then generates properly ordered INSERT statements with correct foreign key relationships. All technical decisions have been made, design artifacts are complete, and the tool is ready for implementation.
