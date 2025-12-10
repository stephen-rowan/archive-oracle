---
description: "Task list for repository audit and reorganization feature implementation"
---

# Tasks: Repository Audit and Reorganization

**Input**: Design documents from `/specs/001-reorganize-repository/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Repository root**: `/Users/stephen/Documents/GitHub/archive-oracle/`
- **Documentation**: `docs/` with subdirectories (`docs/guides/`, `docs/api/`, etc.)
- **Archive**: `archive/` with subdirectories (`archive/docs/`, `archive/code/`)
- **Code**: Existing structure (`components/`, `pages/`, `utils/`, etc.)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and backup creation

- [ ] T001 Create backup branch `001-reorganize-repository-backup` before making changes
- [ ] T002 [P] Create archive directory structure: `archive/docs/` and `archive/code/`
- [ ] T003 [P] Create documentation directory structure: `docs/guides/`, `docs/api/`, `docs/architecture/`, `docs/contributing/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core inventory and analysis that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Inventory all repository files and generate file list (excluding node_modules, .git, .next)
- [ ] T005 [P] Identify duplicate files using name similarity analysis (find files with "2", "old", "backup" patterns)
- [ ] T006 [P] Identify duplicate files using content hash comparison (SHA-256 hashing)
- [ ] T007 Identify functional duplicates through manual review (e.g., `pages/api/userRoles.ts` vs `pages/api/userRoles2.ts`)
- [ ] T008 [P] Identify outdated files by name patterns (old, deprecated, backup) in repository
- [ ] T009 [P] Inventory external system dependencies in `.github/workflows/commit-meeting-summaries.yml`
- [ ] T010 [P] Inventory external system dependencies in `netlify.toml`
- [ ] T011 [P] Inventory code import statements that reference files (grep for import/require statements)
- [ ] T012 Create reorganization plan document listing all file moves, consolidations, and archive decisions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New Contributor Onboarding (Priority: P1) 🎯 MVP

**Goal**: Enable new contributors to find setup instructions, API documentation, and contribution guidelines within 5 minutes without external help. This delivers immediate value by validating that reorganization achieves its primary goal of improved usability.

**Independent Test**: Have a new contributor (or someone unfamiliar with the project) navigate the repository and successfully find key information (setup instructions, API documentation, contribution guidelines) within 5 minutes without asking questions. The test delivers immediate value by validating that the reorganization achieves its primary goal of improved usability.

### Implementation for User Story 1

- [ ] T013 [US1] Update `README.md` with comprehensive Getting Started section including all prerequisites explained
- [ ] T014 [US1] Update `README.md` with Architecture Overview section explaining system components
- [ ] T015 [US1] Update `README.md` with API Documentation section (or link to `docs/api/`)
- [ ] T016 [US1] Update `README.md` with Contributing Guidelines section (or link to `CONTRIBUTING.md`)
- [ ] T017 [US1] Update `README.md` with Glossary section explaining all technical terms (Supabase, JSONB, OAuth, Next.js, Netlify Functions, TypeScript)
- [ ] T018 [P] [US1] Move `docs/getApprovedNames.md` to `docs/api/getApprovedNames.md` using `git mv`
- [ ] T019 [P] [US1] Move `docs/upsertMeetingSummary.md` to `docs/api/upsertMeetingSummary.md` using `git mv`
- [ ] T020 [US1] Create `docs/guides/getting-started.md` with setup instructions and prerequisites
- [ ] T021 [US1] Create `docs/guides/directory-structure.md` explaining purpose of each major directory (components/, pages/, utils/, lib/, styles/, config/, types/, netlify/)
- [ ] T022 [US1] Create `CONTRIBUTING.md` at repository root with contributor guidelines including code style, submission process, and project structure overview
- [ ] T023 [US1] Add inline explanations for technical terms in `docs/api/getApprovedNames.md` where terms first appear
- [ ] T024 [US1] Add inline explanations for technical terms in `docs/api/upsertMeetingSummary.md` where terms first appear
- [ ] T025 [US1] Add inline explanations for technical terms in `docs/guides/getting-started.md` where terms first appear
- [ ] T026 [US1] Add inline explanations for technical terms in `docs/guides/directory-structure.md` where terms first appear
- [ ] T027 [US1] Add interlinks from `README.md` to `docs/guides/getting-started.md` using relative paths
- [ ] T028 [US1] Add interlinks from `README.md` to `docs/api/` documentation using relative paths
- [ ] T029 [US1] Add interlinks from `README.md` to `CONTRIBUTING.md` using relative path
- [ ] T030 [US1] Add interlinks from `docs/guides/getting-started.md` to `docs/guides/directory-structure.md` using relative paths
- [ ] T031 [US1] Add interlinks from `docs/guides/getting-started.md` to `docs/api/` documentation using relative paths
- [ ] T032 [US1] Add interlinks from `CONTRIBUTING.md` to `docs/guides/directory-structure.md` using relative paths
- [ ] T033 [US1] Verify all file paths in documentation are accurate after reorganization

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. A new contributor should be able to find all key information within 5 minutes.

