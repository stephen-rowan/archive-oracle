# Maintenance Guidelines

This document provides guidelines for ongoing repository maintenance to keep the codebase clean, organized, and maintainable.

## File Organization

### When to Archive Files

Archive files when they meet any of these criteria:
- **Outdated**: No longer used but may have historical value
- **Replaced**: Superseded by a better implementation
- **Deprecated**: Marked for removal but kept for reference
- **Experimental**: Test code that didn't make it into production

### Archive Process

1. **Use `git mv`**: Always use `git mv` to preserve git history
   ```bash
   git mv path/to/file.ts archive/code/file.ts
   ```

2. **Add Deprecation Notice**: Add a deprecation notice at the top of archived files:
   ```markdown
   <!--
   DEPRECATED: This file was archived on YYYY-MM-DD
   Reason: Brief explanation of why it was archived
   Replacement: What replaced it (if applicable), or N/A
   Note: Additional context if needed
   -->
   ```

3. **Update Documentation**: Update relevant documentation to reflect the archive:
   - Update `docs/guides/directory-structure.md` with archive entry
   - Remove references from active documentation
   - Add note about archive in related sections

4. **Verify No References**: Check that no active code imports or references the archived file:
   ```bash
   grep -r "archived-file-name" --exclude-dir=archive --exclude-dir=.git
   ```

## Naming Conventions

Follow these naming conventions for new files:

### Components
- **PascalCase** for React components: `ActionItem.tsx`, `SummaryTemplate.tsx`
- Use descriptive names that indicate purpose

### Utilities
- **camelCase** for utility functions: `getsummaries.js`, `saveAgenda.js`
- Use verb-noun pattern: `get*`, `save*`, `update*`, `fetch*`

### Pages
- **kebab-case** for page directories: `submit-meeting-summary/`
- **PascalCase** for page files: `index.tsx`, `AdminTools.tsx`

### API Routes
- **camelCase** for API route files: `getApprovedNames.ts`, `upsertMeetingSummary.ts`
- Use descriptive names matching the endpoint purpose

### Styles
- **kebab-case** with `.module.css`: `home.module.css`, `meeting-info.module.css`
- Match component name when possible

### Configuration
- **camelCase** for config files: `config.ts`, `meetingTypesConfig.ts`

## Documentation Maintenance

### Keep Documentation Current

- **Update on Changes**: Update documentation when code changes
- **Review Regularly**: Periodically review documentation for accuracy
- **Link Integrity**: Verify all links work after file moves
- **Technical Terms**: Ensure technical terms are explained inline or linked to glossary

### Documentation Structure

- **Guides** (`docs/guides/`): User-facing guides and tutorials
- **API** (`docs/api/`): API endpoint documentation
- **Architecture** (`docs/architecture/`): System design and architecture
- **Contributing** (`docs/contributing/`): Contribution and maintenance guidelines

## Code Quality

### Before Committing

- Run linter: `npm run lint`
- Check for console errors: `npm run dev`
- Verify imports: Ensure all imports resolve correctly
- Test functionality: Verify changes work as expected

### Code Review Checklist

- [ ] Code follows naming conventions
- [ ] No console errors or warnings
- [ ] Documentation updated if needed
- [ ] No broken imports or references
- [ ] Git history preserved for file moves

## Duplicate File Management

### Identifying Duplicates

1. **Name Similarity**: Look for files with "2", "old", "backup" in names
2. **Content Hash**: Compare file contents for exact duplicates
3. **Functional Review**: Review files with similar purposes

### Handling Duplicates

1. **Review Both Files**: Understand differences and purpose
2. **Consolidate or Archive**: 
   - If duplicates: Merge functionality and remove duplicate
   - If alternatives: Archive unused version with deprecation notice
3. **Update References**: Update all imports and references
4. **Document Decision**: Note in reorganization plan or commit message

## External Dependencies

### Tracking Dependencies

- **GitHub Actions**: Document file paths referenced in workflows
- **Netlify Config**: Note function paths and build commands
- **Code Imports**: Track import statements that reference files

### Updating Dependencies

- **Before Moving Files**: Check external dependencies
- **Update References**: Update paths in external configs
- **Test Systems**: Verify external systems work after changes
- **Document Changes**: Note dependency updates in commit messages

## Regular Maintenance Tasks

### Monthly

- Review archived files for potential deletion (if truly obsolete)
- Check for new duplicate files
- Update documentation for recent changes
- Review and update glossary with new terms

### Quarterly

- Comprehensive documentation review
- Check for outdated external dependencies
- Review file organization and structure
- Update maintenance guidelines if needed

## Archive Directory Management

### Organization

- **By Type**: Organize archives by type (`docs/`, `code/`)
- **Clear Naming**: Use descriptive names that indicate original purpose
- **Deprecation Notices**: Always include deprecation notices

### Cleanup

- **Review Periodically**: Consider removing truly obsolete files after 1+ year
- **Document Deletions**: Note deletions in commit messages
- **Preserve History**: Use `git rm` to remove if deleting from archive

## Related Documentation

- [Directory Structure Guide](../guides/directory-structure.md): Understanding project organization
- [Contributing Guidelines](../../CONTRIBUTING.md): How to contribute
- [Architecture Documentation](../architecture/): System design

## Questions?

If you're unsure about whether to archive a file or how to maintain the repository:
1. Check existing archived files for examples
2. Review this guide
3. Ask maintainers for guidance
4. When in doubt, err on the side of preserving with a deprecation notice
