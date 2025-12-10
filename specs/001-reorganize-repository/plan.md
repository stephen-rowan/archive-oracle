# Implementation Plan: Repository Audit and Reorganization

**Branch**: `001-reorganize-repository` | **Date**: 2025-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-reorganize-repository/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature reorganizes the archive-oracle repository to improve clarity, usability, and maintainability. The primary requirement is to audit and reorganize files by removing duplicates, archiving outdated content, consolidating documentation into a logical structure, and ensuring all technical terms are explained. The technical approach involves systematic file analysis, git history preservation, documentation restructuring, and careful handling of external system dependencies (GitHub Actions, Netlify deployment configs).

## Technical Context

**Repository Type**: Next.js web application (TypeScript/JavaScript)  
**Language/Version**: TypeScript 5.1.3, JavaScript (ES5+), Node.js 20.3.1  
**Primary Framework**: Next.js 14.2.8, React 18.2.0  
**Key Dependencies**: 
- Supabase (@supabase/supabase-js 2.26.0) for backend/database
- GitHub API (@octokit/rest 20.0.1) for repository operations
- Google APIs (googleapis 144.0.0) for document integration
- Netlify Functions for serverless endpoints
- React ecosystem (react-markdown, react-modal, react-select)

**Storage**: Supabase (PostgreSQL-based), GitHub (file storage), Google Docs (external)  
**Deployment**: Netlify (with Next.js plugin)  
**Testing**: Manual testing, no formal test framework detected  
**Target Platform**: Web (browser-based), serverless functions (Netlify)  
**Project Type**: Web application (Next.js pages router structure)  
**External System Dependencies**: 
- GitHub Actions workflow (`.github/workflows/commit-meeting-summaries.yml`) references Netlify functions
- Netlify deployment config (`netlify.toml`) references build commands and function paths
- File paths referenced in code imports and documentation

**Performance Goals**: N/A (documentation/organization task, not performance-critical)  
**Constraints**: 
- Must preserve git history using `git mv` for file moves
- Must maintain backward compatibility for external system references
- Must test external systems before merge
- Must provide rollback plan if breakage occurs

**Scale/Scope**: 
- ~100+ files across multiple directories
- Multiple duplicate files identified (e.g., `userRoles.ts` / `userRoles2.ts`)
- Outdated files (e.g., `oldtesting.tsx`)
- Documentation scattered across root and `docs/` directory
- External references in GitHub Actions and Netlify configs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

**Analysis**: This is a repository reorganization and documentation improvement task, not a code feature implementation. The constitution file (`.specify/memory/constitution.md`) appears to be a template for code feature development and does not contain specific rules that apply to documentation/organization tasks.

**Applicable Principles**:
- **Simplicity**: The reorganization follows YAGNI principles by removing unnecessary duplicates and outdated files
- **Maintainability**: Clear documentation structure and naming conventions improve long-term maintainability
- **Backward Compatibility**: External system dependencies are preserved or properly migrated

**No Violations**: This task does not introduce new code complexity, architectural changes, or violate any development principles. It is purely organizational and documentation-focused.

## Project Structure

### Documentation (this feature)

