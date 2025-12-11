---
description: "Task list for Generate Test Seed Data From JSON and Map to schema.sql feature implementation"
---

# Tasks: Generate Test Seed Data From JSON and Map to schema.sql

**Input**: Design documents from `/specs/151-generate-seed-data/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL per codebase patterns - manual testing acceptable for CLI utility. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **CLI Script**: `scripts/generate-seed-data.js` (or module structure in `scripts/generate-seed-data/`)
- **Node.js**: Built-in modules only (fs, path, crypto, process.argv)
- Paths assume single-file script initially (can refactor to module structure if complexity grows)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure for CLI script in scripts/generate-seed-data.js
- [ ] T002 Initialize Node.js script with shebang and basic CLI argument parsing using process.argv
- [ ] T003 [P] Add file I/O utilities for reading JSON and schema.sql files in scripts/generate-seed-data.js
- [ ] T004 [P] Add error handling infrastructure (error collection arrays, console.error/console.warn) in scripts/generate-seed-data.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement SQL parser module to extract CREATE TABLE statements from schema.sql in scripts/generate-seed-data.js
- [ ] T006 [P] Implement table structure extraction (table name, columns, data types) from parsed CREATE TABLE statements in scripts/generate-seed-data.js
- [ ] T007 [P] Implement constraint extraction (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL) from parsed CREATE TABLE statements in scripts/generate-seed-data.js
- [ ] T008 Implement dependency graph builder from FOREIGN KEY constraints in scripts/generate-seed-data.js
- [ ] T009 Implement topological sort algorithm for INSERT statement ordering in scripts/generate-seed-data.js
- [ ] T010 [P] Implement deterministic UUID generator using SHA-256 hash in scripts/generate-seed-data.js
- [ ] T011 [P] Implement timestamp generation utilities (parse ISO dates, generate timestamps) in scripts/generate-seed-data.js
- [ ] T012 Implement JSON input validation (array check, object structure validation) in scripts/generate-seed-data.js

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate SQL Seed File from JSON Data (Priority: P1) 🎯 MVP

**Goal**: Transform JSON meeting summary data into properly ordered PostgreSQL INSERT statements in seed.sql file

**Independent Test**: Run tool with valid JSON and schema inputs, verify generated seed.sql executes successfully against fresh database with zero constraint violations

### Implementation for User Story 1

- [ ] T013 [US1] Implement workgroup extraction and transformation (JSON workgroup/workgroup_id → workgroups table) in scripts/generate-seed-data.js
- [ ] T014 [US1] Implement workgroup deduplication logic (track unique workgroup_id, skip duplicates with warning) in scripts/generate-seed-data.js
- [ ] T015 [US1] Implement names extraction from peoplePresent comma-separated lists in scripts/generate-seed-data.js
- [ ] T016 [US1] Implement names normalization and deduplication (unique name constraint handling) in scripts/generate-seed-data.js
- [ ] T017 [US1] Implement tags extraction from tags object (topicsCovered, emotions, gamesPlayed, other) in scripts/generate-seed-data.js
- [ ] T018 [US1] Implement tags normalization and deduplication (unique (tag, type) constraint handling) in scripts/generate-seed-data.js
- [ ] T019 [US1] Implement meeting summary extraction (meetingInfo → meetingsummaries table) in scripts/generate-seed-data.js
- [ ] T020 [US1] Implement meeting summary JSONB storage (entire JSON object → summary column) in scripts/generate-seed-data.js
- [ ] T021 [US1] Implement meeting summary deduplication (unique (name, date, workgroup_id, user_id) constraint handling) in scripts/generate-seed-data.js
- [ ] T022 [US1] Implement data type validation (UUID format, ISO date parsing, timestamp conversion) in scripts/generate-seed-data.js
- [ ] T023 [US1] Implement required field validation (NOT NULL constraints, missing field detection) in scripts/generate-seed-data.js
- [ ] T024 [US1] Implement referential integrity validation (foreign key existence checks) in scripts/generate-seed-data.js
- [ ] T025 [US1] Implement SQL INSERT statement generation for workgroups table in scripts/generate-seed-data.js
- [ ] T026 [US1] Implement SQL INSERT statement generation for names table in scripts/generate-seed-data.js
- [ ] T027 [US1] Implement SQL INSERT statement generation for tags table in scripts/generate-seed-data.js
- [ ] T028 [US1] Implement SQL INSERT statement generation for meetingsummaries table in scripts/generate-seed-data.js
- [ ] T029 [US1] Implement SQL escaping and quoting (proper SQL string literal formatting) in scripts/generate-seed-data.js
- [ ] T030 [US1] Implement seed.sql file writing with dependency-ordered INSERT statements in scripts/generate-seed-data.js
- [ ] T031 [US1] Implement TRUNCATE statement generation (commented out by default) in scripts/generate-seed-data.js
- [ ] T032 [US1] Implement error handling for invalid data (skip records, log warnings, continue processing) in scripts/generate-seed-data.js
- [ ] T033 [US1] Implement CLI argument validation (JSON file path required, schema file optional with default) in scripts/generate-seed-data.js
- [ ] T034 [US1] Implement file path resolution (output files written to same directory as input JSON) in scripts/generate-seed-data.js
- [ ] T035 [US1] Implement exit code handling (0=success, 1=fatal error, 2=partial success with warnings) in scripts/generate-seed-data.js

**Checkpoint**: At this point, User Story 1 should be fully functional - tool can generate seed.sql file from JSON input

---

## Phase 4: User Story 2 - Document JSON to SQL Mapping (Priority: P2)

**Goal**: Generate mapping.json file documenting all JSON field to database table/column transformations

**Independent Test**: Verify mapping.json accurately reflects all transformations performed, with clear documentation of source JSON paths and target SQL table/column mappings

### Implementation for User Story 2

- [ ] T036 [US2] Implement mapping structure builder (track JSON path → table/column mappings during transformation) in scripts/generate-seed-data.js
- [ ] T037 [US2] Implement mapping entry creation for direct field mappings (workgroup → workgroups.workgroup) in scripts/generate-seed-data.js
- [ ] T038 [US2] Implement mapping entry creation for transformed fields (deterministic UUID generation, date parsing) in scripts/generate-seed-data.js
- [ ] T039 [US2] Implement synthetic field tracking (created_at, user_id generation strategies) in scripts/generate-seed-data.js
- [ ] T040 [US2] Implement statistics collection (total records, workgroups count, meetings count, names count, tags count) in scripts/generate-seed-data.js
- [ ] T041 [US2] Implement error/warning summary collection for mapping.json in scripts/generate-seed-data.js
- [ ] T042 [US2] Implement mapping.json file writing with complete transformation documentation in scripts/generate-seed-data.js
- [ ] T043 [US2] Implement mapping.json structure validation (valid JSON, required fields present) in scripts/generate-seed-data.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - tool generates both seed.sql and mapping.json

---

## Phase 5: User Story 3 - Provide Developer Usage Documentation (Priority: P2)

**Goal**: Generate TESTDATA.md file with step-by-step instructions for loading seed data into local database

**Independent Test**: Verify developer following TESTDATA.md can successfully load seed data into local database without errors

### Implementation for User Story 3

- [ ] T044 [US3] Implement TESTDATA.md template structure (usage instructions, data summary, limitations, error summary) in scripts/generate-seed-data.js
- [ ] T045 [US3] Implement usage instructions generation (psql commands, Supabase CLI commands) in scripts/generate-seed-data.js
- [ ] T046 [US3] Implement data summary generation (what tables were populated, record counts) in scripts/generate-seed-data.js
- [ ] T047 [US3] Implement limitations and assumptions documentation in scripts/generate-seed-data.js
- [ ] T048 [US3] Implement error/warning summary documentation (counts, examples, skipped records list) in scripts/generate-seed-data.js
- [ ] T049 [US3] Implement regeneration instructions in TESTDATA.md in scripts/generate-seed-data.js
- [ ] T050 [US3] Implement common issues and solutions section in TESTDATA.md in scripts/generate-seed-data.js
- [ ] T051 [US3] Implement TESTDATA.md file writing with complete developer documentation in scripts/generate-seed-data.js

**Checkpoint**: All user stories should now be independently functional - tool generates seed.sql, mapping.json, and TESTDATA.md

---

## Phase 6: User Story 4 - Clear Test Data (Priority: P2)

**Goal**: Generate clear.sql file with TRUNCATE statements to reset test database, enabling developers to easily clear and reload test data

**Independent Test**: Verify clear.sql executes successfully against database with test data, removing all test records without errors, and verify database can be repopulated after clearing

### Implementation for User Story 4

- [ ] T052 [US4] Implement table dependency analysis for TRUNCATE ordering (reverse dependency order) in scripts/generate-seed-data.js
- [ ] T053 [US4] Implement TRUNCATE statement generation with CASCADE option for foreign key handling in scripts/generate-seed-data.js
- [ ] T054 [US4] Implement clear.sql file generation with properly ordered TRUNCATE statements in scripts/generate-seed-data.js
- [ ] T055 [US4] Implement TRUNCATE statement ordering (child tables before parent tables to satisfy foreign key constraints) in scripts/generate-seed-data.js
- [ ] T056 [US4] Implement clear.sql file writing to same directory as input JSON file in scripts/generate-seed-data.js
- [ ] T057 [US4] Add clear.sql usage instructions to TESTDATA.md (how to clear test data before reloading) in scripts/generate-seed-data.js
- [ ] T058 [US4] Add clear.sql execution examples (psql and Supabase CLI commands) to TESTDATA.md in scripts/generate-seed-data.js
- [ ] T059 [US4] Add clear.sql safety warnings (backup recommendations, production database warnings) to TESTDATA.md in scripts/generate-seed-data.js

**Checkpoint**: At this point, User Story 4 should be fully functional - tool generates clear.sql file for resetting test database

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Add comprehensive console logging (progress messages, statistics output) in scripts/generate-seed-data.js
- [ ] T061 [P] Implement performance optimization (handle 127+ records efficiently, memory management) in scripts/generate-seed-data.js
- [ ] T062 [P] Add input validation improvements (malformed JSON detection, schema file validation) in scripts/generate-seed-data.js
- [ ] T063 [P] Implement edge case handling improvements (empty arrays, null values, very large files) in scripts/generate-seed-data.js
- [ ] T064 [P] Add code comments and documentation within script file in scripts/generate-seed-data.js
- [ ] T065 Run quickstart.md validation (test tool with example workflow from quickstart.md) manually
- [ ] T066 Verify all generated files (seed.sql, mapping.json, TESTDATA.md, clear.sql) are valid and complete manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P2 → P2)
  - US2 and US3 can potentially run in parallel after US1 (different output files)
  - US4 can start after US1 completes (needs table dependency information)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 transformation logic (needs mapping data collected during US1 processing)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 transformation logic (needs statistics and error data collected during US1 processing)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 table dependency information (needs table structure and foreign key relationships)

### Within Each User Story

- Core extraction/transformation before SQL generation
- SQL generation before file writing
- Validation throughout processing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 can start
- After US1 completes, US2, US3, and US4 can potentially run in parallel (they depend on US1 data but generate different output files)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all extraction tasks for User Story 1 together:
Task: "Implement workgroup extraction and transformation"
Task: "Implement names extraction from peoplePresent comma-separated lists"
Task: "Implement tags extraction from tags object"

# Launch all SQL generation tasks together (after extraction complete):
Task: "Implement SQL INSERT statement generation for workgroups table"
Task: "Implement SQL INSERT statement generation for names table"
Task: "Implement SQL INSERT statement generation for tags table"
Task: "Implement SQL INSERT statement generation for meetingsummaries table"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Run tool with sample JSON file
   - Verify seed.sql executes successfully
   - Check for constraint violations
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended)

With single developer:

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T012) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T013-T035) - Core functionality
4. Complete Phase 4: User Story 2 (T036-T043) - Mapping documentation
5. Complete Phase 5: User Story 3 (T044-T051) - Usage documentation
6. Complete Phase 6: User Story 4 (T052-T059) - Clear test data
7. Complete Phase 7: Polish (T060-T066) - Improvements

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks target single file `scripts/generate-seed-data.js` initially - can refactor to module structure later if complexity grows
- Manual testing acceptable per codebase patterns (no formal test framework setup)
- Deterministic UUID generation uses SHA-256 hash of context strings
- SQL parsing uses regex/string parsing (no external SQL parser library)
- CLI argument parsing uses process.argv (no external CLI library)
