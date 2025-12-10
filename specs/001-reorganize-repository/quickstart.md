# Quickstart: Repository Reorganization

**Feature**: 001-reorganize-repository  
**Date**: 2025-01-23

## Overview

This guide provides step-by-step instructions for executing the repository reorganization. Follow these steps in order to ensure a smooth reorganization process.

## Prerequisites

- Git installed and configured
- Access to repository with write permissions
- Understanding of repository structure
- Ability to test external systems (GitHub Actions, Netlify)

## Step-by-Step Execution

### Phase 1: Inventory and Analysis

#### 1.1 Create Backup Branch

```bash
git checkout -b 001-reorganize-repository-backup
git push origin 001-reorganize-repository-backup
git checkout 001-reorganize-repository
```

**Purpose**: Create a backup branch before making changes.

#### 1.2 Inventory All Files

```bash
# List all files in repository
find . -type f -not -path './node_modules/*' -not -path './.git/*' -not -path './.next/*' > /tmp/file-inventory.txt

# Identify potential duplicates by name
find . -type f -name "*2.*" -o -name "*old*" -o -name "*backup*" -o -name "*deprecated*" > /tmp/potential-duplicates.txt
```

**Purpose**: Create comprehensive file inventory for analysis.

#### 1.3 Identify Duplicate Files

**Name Similarity Analysis**:
```bash
# Find files with similar names (e.g., userRoles.ts and userRoles2.ts)
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" | sort > /tmp/all-files.txt
# Manually review for similar names
```

**Content Hash Comparison**:
```bash
# Generate SHA-256 hashes for all files
find . -type f -not -path './node_modules/*' -not -path './.git/*' -exec shasum -a 256 {} \; > /tmp/file-hashes.txt
# Find duplicate hashes
sort /tmp/file-hashes.txt | uniq -d -w 64
```

**Functional Review**:
- Manually review files with similar names but different content
- Check for files serving the same purpose (e.g., `userRoles.ts` vs `userRoles2.ts`)

**Output**: List of duplicate file groups with authoritative version identified.

#### 1.4 Identify Outdated Files

```bash
# Find files with "old", "deprecated", "backup" in name
find . -type f \( -iname "*old*" -o -iname "*deprecated*" -o -iname "*backup*" \) \
  -not -path './node_modules/*' -not -path './.git/*' > /tmp/outdated-files.txt
```

**Manual Review**:
- Review each file to confirm it's outdated
- Check if file is still referenced in codebase
- Determine if file should be archived or deleted

**Output**: List of outdated files with archive/delete decision.

#### 1.5 Inventory External Dependencies

**GitHub Actions**:
```bash
# Check GitHub Actions workflows for file references
grep -r "\.js\|\.ts\|\.tsx\|\.json" .github/workflows/ > /tmp/github-actions-refs.txt
```

**Netlify Config**:
```bash
# Check netlify.toml for file references
cat netlify.toml
```

**Code Imports**:
```bash
# Find all import/require statements that might break
grep -r "import\|require" --include="*.ts" --include="*.tsx" --include="*.js" . > /tmp/imports.txt
```

**Output**: List of external dependencies with file paths.

---

### Phase 2: Planning

#### 2.1 Create Reorganization Plan

Document the following:
- Which files will be moved where
- Which duplicates will be consolidated
- Which files will be archived
- Which external references need updating

**Template**:
```markdown
## File Moves
- `docs/getApprovedNames.md` → `docs/api/getApprovedNames.md`
- `docs/upsertMeetingSummary.md` → `docs/api/upsertMeetingSummary.md`

## Duplicate Consolidation
- `pages/api/userRoles2.ts` → Consolidate into `pages/api/userRoles.ts`

## Archive
- `pages/oldtesting.tsx` → `archive/code/oldtesting.tsx`

## External Reference Updates
- `.github/workflows/commit-meeting-summaries.yml` → Update Netlify function paths if moved
```

#### 2.2 Create Archive Directory Structure

```bash
mkdir -p archive/docs
mkdir -p archive/code
```

#### 2.3 Create Documentation Directory Structure

```bash
mkdir -p docs/guides
mkdir -p docs/api
mkdir -p docs/architecture
mkdir -p docs/contributing
```

---

### Phase 3: Execution

#### 3.1 Archive Outdated Files

```bash
# Example: Archive oldtesting.tsx
git mv pages/oldtesting.tsx archive/code/oldtesting.tsx

# Add deprecation notice to archived file
cat > archive/code/oldtesting.tsx << 'EOF'
<!--
DEPRECATED: This file was archived on 2025-01-23
Reason: Outdated test file, replaced by proper test structure
Replacement: N/A - test functionality moved to proper test files
-->

[Original file content]
EOF
```

**Repeat for each outdated file**.

#### 3.2 Consolidate Duplicates

```bash
# Example: Review userRoles.ts and userRoles2.ts
# Determine which is authoritative (assume userRoles.ts)
# Merge any unique functionality from userRoles2.ts into userRoles.ts
# Then remove duplicate
git rm pages/api/userRoles2.ts
```

**Important**: Review both files carefully before removing!

