# Repository Reorganization Plan

**Date**: 2025-01-23  
**Feature**: 001-reorganize-repository  
**Status**: Planning Complete

## Summary

This document outlines all file moves, consolidations, and archive decisions for the repository reorganization.

## File Inventory

- **Total files**: 146 files (excluding node_modules, .git, .next)
- **Files analyzed**: All repository files inventoried

## File Moves

### Documentation Files

1. `docs/getApprovedNames.md` → `docs/api/getApprovedNames.md`
   - **Reason**: API documentation belongs in `docs/api/` subdirectory
   - **Impact**: No code references this file (documentation only)
   - **Action**: Use `git mv` to preserve history

2. `docs/upsertMeetingSummary.md` → `docs/api/upsertMeetingSummary.md`
   - **Reason**: API documentation belongs in `docs/api/` subdirectory
   - **Impact**: No code references this file (documentation only)
   - **Action**: Use `git mv` to preserve history

## Duplicate Consolidation

### Functional Duplicates Identified

1. **userRoles.ts vs userRoles2.ts**
   - **Location**: `pages/api/userRoles.ts` and `pages/api/userRoles2.ts`
   - **Analysis**: 
     - `userRoles.ts`: Uses Supabase to fetch user roles from database
     - `userRoles2.ts`: Uses Discord API to fetch user roles from Discord
     - These serve different purposes but have similar names
   - **Status**: `userRoles2.ts` is NOT imported anywhere in the codebase
   - **Decision**: Review both files to determine if `userRoles2.ts` is outdated or serves a different purpose
   - **Action**: 
     - If `userRoles2.ts` is outdated → Archive to `archive/code/userRoles2.ts`
     - If `userRoles2.ts` serves a different purpose → Rename to clarify purpose (e.g., `userRolesDiscord.ts`)
   - **Recommendation**: Archive `userRoles2.ts` as it's not referenced and appears to be an alternative implementation

### Content Hash Analysis

- **Result**: No exact duplicate files found (no files with identical SHA-256 hashes)
- **Conclusion**: All files have unique content

## Archive Decisions

### Outdated Files Identified

1. **pages/oldtesting.tsx**
   - **Reason**: File name indicates it's outdated testing code
   - **Status**: Not referenced anywhere in codebase (only mentioned in documentation)
   - **Action**: Archive to `archive/code/oldtesting.tsx` using `git mv`
   - **Deprecation Notice**: Add notice explaining it's outdated test code, archived on 2025-01-23

### Files with "2", "old", "backup", "deprecated" Patterns

- `pages/api/userRoles2.ts` - See duplicate consolidation section above
- `pages/oldtesting.tsx` - See archive decisions above

## External System Dependencies

### GitHub Actions Workflow

**File**: `.github/workflows/commit-meeting-summaries.yml`

**References**:
- Netlify function: `batchUpdateMeetingSummariesArray` (path: `.netlify/functions/batchUpdateMeetingSummariesArray`)
- Netlify function: `batchUpdateMeetingSummariesById` (path: `.netlify/functions/batchUpdateMeetingSummariesById`)

**Impact**: These functions are in `netlify/functions/` directory, which is NOT being moved. No updates needed.

**Status**: ✅ No action required

### Netlify Configuration

**File**: `netlify.toml`

**References**: 
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

**Impact**: No file path references that would be affected by reorganization.

**Status**: ✅ No action required

### Code Import Statements

**Analysis**: All import statements reference files in:
- `lib/` - Not being moved
- `utils/` - Not being moved
- `components/` - Not being moved
- `pages/` - Not being moved (except archiving oldtesting.tsx)
- `config/` - Not being moved

**Impact**: No import statements reference files that will be moved.

**Status**: ✅ No action required

## New Files to Create

### Documentation

1. `docs/guides/getting-started.md` - Setup instructions and prerequisites
2. `docs/guides/directory-structure.md` - Explanation of directory purposes
3. `CONTRIBUTING.md` - Contributor guidelines (repository root)
4. `docs/architecture/` - Architecture documentation (directory structure)
5. `docs/contributing/maintenance-guidelines.md` - Maintenance guidelines

### README.md Updates

- Add Getting Started section
- Add Architecture Overview section
- Add API Documentation section (or link to `docs/api/`)
- Add Contributing Guidelines section (or link to `CONTRIBUTING.md`)
- Add Glossary section with technical terms

## Execution Order

1. ✅ Phase 1: Setup (backup branch, directory structures) - COMPLETE
2. ✅ Phase 2: Foundational (inventory, analysis) - COMPLETE
3. Phase 3: User Story 1 (documentation reorganization)
4. Phase 4: User Story 2 (consolidation and navigation)
5. Phase 5: User Story 3 (archiving and cleanup)
6. Phase 6: Polish (verification and testing)

## Risk Assessment

### Low Risk
- Documentation file moves (no code dependencies)
- Archive of `oldtesting.tsx` (not referenced)

### Medium Risk
- Consolidation of `userRoles2.ts` - Need to verify it's truly unused before archiving

### No Risk
- External system dependencies (no path changes affecting them)

## Validation Checklist

- [ ] All file moves completed using `git mv`
- [ ] Git history preserved (verify with `git log --follow`)
- [ ] No broken import statements
- [ ] No broken documentation links
- [ ] External systems tested (GitHub Actions, Netlify)
- [ ] Deprecation notices added to archived files
- [ ] All documentation updated and interlinked
- [ ] Technical terms explained in documentation

## Notes

- All file moves must use `git mv` to preserve history
- Test external systems after reorganization
- Verify no broken links in documentation
- Review `userRoles2.ts` carefully before archiving (may serve different purpose than `userRoles.ts`)
