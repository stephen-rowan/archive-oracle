# Directory Structure Guide

This guide explains the purpose and organization of each major directory in the Archive Oracle repository.

## Root Level Files

- **README.md**: Main project documentation with overview, setup, and key information
- **CONTRIBUTING.md**: Guidelines for contributing to the project
- **package.json**: Project dependencies and npm scripts
- **tsconfig.json**: TypeScript configuration
- **next.config.js**: Next.js framework configuration
- **netlify.toml**: Netlify deployment configuration
- **.gitignore**: Files and directories ignored by Git

## Main Directories

### `/components`

**Purpose**: React components that make up the user interface

**Structure**:
- `meeting/`: Components related to meeting functionality
  - `MeetingTypeSelect.tsx`: Dropdown for selecting meeting types
- `ActionItem.tsx`: Component for displaying action items
- `DecisionItem.tsx`: Component for displaying decision items
- `ArchiveSummaries.tsx`: Component for displaying archived summaries
- `Item.tsx`: Generic item component
- `SelectNames.tsx`: Component for selecting contributor names
- `SelectTags.tsx`: Component for selecting tags
- `SubmitMissingSummary.tsx`: Component for submitting missing summaries
- `SummaryAgendaItems.tsx`: Component for displaying agenda items in summaries
- `SummaryMeetingInfo.tsx`: Component for displaying meeting information
- `SummaryTemplate.tsx`: Template for meeting summaries
- `Tags.tsx`: Component for tag management
- `TimestampedVideo.tsx`: Component for timestamped video display
- `WorkingDocs.tsx`: Component for working documents display
- `nav.tsx`: Navigation component

**Usage**: These components are imported and used in pages and other components throughout the application. Components follow React best practices and use TypeScript for type safety.

**Component Relationships**:
- `SummaryTemplate.tsx` uses `SummaryMeetingInfo.tsx` and `SummaryAgendaItems.tsx`
- `SummaryAgendaItems.tsx` uses `ActionItem.tsx` and `DecisionItem.tsx`
- `SummaryTemplate.tsx` uses `WorkingDocs.tsx` and `TimestampedVideo.tsx`
- Multiple components use `SelectNames.tsx` and `SelectTags.tsx` for form inputs

### `/pages`

**Purpose**: Next.js pages and API routes

**Structure**:
- `api/`: API endpoint handlers (Next.js API routes)
  - `getApprovedNames.ts`: API endpoint for fetching approved contributor names
    - **Documentation**: [Get Approved Names API](../api/getApprovedNames.md)
    - **Used by**: Components that need to display or select contributor names
  - `upsertMeetingSummary.ts`: API endpoint for creating/updating meeting summaries
    - **Documentation**: [Upsert Meeting Summary API](../api/upsertMeetingSummary.md)
    - **Used by**: Meeting summary submission forms and update workflows
  - `userRoles.ts`: API endpoint for fetching user roles from Supabase database
    - **Used by**: Components that need to check user permissions and roles
  - `discord.ts`: Discord integration endpoints for Discord API operations
  - `fetchDocs.js`: Endpoint for fetching documents from external sources
  - `fetchCsv.js`: Endpoint for fetching CSV data
  - `getMeetingSummaries.js`: Endpoint for retrieving meeting summaries
  - `issues.js`: Endpoint for GitHub issues integration
  - `updateCSV.js`: Endpoint for updating CSV files in GitHub
  - `commitGitbook.ts`: Endpoint for committing changes to GitBook
  - `convertToPdf.js`: Endpoint for converting documents to PDF
  - `createGoogleDoc.js`: Endpoint for creating Google Docs
  
  **Note**: Previously, `userRoles2.ts` existed as an alternative implementation using Discord API directly. It has been archived to `archive/code/userRoles2.ts` as it was not referenced in the codebase.
  
  **API Route Pattern**: In Next.js, files in `pages/api/` automatically become API endpoints. For example, `pages/api/getApprovedNames.ts` is accessible at `/api/getApprovedNames`.
- `submit-meeting-summary/`: Page for submitting meeting summaries
- `update-gitbook/`: Page for updating GitBook documentation
- `admin-tools.tsx`: Administrative tools page
- `contact.tsx`: Contact page
- `index.tsx`: Homepage
- `issues.tsx`: Issues page
- `status-of-summaries.tsx`: Status page for meeting summaries

**Note**: In Next.js, files in the `pages` directory automatically become routes. Files in `pages/api/` become API endpoints.

### `/utils`

**Purpose**: Utility functions and helper code

**Key Files**:
- `getsummaries.js`: Functions for retrieving meeting summaries
- `getArchives.js`: Functions for retrieving archived content
- `getDocs.js`: Functions for fetching documents
- `saveAgenda.js`: Functions for saving agenda items
- `saveArchivesToDatabase.js`: Functions for saving archives to database
- `exportUtils.ts`: Export utility functions
- `githubUtils.ts`: GitHub API integration utilities
- `updateGitbook.js`: GitBook update utilities
- `prepareFormDataForSave.ts`: Data preparation utilities
- And more...

**Usage**: These utilities are imported and used throughout the application for common operations.

### `/lib`

**Purpose**: Library code and external service clients

**Key Files**:
- `supabaseClient.js`: Supabase client configuration and initialization
  - **What is Supabase**: Supabase is a backend-as-a-service platform that provides a PostgreSQL database, authentication, and other backend services

