# Data Model: Repository Reorganization

**Feature**: 001-reorganize-repository  
**Date**: 2025-01-23

## Overview

This feature involves reorganizing repository files and documentation. The "data model" here represents the entities and relationships involved in the reorganization process, rather than a traditional database schema.

## Entities

### Documentation File

**Description**: A markdown or text file containing project information, API specifications, guides, or explanations.

**Attributes**:
- `file_path` (string, required): Current file path in repository
- `target_path` (string, required): Target file path after reorganization
- `content_type` (enum, required): Type of documentation
  - Values: `README`, `API_DOCS`, `GUIDE`, `ARCHITECTURE`, `CONTRIBUTING`, `GLOSSARY`
- `target_audience` (enum, required): Intended audience
  - Values: `NEW_CONTRIBUTOR`, `EXPERIENCED_CONTRIBUTOR`, `MAINTAINER`, `ALL`
- `last_updated` (date, optional): Last modification date
- `technical_terms` (array<string>, optional): List of technical terms that need explanation
- `interlinks` (array<string>, optional): List of relative paths to related documentation

**Relationships**:
- May reference other Documentation Files (via interlinks)
- May be archived to Archive File
- May replace or be replaced by another Documentation File

**Validation Rules**:
- File path must be valid relative to repository root
- Target path must be within `docs/` directory structure
- All technical terms must be explained inline or linked to glossary
- All interlinks must be valid relative paths

**State Transitions**:
```
[Current Location] → [Analyzed] → [Reorganized] → [Verified]
                              ↓
                         [Archived] (if outdated)
```

---

### Code File

**Description**: Source code files (TypeScript, JavaScript, CSS, etc.) that may need reorganization.

**Attributes**:
- `file_path` (string, required): Current file path
- `target_path` (string, optional): Target file path if moving
- `file_type` (enum, required): Type of code file
  - Values: `COMPONENT`, `PAGE`, `API_ROUTE`, `UTILITY`, `CONFIG`, `STYLE`, `TYPE_DEFINITION`
- `purpose` (string, optional): Brief description of file purpose
- `dependencies` (array<string>, optional): List of files this file imports/depends on
- `external_references` (array<string>, optional): External systems that reference this file
  - Values: `GITHUB_ACTIONS`, `NETLIFY_CONFIG`, `IMPORT_STATEMENTS`
- `is_duplicate` (boolean, default: false): Whether file is a duplicate
- `duplicate_of` (string, optional): Path to authoritative version if duplicate
- `is_outdated` (boolean, default: false): Whether file is outdated
- `should_archive` (boolean, default: false): Whether file should be archived

**Relationships**:
- May be duplicate of another Code File
- May depend on other Code Files
- May be referenced by External System Dependencies
- May be archived to Archive File

**Validation Rules**:
- If `is_duplicate` is true, `duplicate_of` must be specified
- If `is_outdated` is true, `should_archive` must be true
- All `dependencies` paths must be updated if file moves
- All `external_references` must be updated if file moves

**State Transitions**:
```
[Current] → [Analyzed] → [Consolidated] (if duplicate)
                      → [Moved] (if reorganization needed)
                      → [Archived] (if outdated)
                      → [Unchanged] (if no action needed)
```

---

### Test File

**Description**: Files containing tests or test data that need documentation.

**Attributes**:
- `file_path` (string, required): File path
- `test_purpose` (string, required): What the test validates
- `expected_outcomes` (string, required): Expected test results
- `example_results` (string, optional): Example test output or results
- `test_type` (enum, optional): Type of test
  - Values: `UNIT`, `INTEGRATION`, `E2E`, `DATA`, `MANUAL`
- `documentation_status` (enum, required): Whether test is documented
  - Values: `DOCUMENTED`, `NEEDS_DOCUMENTATION`, `N/A`

**Relationships**:
- May be associated with Code Files being tested
- May reference Test Data Files

**Validation Rules**:
- `test_purpose` must be non-empty
- `expected_outcomes` must be non-empty
- If `documentation_status` is `NEEDS_DOCUMENTATION`, documentation must be added

---

### Configuration File

**Description**: Files that configure the project (package.json, tsconfig.json, netlify.toml, etc.).

**Attributes**:
- `file_path` (string, required): File path (typically root-level)
- `config_purpose` (string, required): What this config file controls
- `impact_on_project` (string, required): How changes affect project behavior
- `external_dependencies` (array<string>, optional): External systems that read this config
- `should_move` (boolean, default: false): Whether config should be moved (usually false for root configs)

**Relationships**:
- Referenced by External System Dependencies
- May reference other Configuration Files

**Validation Rules**:
- Root-level configs (package.json, tsconfig.json, etc.) typically should not move
- All `external_dependencies` must be updated if file moves
- Changes to config files must be tested

---

### Duplicate File Group

**Description**: A group of files identified as duplicates.