#### 3.3 Move Documentation Files

```bash
# Move API documentation
git mv docs/getApprovedNames.md docs/api/getApprovedNames.md
git mv docs/upsertMeetingSummary.md docs/api/upsertMeetingSummary.md

# Move other documentation as planned
```

#### 3.4 Update External References

**GitHub Actions**:
```bash
# Edit .github/workflows/commit-meeting-summaries.yml
# Update any file paths that changed
# Test workflow manually if possible
```

**Netlify Config**:
```bash
# Edit netlify.toml if function paths changed
# Verify build still works
```

**Code Imports**:
```bash
# Update import statements in files that moved
# Use IDE refactoring tools or find/replace carefully
```

#### 3.5 Update Documentation

**Update README.md**:
- Add Getting Started section
- Add Architecture Overview
- Add API Documentation section (or link to `docs/api/`)
- Add Contributing Guidelines section (or link to `CONTRIBUTING.md`)
- Add Glossary with technical terms

**Create CONTRIBUTING.md**:
- Code style guidelines
- Submission process
- Project structure overview
- Development setup

**Add Technical Term Explanations**:
- Explain terms inline where first used
- Add terms to Glossary in README.md
- Link to glossary from subsequent occurrences

**Interlink Documentation**:
- Add links between related sections
- Use relative paths (`../api/getApprovedNames.md`)
- Verify all links work

---

### Phase 4: Verification

#### 4.1 Verify File Moves

```bash
# Check git status
git status

# Verify history preserved
git log --follow -- archive/code/oldtesting.tsx
```

#### 4.2 Verify No Broken Links

```bash
# Check for broken internal links (manual review)
# Or use markdown link checker if available
```

#### 4.3 Verify External Systems

**GitHub Actions**:
- Trigger workflow manually or wait for scheduled run
- Verify workflow completes successfully
- Check that file paths are correct

**Netlify**:
- Test build locally: `npm run build`
- Deploy to staging/preview if possible
- Verify functions still work

**Code**:
- Run linter: `npm run lint`
- Check for import errors
- Test application locally: `npm run dev`

#### 4.4 Verify Documentation

- Read through README.md as a new contributor would
- Verify all technical terms are explained
- Verify all links work
- Verify documentation structure is logical

---

### Phase 5: Commit and Merge

#### 5.1 Commit Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Reorganize repository: consolidate duplicates, archive outdated files, restructure documentation

- Consolidate duplicate files (userRoles.ts/userRoles2.ts)
- Archive outdated files (oldtesting.tsx)
- Reorganize documentation into docs/ structure
- Update README.md with comprehensive sections
- Create CONTRIBUTING.md
- Add technical term explanations and glossary
- Interlink documentation sections
- Update external references (GitHub Actions, Netlify)
- Preserve git history using git mv"
```

#### 5.2 Create Pull Request

- Create PR with detailed description of changes
- Reference this quickstart guide
- List all file moves and consolidations
- Note any external system dependencies updated
- Include rollback plan

#### 5.3 Final Verification

Before merging:
- ✅ All tests pass
- ✅ External systems verified
- ✅ Documentation reviewed
- ✅ No broken links
- ✅ Git history preserved
- ✅ Rollback plan documented

---

## Rollback Plan

If issues arise after reorganization:

1. **Revert to Backup Branch**:
   ```bash
   git checkout main
   git reset --hard 001-reorganize-repository-backup
   ```

2. **Or Revert Specific Changes**:
   ```bash
   # Revert specific file moves
   git revert <commit-hash>
   ```

3. **Update External Systems**:
   - Revert GitHub Actions workflow changes if needed
   - Revert Netlify config changes if needed

4. **Document Issues**:
   - Document what broke
   - Document why it broke
   - Plan fixes for next attempt

---

## Common Issues and Solutions

### Issue: Git history lost after move

**Solution**: Always use `git mv` instead of manual move + add.

### Issue: External system breaks after path change

**Solution**: Update external configs before committing, test before merge.

### Issue: Import statements break after file move

**Solution**: Use IDE refactoring tools or carefully update all imports.

### Issue: Documentation links break

**Solution**: Use relative paths, verify all links after reorganization.

---

## Success Criteria Checklist

- [ ] All duplicate files consolidated or archived
- [ ] All outdated files archived with deprecation notices
- [ ] Documentation reorganized into `docs/` structure
- [ ] README.md includes all required sections
- [ ] CONTRIBUTING.md created
- [ ] All technical terms explained
- [ ] All documentation interlinked
- [ ] All external references updated
- [ ] External systems tested and working
- [ ] Git history preserved
- [ ] No broken links
- [ ] Rollback plan documented

---

## Next Steps

After successful reorganization:

1. Update project documentation to reflect new structure
2. Communicate changes to team
3. Update any external documentation (e.g., project website)
4. Establish maintenance process for keeping repository organized

---

## Resources

- [Research Document](./research.md) - Technical decisions and rationale
- [Data Model](./data-model.md) - Entity relationships and validation rules
- [File Structure Contract](./contracts/file-structure-contract.md) - Structure specifications
- [Feature Specification](./spec.md) - Complete requirements