---

## Phase 4: User Story 2 - Experienced Contributor Efficiency (Priority: P2)

**Goal**: Enable experienced contributors to quickly locate specific files, understand code relationships, and navigate between related documentation sections efficiently. This improves ongoing productivity by reducing friction in development workflows.

**Independent Test**: Have an experienced contributor complete common tasks (finding a component, understanding an API change, locating test files) and measure time-to-location. The test delivers value by ensuring reorganization doesn't disrupt existing workflows while improving them.

### Implementation for User Story 2

- [ ] T034 [P] [US2] Consolidate duplicate files: Review `pages/api/userRoles.ts` and `pages/api/userRoles2.ts`, merge unique functionality, remove `pages/api/userRoles2.ts` using `git rm`
- [ ] T035 [US2] Update `docs/guides/directory-structure.md` with detailed component location information (components/ directory structure)
- [ ] T036 [US2] Update `docs/guides/directory-structure.md` with API route location information (pages/api/ directory structure)
- [ ] T037 [US2] Add interlinks from API documentation (`docs/api/getApprovedNames.md`) to related components in `docs/guides/directory-structure.md`
- [ ] T038 [US2] Add interlinks from API documentation (`docs/api/upsertMeetingSummary.md`) to related components in `docs/guides/directory-structure.md`
- [ ] T039 [US2] Create `docs/architecture/` directory structure documentation explaining code relationships
- [ ] T040 [US2] Document test file locations and purposes in `docs/guides/directory-structure.md` (if test files exist)
- [ ] T041 [US2] Add cross-references between related documentation sections (e.g., API docs ↔ component docs ↔ architecture docs)
- [ ] T042 [US2] Update import statements in code files that reference consolidated duplicate files (if any imports reference `userRoles2.ts`)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Experienced contributors should be able to navigate efficiently without disruption.

---

## Phase 5: User Story 3 - Repository Maintenance and Cleanliness (Priority: P3)

**Goal**: Establish clean repository baseline by removing duplicates, archiving outdated files, and ensuring documentation stays current. This provides long-term value by reducing technical debt and maintenance burden.

**Independent Test**: Audit the repository for duplicate files, outdated content, and documentation gaps, then verify that reorganization eliminates these issues. The test delivers value by establishing a clean baseline for future maintenance.

### Implementation for User Story 3

- [ ] T043 [P] [US3] Archive outdated file `pages/oldtesting.tsx` to `archive/code/oldtesting.tsx` using `git mv`
- [ ] T044 [US3] Add deprecation notice to `archive/code/oldtesting.tsx` explaining reason, date, and replacement (if any)
- [ ] T045 [US3] Archive any other outdated files identified in Phase 2 to appropriate `archive/` subdirectories using `git mv`
- [ ] T046 [US3] Add deprecation notices to all archived files in `archive/docs/` (if any) explaining reason, date, and replacement
- [ ] T047 [US3] Add deprecation notices to all archived files in `archive/code/` explaining reason, date, and replacement
- [ ] T048 [US3] Verify no active code references archived files (check import statements and external references)
- [ ] T049 [US3] Update `docs/guides/directory-structure.md` to document `archive/` directory structure and purpose
- [ ] T050 [US3] Create `docs/contributing/maintenance-guidelines.md` with guidelines for ongoing repository maintenance
- [ ] T051 [US3] Document naming conventions in `CONTRIBUTING.md` for future file additions (PascalCase for components, camelCase for utilities, kebab-case for pages)
- [ ] T052 [US3] Update all documentation to ensure current and accurate information (review for outdated references)
- [ ] T053 [US3] Verify all technical terms in reorganized documentation are explained inline or linked to glossary in `README.md`

