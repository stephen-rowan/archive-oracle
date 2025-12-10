# Research: Repository Audit and Reorganization

**Feature**: 001-reorganize-repository  
**Date**: 2025-01-23  
**Purpose**: Resolve technical unknowns and establish best practices for repository reorganization

## Research Questions

### 1. Git History Preservation

**Question**: What are the best practices for preserving git history when reorganizing files?

**Decision**: Use `git mv` for file moves to preserve history. For complex reorganizations, use `git mv` followed by commits. Document any cases where history cannot be preserved.

**Rationale**: 
- `git mv` is the standard Git command that preserves file history
- Git tracks file moves when content similarity is high (>50%)
- Explicit `git mv` ensures Git recognizes the move operation
- History preservation is critical for code archaeology and blame operations

**Alternatives Considered**:
- Manual file copy + delete: Loses git history
- `git mv` with `--follow`: Only needed for log operations, not for moves
- Third-party tools: Unnecessary complexity for this task

**References**:
- Git documentation: `git mv` preserves history automatically
- GitHub best practices: Use `git mv` for file reorganization

---

### 2. Duplicate File Identification Strategy

**Question**: What is the most effective approach to identify duplicate files?

**Decision**: Three-phase approach:
1. **Name similarity analysis**: Identify files with similar names (e.g., `userRoles.ts` vs `userRoles2.ts`)
2. **Content hash comparison**: Use SHA-256 hashing to find identical files
3. **Manual functional review**: Review files with similar functionality but different content

**Rationale**:
- Name similarity catches obvious duplicates (e.g., `file.ts` vs `file2.ts`)
- Content hashing identifies exact duplicates regardless of name
- Manual review catches functional duplicates that differ in implementation
- Combination approach ensures comprehensive coverage

**Alternatives Considered**:
- Content-only comparison: Misses files with similar names but different content that serve same purpose
- Name-only comparison: Misses duplicates with different names
- Automated semantic analysis: Too complex and error-prone for this task

**Tools**:
- `git diff` for content comparison
- `sha256sum` or `shasum` for content hashing
- Manual code review for functional duplicates

---

### 3. Documentation Structure Patterns

**Question**: What is the best structure for organizing documentation in a Next.js project?

**Decision**: Use `docs/` directory with purpose-based subdirectories:
- `docs/guides/` - User guides, tutorials, getting started
- `docs/api/` - API documentation, endpoint references
- `docs/architecture/` - System architecture, design decisions
- `docs/contributing/` - Contribution guidelines, development setup

**Rationale**:
- Purpose-based organization is intuitive for users
- Separates user-facing docs from developer-facing docs
- Aligns with common open-source project patterns
- Easy to navigate and maintain

**Alternatives Considered**:
- Type-based organization (markdown, code examples): Less intuitive
- Single-level docs directory: Becomes cluttered with many files
- Root-level documentation files: Clutters repository root

**References**:
- Next.js documentation structure
- GitHub documentation best practices
- Open-source project patterns (React, Vue, etc.)

---

### 4. External System Dependency Management

**Question**: How should we handle files referenced by external systems (GitHub Actions, Netlify)?

**Decision**: 
1. **Inventory dependencies**: Identify all external references before reorganization
2. **Update references**: Update file paths in external configs when files move
3. **Test before merge**: Verify external systems work with updated paths
4. **Rollback plan**: Document original paths and provide migration guide

**Rationale**:
- External systems break if file paths change without updates
- Testing prevents production issues
- Rollback plan enables quick recovery if issues arise
- Documentation helps future maintainers understand dependencies

**Identified Dependencies**:
- GitHub Actions workflow (`.github/workflows/commit-meeting-summaries.yml`) references Netlify functions
- Netlify config (`netlify.toml`) references build commands
- Code imports reference file paths (TypeScript/JavaScript imports)

**Alternatives Considered**:
- Ignore external dependencies: High risk of breaking deployments
- Freeze external systems: Not practical, blocks reorganization
- Automated path updates: Too complex, manual review ensures correctness

---

### 5. Archive Directory Structure

**Question**: How should archived files be organized?

**Decision**: Create `archive/` directory at repo root with type-based subdirectories:
- `archive/docs/` - Archived documentation files
- `archive/code/` - Archived code files (e.g., `oldtesting.tsx`)

Each archived file should include a deprecation notice explaining:
- Why it was archived
- When it was archived
- What replaced it (if applicable)
- How to access the content if needed

**Rationale**:
- Type-based organization makes archives easy to navigate
- Deprecation notices provide context for future reference
- Preserves historical content without cluttering active codebase
- Allows safe removal of outdated files

**Alternatives Considered**:
- Delete outdated files: Loses historical context
- Single archive directory: Becomes cluttered
- Date-based organization: Less intuitive than type-based

---

### 6. Technical Term Documentation Strategy

**Question**: How should technical terms be explained in documentation?

**Decision**: 
- **Inline explanations**: Explain terms where they first appear in each document
- **Glossary**: Create a glossary in README.md for common terms
- **Cross-references**: Link to glossary entries when terms reappear

**Rationale**:
- Inline explanations provide immediate context
- Glossary centralizes definitions for easy reference
- Cross-references maintain consistency without repetition
- Balances readability with completeness

**Technical Terms Identified**:
- Supabase (backend-as-a-service platform)
- JSONB (PostgreSQL JSON binary format)
- OAuth (authentication protocol)
- Next.js (React framework)
- Netlify Functions (serverless functions)
- TypeScript (typed JavaScript)

**Alternatives Considered**:
- Glossary-only: Requires users to jump between sections
- Inline-only: Repetitive for terms used frequently
- External documentation: Breaks context, requires internet access

---

### 7. Documentation Interlinking Strategy

**Question**: How should documentation sections be interlinked?

**Decision**: Use relative markdown links between documentation files:
- Link from README.md to specific docs sections
- Link between related documentation files
- Use descriptive anchor text (not "click here")
- Maintain link integrity after reorganization

**Rationale**:
- Relative links work in GitHub, local viewing, and documentation sites
- Descriptive anchor text improves accessibility and SEO
- Interlinking enables non-linear navigation
- Reduces need for manual searching

**Alternatives Considered**:
- Absolute URLs: Breaks when repository is forked or moved
- No interlinking: Forces manual navigation, poor UX
- External link checker: Good for validation but not a strategy

**Tools**:
- Markdown link checker (e.g., `markdown-link-check`)
- Manual review of all links after reorganization

---

## Summary

All technical unknowns have been resolved. The reorganization will proceed using:
1. `git mv` for history preservation
2. Three-phase duplicate identification (name, content, functional)
3. Purpose-based documentation structure (`docs/guides/`, `docs/api/`, etc.)
4. Careful handling of external dependencies with testing and rollback plans
5. Type-based archive organization (`archive/docs/`, `archive/code/`)
6. Inline explanations + glossary for technical terms
7. Relative markdown links for documentation interlinking

**Status**: ✅ All clarifications resolved, ready for Phase 1 design
