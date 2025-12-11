# Implementation Plan: Generate Test Seed Data From JSON and Map to schema.sql

**Branch**: `151-generate-seed-data` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/151-generate-seed-data/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a Node.js CLI tool that transforms JSON meeting summary data into PostgreSQL seed SQL files. The tool parses a JSON array of meeting summaries and a PostgreSQL schema file (`schema.sql`), then generates three output files: `seed.sql` (INSERT statements), `mapping.json` (transformation documentation), and `TESTDATA.md` (usage instructions). The technical approach uses lightweight regex-based SQL parsing (no external SQL parser library), deterministic UUID generation via SHA-256 hashing, and topological sorting for INSERT statement ordering to satisfy foreign key constraints.

## Technical Context

**Language/Version**: Node.js 20.3.1+, JavaScript (ES5+)  
**Primary Dependencies**: 
- Node.js built-in modules: `fs`, `path`, `crypto` (for UUID generation)
- No external dependencies required (standalone CLI utility)

**Storage**: File-based I/O (reads JSON input, writes SQL/Markdown/JSON output files)  
**Testing**: Manual testing initially (matches codebase patterns - no formal test framework detected)  
**Target Platform**: Cross-platform (macOS, Linux, Windows) - Node.js CLI tool  
**Project Type**: Standalone CLI utility (single Node.js script)  
**Performance Goals**: Process 127+ meeting summaries in under 5 minutes (SC-001), handle up to 1000 records in-memory, use stream/incremental processing for larger files  
**Constraints**: 
- Must generate deterministic UUIDs (same input → same UUID for reproducible seed data)
- Must handle invalid/malformed data gracefully (log errors, skip records, continue processing)
- Must satisfy all foreign key constraints (topological sort for INSERT ordering)
- Must validate data types and constraints before generating SQL
- Memory-efficient for large files (stream processing threshold: 1000 records)

**Scale/Scope**: 
- Input: JSON files with 127+ meeting summaries (up to 1000+ records)
- Output: Three files per execution (seed.sql, mapping.json, TESTDATA.md)
- Tables: Primary focus on `workgroups`, `meetingsummaries`, `names`, `tags` tables from schema.sql

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

**Evaluation**:
- Constitution file (`.specify/memory/constitution.md`) appears to be a template and hasn't been customized for this project
- No specific constitutional constraints identified that would block this feature
- Feature aligns with existing codebase patterns:
  - Standalone utility scripts (similar to existing scripts in `scripts/` and `utils/`)
  - No external dependencies (matches lightweight approach)
  - Manual testing approach (consistent with codebase)
  - File-based I/O (standard Node.js patterns)

**Post-Phase 1 Re-evaluation**: ✅ PASSED
- Design artifacts (data-model.md, contracts/, quickstart.md) complete
- No constitutional violations identified
- Implementation approach is consistent with project structure

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
scripts/
└── generate-seed-data.js    # Main CLI script (standalone Node.js utility)

# No separate test directory - manual testing approach (matches codebase patterns)
# No separate models/services - single script with inline functions
```

**Structure Decision**: 
- Single standalone Node.js script in `scripts/` directory (consistent with existing utility scripts)
- No external dependencies or complex project structure needed
- Script will be executable directly via `node scripts/generate-seed-data.js`
- Output files written to same directory as input JSON file (as specified in requirements)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