**Checkpoint**: All user stories should now be independently functional. Repository should be clean with duplicates removed, outdated files archived, and documentation current.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, external system updates, and cross-cutting improvements

- [ ] T054 [P] Update external references in `.github/workflows/commit-meeting-summaries.yml` if Netlify function paths changed
- [ ] T055 [P] Update external references in `netlify.toml` if function paths changed
- [ ] T056 Update all code import statements that reference moved files (verify no broken imports)
- [ ] T057 Verify git history preserved for all file moves using `git log --follow` on moved files
- [ ] T058 Verify no broken internal links in documentation (manual review or link checker)
- [ ] T059 Test external systems: Verify GitHub Actions workflow still works after path updates
- [ ] T060 Test external systems: Verify Netlify build and deployment still works after path updates
- [ ] T061 Test application locally: Run `npm run lint` to check for import errors
- [ ] T062 Test application locally: Run `npm run dev` to verify application starts correctly
- [ ] T063 Run quickstart.md validation: Execute verification steps from `quickstart.md`
- [ ] T064 Create rollback plan document if issues arise after reorganization
- [ ] T065 Final documentation review: Read through `README.md` as a new contributor would
- [ ] T066 Final documentation review: Verify all technical terms explained, all links work, structure is logical

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May reference US1 documentation but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May reference US1/US2 but should be independently testable

### Within Each User Story

- Documentation updates before interlinking
- File moves before documentation updates
- Consolidation before removal
- Archive before deprecation notices
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- File moves within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all file moves for User Story 1 together:
Task: "Move docs/getApprovedNames.md to docs/api/getApprovedNames.md using git mv"
Task: "Move docs/upsertMeetingSummary.md to docs/api/upsertMeetingSummary.md using git mv"

# Launch all documentation updates together:
Task: "Update README.md with comprehensive Getting Started section"
Task: "Update README.md with Architecture Overview section"
Task: "Update README.md with API Documentation section"
Task: "Update README.md with Contributing Guidelines section"
Task: "Update README.md with Glossary section"
```

---

## Parallel Example: User Story 2

```bash
# Launch consolidation and directory updates together:
Task: "Consolidate duplicate files: Review userRoles.ts and userRoles2.ts"
Task: "Update docs/guides/directory-structure.md with detailed component location information"
Task: "Update docs/guides/directory-structure.md with API route location information"
```

---

## Parallel Example: User Story 3

```bash
# Launch all archiving tasks together:
Task: "Archive outdated file pages/oldtesting.tsx to archive/code/oldtesting.tsx"
Task: "Archive any other outdated files identified in Phase 2"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (new contributor can find key info in 5 minutes)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish phase → Final verification → Merge
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (documentation and README updates)
   - Developer B: User Story 2 (consolidation and navigation improvements)
   - Developer C: User Story 3 (archiving and maintenance)
3. Stories complete and integrate independently
4. Team completes Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All file moves MUST use `git mv` to preserve history
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- External systems (GitHub Actions, Netlify) MUST be tested before merge
- Rollback plan MUST be created if issues arise

---

## Task Summary

**Total Tasks**: 66
**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 9 tasks
- Phase 3 (User Story 1): 21 tasks
- Phase 4 (User Story 2): 9 tasks
- Phase 5 (User Story 3): 11 tasks
- Phase 6 (Polish): 13 tasks

**Tasks by User Story**:
- User Story 1 (P1 - MVP): 21 tasks
- User Story 2 (P2): 9 tasks
- User Story 3 (P3): 11 tasks

**Parallel Opportunities**: 
- 15 tasks marked [P] can run in parallel within their phases
- All user stories can run in parallel after Foundational phase completes

**Independent Test Criteria**:
- **US1**: New contributor finds key info within 5 minutes without help
- **US2**: Experienced contributor completes common tasks with improved time-to-location
- **US3**: Repository audit shows zero duplicates, outdated files archived, documentation current

**Suggested MVP Scope**: User Story 1 only (21 tasks) - delivers immediate value for new contributors