**Usage**: Import the Supabase client to interact with the database and authentication services.

### `/styles`

**Purpose**: CSS module files for component styling

**Structure**: Each component typically has a corresponding CSS module file (e.g., `home.module.css` for the home page styles)

**Naming Convention**: Files follow the pattern `[component-name].module.css`

### `/config`

**Purpose**: Configuration files and constants

**Key Files**:
- `config.ts`: Main configuration file
  - Contains table names, API endpoints, and other configuration constants

**Usage**: Import configuration values to avoid hardcoding throughout the application.

### `/types`

**Purpose**: TypeScript type definitions

**Key Files**:
- `meeting.ts`: Type definitions for meeting-related data structures
- `summaryFormData.schema.json`: JSON schema for meeting summary form data

**Usage**: These types ensure type safety and provide IntelliSense in your code editor.

### `/netlify`

**Purpose**: Netlify serverless functions

**Structure**:
- `functions/`: Netlify serverless functions
  - `batchUpdateMeetingSummariesArray.js`: Batch update function for meeting summaries array
  - `batchUpdateMeetingSummariesById.js`: Batch update function for meeting summaries by ID
  - `singleCallUpdateMeetingSummariesArray.js`: Single call update function

**What are Netlify Functions**: Serverless functions that run on Netlify's infrastructure, allowing you to run backend code without managing servers.

### `/docs`

**Purpose**: Project documentation

**Structure**:
- `guides/`: User guides and tutorials
  - `getting-started.md`: Setup and installation guide
  - `directory-structure.md`: This file
- `api/`: API documentation
  - `getApprovedNames.md`: API documentation for getApprovedNames endpoint
  - `upsertMeetingSummary.md`: API documentation for upsertMeetingSummary endpoint
- `architecture/`: Architecture and design documentation
- `contributing/`: Contribution guidelines and maintenance documentation

### `/archive`

**Purpose**: Archived files that are no longer actively used but preserved for historical reference

**Structure**:
- `docs/`: Archived documentation files (currently empty)
- `code/`: Archived code files
  - `userRoles2.ts`: Archived alternative implementation of user roles endpoint
    - **Original Location**: `pages/api/userRoles2.ts`
    - **Archived**: 2025-01-23
    - **Reason**: Alternative implementation using Discord API directly, not referenced in codebase
    - **Replacement**: Use `pages/api/userRoles.ts` which fetches roles from Supabase database
  - `oldtesting.tsx`: Archived outdated test file
    - **Original Location**: `pages/oldtesting.tsx`
    - **Archived**: 2025-01-23
    - **Reason**: Outdated test code from initial development, proper test structure should be established
    - **Replacement**: N/A - test functionality should be moved to proper test files in a dedicated test directory

**Archive Guidelines**:
- Files are archived using `git mv` to preserve git history
- Each archived file includes a deprecation notice at the top explaining:
  - Why it was archived
  - When it was archived
  - What replaced it (if applicable)
- Archived files are not imported or referenced by active code
- Archive directory is organized by type (`docs/`, `code/`) for easy navigation

**Note**: Files in the archive directory are preserved for historical reference but are not part of the active codebase. Do not import or reference archived files in new code.

### Test Files

**Current Status**: The project does not have a formal test directory structure. Test files are not currently organized in a dedicated test directory.

**Test-Related Files**:
- `pages/oldtesting.tsx` has been archived to `archive/code/oldtesting.tsx` as it was outdated test code

**Recommendation**: Consider establishing a test directory structure (e.g., `__tests__/` or `tests/`) for future test organization.

### `/.github`

**Purpose**: GitHub-specific configuration

**Structure**:
- `workflows/`: GitHub Actions workflow files
  - `commit-meeting-summaries.yml`: Automated workflow for committing meeting summaries

**What are GitHub Actions**: Automated workflows that run on GitHub, such as running tests, deploying code, or updating documentation.

### `/.specify`

**Purpose**: Specification tooling and templates for feature development

## File Naming Conventions

- **Components**: PascalCase (e.g., `ActionItem.tsx`)
- **Utilities**: camelCase (e.g., `getsummaries.js`)
- **Pages**: kebab-case for directories, PascalCase for files (e.g., `submit-meeting-summary/index.tsx`)
- **Styles**: kebab-case with `.module.css` extension (e.g., `home.module.css`)
- **Config**: camelCase (e.g., `config.ts`)

## Understanding the Tech Stack

- **Next.js**: React framework that provides server-side rendering, routing, and API routes
- **TypeScript**: Typed JavaScript that helps catch errors during development
- **React**: Library for building user interfaces with components
- **Supabase**: Backend platform providing database (PostgreSQL) and authentication
- **Netlify**: Hosting platform that provides serverless functions and static site hosting

## Related Documentation

- [Getting Started Guide](./getting-started.md): Setup and installation instructions
- [API Documentation](../api/): API endpoint documentation
  - [Get Approved Names API](../api/getApprovedNames.md)
  - [Upsert Meeting Summary API](../api/upsertMeetingSummary.md)
- [Architecture Documentation](../architecture/): System architecture and design decisions
- [Contributing Guidelines](../../CONTRIBUTING.md): How to contribute to the project
- [README.md](../../README.md): Main project documentation
