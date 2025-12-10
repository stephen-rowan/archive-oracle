# Rollback Plan: Repository Reorganization

**Feature**: 001-reorganize-repository  
**Date**: 2025-01-23  
**Purpose**: Plan for reverting reorganization changes if issues arise

## Overview

This document provides a step-by-step plan to rollback the repository reorganization if critical issues are discovered after implementation.

## Rollback Scenarios

### Scenario 1: Complete Rollback to Backup Branch

If major issues are discovered and a complete rollback is needed:

```bash
# Switch to main branch (or target branch)
git checkout main

# Reset to backup branch
git reset --hard 001-reorganize-repository-backup

# Force push (if needed, with caution)
git push origin main --force
```

**⚠️ Warning**: Force pushing rewrites history. Only use if absolutely necessary and coordinate with team.

### Scenario 2: Partial Rollback - Revert Specific File Moves

If only specific file moves cause issues:

#### Restore Archived Files

```bash
# Restore oldtesting.tsx
git mv archive/code/oldtesting.tsx pages/oldtesting.tsx

# Restore userRoles2.ts
git mv archive/code/userRoles2.ts pages/api/userRoles2.ts
```

#### Restore Moved Documentation

```bash
# Restore API docs to original location
git mv docs/api/getApprovedNames.md docs/getApprovedNames.md
git mv docs/api/upsertMeetingSummary.md docs/upsertMeetingSummary.md
```

### Scenario 3: Revert Specific Commits

If reorganization was done in specific commits:

```bash
# Find commit hash
git log --oneline | grep "reorganize"

# Revert specific commit
git revert <commit-hash>

# Or reset to before reorganization
git reset --hard <commit-before-reorganization>
```

## File Changes Summary

### Files Moved

1. **Documentation Files**:
   - `docs/getApprovedNames.md` → `docs/api/getApprovedNames.md`
   - `docs/upsertMeetingSummary.md` → `docs/api/upsertMeetingSummary.md`

2. **Archived Files**:
   - `pages/oldtesting.tsx` → `archive/code/oldtesting.tsx`
   - `pages/api/userRoles2.ts` → `archive/code/userRoles2.ts`

### Files Created

1. **New Documentation**:
   - `docs/guides/getting-started.md`
   - `docs/guides/directory-structure.md`
   - `docs/architecture/README.md`
   - `docs/contributing/maintenance-guidelines.md`
   - `CONTRIBUTING.md`

2. **Planning Documents**:
   - `specs/001-reorganize-repository/REORGANIZATION_PLAN.md`
   - `specs/001-reorganize-repository/ROLLBACK_PLAN.md` (this file)

### Files Modified

1. **README.md**: Enhanced with comprehensive sections
2. **Documentation**: Updated with interlinks and technical term explanations

## Rollback Steps by Issue Type

### Issue: Broken Import Statements

**Symptoms**: Import errors, module not found errors

**Solution**:
1. Check which files were moved/archived
2. Restore archived files if they're still needed
3. Update import paths if files were moved
4. Run `npm run lint` to verify

### Issue: Broken External System References

**Symptoms**: GitHub Actions fail, Netlify deployment fails

**Solution**:
1. Verify `.github/workflows/commit-meeting-summaries.yml` paths
2. Verify `netlify.toml` configuration
3. Check Netlify function paths (should be unchanged)
4. Restore original file paths if external systems reference them

**Note**: Current reorganization did NOT change paths referenced by external systems, so this scenario is unlikely.

### Issue: Broken Documentation Links

**Symptoms**: Documentation links return 404, broken relative paths

**Solution**:
1. Verify all relative paths in documentation
2. Update links to match current file structure
3. Use `find docs -name "*.md" -exec grep -l "\[.*\](.*)" {} \;` to find all markdown links
4. Test links manually or with link checker

### Issue: Missing Files

**Symptoms**: Files expected but not found

**Solution**:
1. Check if file was archived: `archive/code/` or `archive/docs/`
2. Restore from archive if needed: `git mv archive/code/file.ts original/path/file.ts`
3. Verify file wasn't accidentally deleted

## Verification After Rollback

After performing rollback, verify:

1. **Application Runs**:
   ```bash
   npm run dev
   ```

2. **Linting Passes**:
   ```bash
   npm run lint
   ```

3. **No Broken Imports**:
   - Check browser console for errors
   - Check terminal for import errors

4. **External Systems Work**:
   - Trigger GitHub Actions workflow manually
   - Verify Netlify deployment

5. **Documentation Accessible**:
   - Verify README.md loads correctly
   - Check documentation links work

## Prevention

To prevent needing rollback:

1. **Test Before Merge**: Test all changes locally
2. **Incremental Changes**: Make changes in small, testable increments
3. **Verify External Systems**: Test GitHub Actions and Netlify before merge
4. **Document Changes**: Keep detailed notes of what changed

## Contact

If rollback is needed:
1. Document the issue clearly
2. Identify which changes caused the issue
3. Follow appropriate rollback scenario above
4. Update this document with lessons learned

## Related Documents

- [Reorganization Plan](./REORGANIZATION_PLAN.md): Original reorganization plan
- [Quickstart Guide](./quickstart.md): Step-by-step execution guide
- [Tasks](./tasks.md): Task breakdown and execution order
