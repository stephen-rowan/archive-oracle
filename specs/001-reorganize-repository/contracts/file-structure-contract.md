# File Structure Contract

**Feature**: 001-reorganize-repository  
**Date**: 2025-01-23  
**Type**: Repository Organization Contract

## Overview

This contract defines the agreed-upon file structure and organization patterns for the archive-oracle repository after reorganization. This serves as a specification that must be maintained going forward.

## Directory Structure Contract

### Root Level Files

**Required Files** (must exist):
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - Contributor guidelines
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `netlify.toml` - Netlify deployment configuration
- `.gitignore` - Git ignore rules

**Optional Files**:
- `LICENSE` - Project license (if applicable)
- `.eslintrc.json` - ESLint configuration

### Documentation Directory (`docs/`)

**Structure**:
```
docs/
├── guides/           # User guides and tutorials
├── api/              # API documentation
├── architecture/     # Architecture documentation
└── contributing/     # Contribution guidelines (may link to CONTRIBUTING.md)
```

**Contract Rules**:
- All documentation MUST be in markdown format (`.md`)
- Documentation MUST be organized by purpose, not by type
- All documentation MUST use relative links for interlinking
- Technical terms MUST be explained inline or linked to glossary

### Code Directories

**Structure** (unchanged, but documented):
```
components/          # React components
pages/               # Next.js pages and API routes
  ├── api/          # API route handlers
utils/               # Utility functions
lib/                 # Library code (e.g., Supabase client)
styles/              # CSS modules
config/              # Configuration files
types/               # TypeScript type definitions
```

**Contract Rules**:
- Components MUST be in `components/` directory
- API routes MUST be in `pages/api/` directory
- Utility functions MUST be in `utils/` directory
- No duplicate files with similar functionality
- File names MUST follow kebab-case for components, camelCase for utilities

### Archive Directory (`archive/`)

**Structure**:
```
archive/
├── docs/            # Archived documentation
└── code/            # Archived code files
```

**Contract Rules**:
- Archived files MUST include deprecation notice at top
- Deprecation notice MUST include: reason, date, replacement (if applicable)
- Archive MUST be organized by type (docs/code)
- Archived files MUST NOT be referenced by active code

## Naming Conventions Contract

### File Naming

**Components**: `PascalCase.tsx` (e.g., `ActionItem.tsx`)  
**Pages**: `kebab-case.tsx` (e.g., `submit-meeting-summary/index.tsx`)  
**API Routes**: `camelCase.ts` (e.g., `getApprovedNames.ts`)  
**Utilities**: `camelCase.ts` (e.g., `getArchives.js`)  
**Config Files**: `camelCase.ts` or standard names (e.g., `config.tsx`, `package.json`)  
**Documentation**: `kebab-case.md` (e.g., `getting-started.md`)

### Directory Naming

**Code Directories**: `lowercase` (e.g., `components/`, `utils/`)  
**Documentation Directories**: `lowercase` (e.g., `docs/guides/`)  
**Archive Directories**: `lowercase` (e.g., `archive/docs/`)

## File Organization Rules

### Duplicate Files

**Rule**: No duplicate files with similar functionality may exist in active codebase.

**Enforcement**:
- Duplicates MUST be identified during audit
- Duplicates MUST be consolidated or one version archived
- Authoritative version MUST be documented

### Outdated Files

**Rule**: Outdated files (marked by "old", "deprecated", "backup" in name) MUST be archived or removed.

**Enforcement**:
- Outdated files MUST be moved to `archive/` directory
- Deprecation notice MUST be added
- File MUST NOT be referenced by active code

### External Dependencies

**Rule**: Files referenced by external systems (GitHub Actions, Netlify) MUST maintain backward compatibility or provide migration path.

**Enforcement**:
- All external references MUST be inventoried
- Path changes MUST be updated in external configs
- External systems MUST be tested before merge
- Rollback plan MUST be provided

## Documentation Contract

### README.md Structure

**Required Sections**:
1. Project Overview
2. Getting Started
3. Architecture Overview
4. API Documentation (or link to `docs/api/`)
5. Contributing Guidelines (or link to `CONTRIBUTING.md`)
6. Glossary

**Contract Rules**:
- All sections MUST be present
- Technical terms MUST be explained in Glossary
- Links to detailed docs MUST use relative paths
- Getting Started MUST include all prerequisites

### Technical Term Documentation

**Rule**: Every technical term MUST be explained where it first appears or linked to glossary.

**Enforcement**:
- First occurrence: Inline explanation or link to glossary
- Subsequent occurrences: Link to first occurrence or glossary
- Glossary MUST be maintained in README.md

### Documentation Interlinking

**Rule**: Related documentation sections MUST be interlinked.

**Enforcement**:
- Links MUST use relative paths (`../guides/getting-started.md`)
- Anchor text MUST be descriptive (not "click here")
- All links MUST be verified after reorganization

## Git History Contract

### File Moves

**Rule**: File moves MUST use `git mv` to preserve history.

**Enforcement**:
- All file moves MUST use `git mv old/path new/path`
- History preservation MUST be verified with `git log --follow`
- Cases where history cannot be preserved MUST be documented

## Validation Contract

### Pre-Merge Requirements

1. ✅ All duplicate files consolidated or archived
2. ✅ All outdated files archived
3. ✅ All documentation reorganized into `docs/` structure
4. ✅ All technical terms explained
5. ✅ All documentation interlinked
6. ✅ All external references updated
7. ✅ External systems tested
8. ✅ All file moves use `git mv`
9. ✅ No broken internal links
10. ✅ README.md includes all required sections

## Version

**Contract Version**: 1.0  
**Effective Date**: 2025-01-23  
**Last Updated**: 2025-01-23

## Amendments

This contract may be amended with documented rationale and approval. All amendments must maintain backward compatibility or provide migration path.
