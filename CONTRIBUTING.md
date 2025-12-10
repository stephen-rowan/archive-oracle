# Contributing to Archive Oracle

Thank you for your interest in contributing to Archive Oracle! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/archive-oracle.git
   cd archive-oracle
   ```
3. **Set up the development environment**:
   - Follow the [Getting Started Guide](docs/guides/getting-started.md)
   - Review the [Directory Structure Guide](docs/guides/directory-structure.md) to understand project organization
   - Install dependencies: `npm install`
   - Set up environment variables (see `.env.local.example`)
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Before You Start

- Check existing issues and pull requests to avoid duplicate work
- For major changes, open an issue first to discuss the approach
- Ensure you're working on the latest version of the main branch

### Making Changes

1. **Make your changes** following the code style guidelines
2. **Test your changes**:
   ```bash
   npm run lint      # Check for linting errors
   npm run dev       # Test locally
   ```
3. **Update documentation** if your changes affect:
   - API endpoints (update `docs/api/`)
   - User-facing features (update `docs/guides/`)
   - Architecture (update `docs/architecture/`)

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add new meeting summary export feature
fix: Resolve issue with date formatting in summaries
docs: Update API documentation for upsertMeetingSummary
refactor: Simplify agenda item validation logic
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

## Code Style

### TypeScript/JavaScript

- Use **TypeScript** for new files (`.ts` or `.tsx`)
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

### File Naming Conventions

Follow these naming conventions for consistency:

- **Components**: PascalCase (e.g., `ActionItem.tsx`, `SummaryTemplate.tsx`)
  - Use descriptive names that indicate the component's purpose
  - Match component name with file name
  
- **Utilities**: camelCase (e.g., `getsummaries.js`, `saveAgenda.js`)
  - Use verb-noun pattern: `get*`, `save*`, `update*`, `fetch*`
  - Be descriptive about what the utility does
  
- **Pages**: kebab-case for directories (e.g., `submit-meeting-summary/`)
  - Use descriptive directory names
  - Page files can be `index.tsx` or PascalCase (e.g., `AdminTools.tsx`)
  
- **API Routes**: camelCase (e.g., `getApprovedNames.ts`, `upsertMeetingSummary.ts`)
  - Match endpoint name/purpose
  - Use descriptive names
  
- **Styles**: kebab-case with `.module.css` (e.g., `home.module.css`)
  - Match component name when possible
  - Use descriptive names for shared styles
  
- **Configuration**: camelCase (e.g., `config.ts`, `meetingTypesConfig.ts`)
  - Use descriptive names indicating what is configured

**Avoid**: 
- Generic names like `utils.ts`, `helpers.ts` (be specific)
- Abbreviations unless widely understood
- Names with "2", "old", "backup" (archive instead)

### Code Formatting

- Run `npm run lint` before committing
- The project uses ESLint with Next.js configuration
- Format code consistently with the existing codebase

## Project Structure

See the [Directory Structure Guide](docs/guides/directory-structure.md) for detailed information about the project organization. You may also find the [Getting Started Guide](docs/guides/getting-started.md) helpful for understanding the setup process.

**Key Directories**:
- `/components` - React components
- `/pages` - Next.js pages and API routes
- `/utils` - Utility functions
- `/lib` - Library code (e.g., Supabase client)
- `/docs` - Documentation
- `/types` - TypeScript type definitions

## Submitting Changes

### Pull Request Process

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots if UI changes are involved

3. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes
   - Update your PR as needed

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Code has been tested locally
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation has been updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] No console errors or warnings

## Documentation

### When to Update Documentation

- **API Changes**: Update relevant files in `docs/api/`
- **New Features**: Add user-facing documentation in `docs/guides/`
- **Architecture Changes**: Update `docs/architecture/`
- **Setup Changes**: Update `docs/guides/getting-started.md`

### Documentation Style

- Use clear, concise language
- Include code examples where helpful
- Explain technical terms inline or link to glossary
- Keep documentation up-to-date with code changes

## Technical Terms Glossary

- **Next.js**: React framework for building web applications with server-side rendering
- **TypeScript**: Typed JavaScript that helps catch errors during development
- **Supabase**: Backend-as-a-service platform providing PostgreSQL database and authentication
- **JSONB**: PostgreSQL's binary JSON format for storing structured data
- **OAuth**: Authentication protocol that allows users to log in with third-party services (e.g., Discord)
- **Netlify Functions**: Serverless functions that run on Netlify's infrastructure
- **React**: JavaScript library for building user interfaces with reusable components

## Getting Help

- **Documentation**: Check `docs/` directory for guides and API documentation
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Maintainers**: Contact project maintainers for access or permissions

## Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- GitHub contributors page

Thank you for contributing to Archive Oracle! 🎉