**Attributes**:
- `group_id` (string, required): Unique identifier for duplicate group
- `files` (array<CodeFile>, required): List of duplicate files
- `authoritative_file` (string, required): Path to the file to keep
- `identification_method` (array<enum>, required): How duplicates were identified
  - Values: `NAME_SIMILARITY`, `CONTENT_HASH`, `FUNCTIONAL_REVIEW`
- `recommended_action` (enum, required): What to do with duplicates
  - Values: `CONSOLIDATE`, `REMOVE`, `ARCHIVE`
- `consolidation_notes` (string, optional): Notes on how to consolidate

**Relationships**:
- Contains multiple Code Files
- One Code File is designated as authoritative

**Validation Rules**:
- Must have at least 2 files in group
- `authoritative_file` must be one of the files in `files`
- All non-authoritative files must be removed or archived

**Example**:
```json
{
  "group_id": "userRoles-duplicates",
  "files": [
    {"path": "pages/api/userRoles.ts"},
    {"path": "pages/api/userRoles2.ts"}
  ],
  "authoritative_file": "pages/api/userRoles.ts",
  "identification_method": ["NAME_SIMILARITY", "FUNCTIONAL_REVIEW"],
  "recommended_action": "CONSOLIDATE",
  "consolidation_notes": "userRoles2.ts appears to be a newer version. Review both and consolidate into userRoles.ts"
}
```

---

### Archive File

**Description**: A file that has been moved to the archive directory.

**Attributes**:
- `original_path` (string, required): Original file path before archiving
- `archive_path` (string, required): Path in archive directory
- `archive_type` (enum, required): Type of archived content
  - Values: `DOCS`, `CODE`, `CONFIG`, `OTHER`
- `deprecation_reason` (string, required): Why file was archived
- `archived_date` (date, required): When file was archived
- `replaced_by` (string, optional): Path to file that replaced this one
- `deprecation_notice` (string, required): Notice added to archived file

**Relationships**:
- Replaces original Documentation File or Code File
- May be replaced by new file

**Validation Rules**:
- `archive_path` must be within `archive/` directory
- `deprecation_reason` must be non-empty
- `deprecation_notice` must be added to archived file

---

### External System Dependency

**Description**: An external system that references repository files.

**Attributes**:
- `system_name` (enum, required): External system type
  - Values: `GITHUB_ACTIONS`, `NETLIFY`, `IMPORT_STATEMENT`, `DOCUMENTATION_LINK`
- `reference_path` (string, required): Path to file containing the reference
- `referenced_file` (string, required): File path being referenced
- `reference_type` (enum, required): How the file is referenced
  - Values: `FILE_PATH`, `IMPORT_STATEMENT`, `CONFIG_REFERENCE`, `DOCUMENTATION_LINK`
- `must_update` (boolean, required): Whether reference must be updated if file moves
- `update_status` (enum, optional): Status of reference update
  - Values: `PENDING`, `UPDATED`, `VERIFIED`, `NOT_NEEDED`

**Relationships**:
- References Code Files, Configuration Files, or Documentation Files

**Validation Rules**:
- If `referenced_file` moves, `must_update` files must be updated
- All `must_update` references must have `update_status` of `UPDATED` or `VERIFIED` before merge

**Examples**:
```json
{
  "system_name": "GITHUB_ACTIONS",
  "reference_path": ".github/workflows/commit-meeting-summaries.yml",
  "referenced_file": "netlify/functions/batchUpdateMeetingSummariesArray.js",
  "reference_type": "CONFIG_REFERENCE",
  "must_update": true,
  "update_status": "PENDING"
}
```

---

## Relationships Summary

```
Documentation File ──┐
                     ├──→ Archive File
Code File ──────────┘
                     
Code File ──→ Duplicate File Group ──→ Code File (authoritative)

Code File ──→ External System Dependency
Configuration File ──→ External System Dependency
Documentation File ──→ External System Dependency

Documentation File ──→ Documentation File (via interlinks)
Code File ──→ Code File (via dependencies)
```

---

## Validation Rules (Cross-Entity)

1. **No Broken References**: All file references (imports, links, configs) must be valid after reorganization
2. **No Orphaned Files**: All files must have a clear purpose or be archived
3. **History Preservation**: All file moves must use `git mv` to preserve history
4. **External System Integrity**: All external system references must be updated and tested
5. **Documentation Completeness**: All technical terms must be explained, all tests documented

---

## State Machine: File Reorganization Process

```
START
  ↓
[Inventory Files]
  ↓
[Identify Duplicates] ──→ [Consolidate Duplicates]
  ↓
[Identify Outdated] ──→ [Archive Outdated]
  ↓
[Plan Reorganization]
  ↓
[Update External References]
  ↓
[Execute Moves (git mv)]
  ↓
[Update Documentation]
  ↓
[Verify Links & References]
  ↓
[Test External Systems]
  ↓
END
```