```text
specs/001-reorganize-repository/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Repository Structure (reorganized target)

**Current Structure** (to be reorganized):
- Root-level files: README.md, package.json, tsconfig.json, next.config.js, netlify.toml
- `components/` - React components
- `pages/` - Next.js pages and API routes
- `utils/` - Utility functions
- `lib/` - Library code (Supabase client)
- `styles/` - CSS modules
- `docs/` - Existing documentation (partial)
- `config/` - Configuration files
- `types/` - TypeScript type definitions
- `netlify/functions/` - Netlify serverless functions
- `testdocs/` - Test documentation files
- `.github/workflows/` - GitHub Actions workflows
- `.specify/` - Specification tooling

**Target Structure** (after reorganization):
```text
archive-oracle/
├── README.md                    # Comprehensive guide with Getting Started, Architecture, API Docs, Contributing, Glossary
├── CONTRIBUTING.md              # Contributor guidelines (NEW)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── netlify.toml                 # Netlify deployment configuration
├── .gitignore
│
├── docs/                        # Consolidated documentation (reorganized)
│   ├── guides/                  # User guides and tutorials
│   │   ├── getting-started.md
│   │   └── directory-structure.md
│   ├── api/                     # API documentation
│   │   ├── getApprovedNames.md
│   │   └── upsertMeetingSummary.md
│   ├── architecture/            # Architecture documentation
│   └── contributing/            # Contribution guidelines
│
├── components/                  # React components (unchanged)
├── pages/                       # Next.js pages and API routes (cleaned)
│   ├── api/                     # API routes (duplicates removed)
│   └── ...
├── utils/                       # Utility functions (unchanged)
├── lib/                         # Library code (unchanged)
├── styles/                      # CSS modules (unchanged)
├── config/                      # Configuration files (unchanged)
├── types/                       # TypeScript type definitions (unchanged)
├── netlify/
│   └── functions/               # Netlify serverless functions (unchanged)
│
├── archive/                     # Archived files (NEW)
│   ├── docs/                    # Archived documentation
│   └── code/                    # Archived code files
│       └── oldtesting.tsx       # Example: outdated file
│
├── .github/
│   └── workflows/               # GitHub Actions (paths updated if needed)
│
└── .specify/                    # Specification tooling (unchanged)
```

**Structure Decision**: This is a Next.js web application using the pages router. The reorganization focuses on:
1. Consolidating documentation into `docs/` with clear subdirectories
2. Removing duplicate files (e.g., `userRoles.ts` / `userRoles2.ts`)
3. Archiving outdated files to `archive/` directory
4. Maintaining existing code structure while improving organization
5. Preserving external system references (GitHub Actions, Netlify configs)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This is a straightforward repository reorganization task with no architectural complexity introduced.

---

## Phase Completion Status

### Phase 0: Outline & Research ✅ COMPLETE

**Output**: `research.md`

**Research Completed**:
- ✅ Git history preservation strategies
- ✅ Duplicate file identification approaches
- ✅ Documentation structure patterns
- ✅ External system dependency management
- ✅ Archive directory organization
- ✅ Technical term documentation strategies
- ✅ Documentation interlinking approaches

**Status**: All technical unknowns resolved. Ready for design phase.

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Outputs**:
- ✅ `data-model.md` - Entity relationships and validation rules
- ✅ `contracts/file-structure-contract.md` - File structure specifications
- ✅ `quickstart.md` - Step-by-step execution guide
- ✅ Agent context updated (`.cursor/rules/specify-rules.mdc`)

**Design Artifacts Created**:
1. **Data Model**: Documented entities (Documentation File, Code File, Test File, Configuration File, Duplicate File Group, Archive File, External System Dependency) with attributes, relationships, validation rules, and state transitions.

2. **Contracts**: File structure contract defining:
   - Directory structure requirements
   - Naming conventions
   - File organization rules
   - Documentation standards
   - Git history preservation requirements
   - Validation requirements

3. **Quickstart Guide**: Comprehensive execution guide with:
   - Prerequisites
   - Step-by-step instructions (5 phases)
   - Verification procedures
   - Rollback plan
   - Common issues and solutions
   - Success criteria checklist

**Status**: Design phase complete. Ready for task breakdown (Phase 2).

---

## Post-Design Constitution Check

*Re-evaluated after Phase 1 design completion*

**Status**: ✅ PASSED

**Re-evaluation**:
- **Simplicity**: Design maintains simplicity - no new architectural patterns introduced
- **Maintainability**: Clear contracts and documentation structure improve maintainability
- **Backward Compatibility**: External dependencies properly handled with testing and rollback plans
- **No Violations**: Design artifacts align with repository organization goals without introducing complexity

**Conclusion**: Design phase confirms no constitution violations. Proceed to task breakdown.
