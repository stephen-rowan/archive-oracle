# Architecture Documentation

This directory contains architecture and design documentation for the Archive Oracle project.

## Overview

Archive Oracle is a Next.js web application that manages meeting summaries with integrations to Supabase (database), Discord (authentication), GitHub (repository operations), and Google Docs (document generation).

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (React UI)    │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │
┌────────▼─────────────────────────────────────┐
│         Next.js Application                  │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages      │  │   API Routes      │   │
│  │  (Frontend)  │  │   (Backend)       │   │
│  └──────┬───────┘  └────────┬───────────┘   │
│         │                    │                │
│  ┌──────▼────────────────────▼──────────┐   │
│  │      React Components                 │   │
│  │  (ActionItem, DecisionItem, etc.)     │   │
│  └───────────────────────────────────────┘   │
└────────┬─────────────────────────────────────┘
         │
         │ API Calls
         │
┌────────▼──────────┐  ┌──────────────┐  ┌─────────────┐
│    Supabase       │  │   Discord    │  │   GitHub   │
│  (Database + Auth)│  │     API      │  │     API    │
└───────────────────┘  └──────────────┘  └─────────────┘
```

### Component Architecture

#### Frontend Components

- **Page Components** (`pages/`): Next.js pages that define routes
- **React Components** (`components/`): Reusable UI components
  - Meeting-related components (`components/meeting/`)
  - Display components (ActionItem, DecisionItem, ArchiveSummaries)
  - Form components (SelectNames, SelectTags, SubmitMissingSummary)
  - Template components (SummaryTemplate, SummaryMeetingInfo, SummaryAgendaItems)

#### Backend API Routes

- **API Endpoints** (`pages/api/`): Next.js API routes
  - Data retrieval endpoints (getApprovedNames, getMeetingSummaries)
  - Data mutation endpoints (upsertMeetingSummary, updateCSV)
  - Integration endpoints (discord, issues, commitGitbook, createGoogleDoc)

#### Data Layer

- **Database**: Supabase PostgreSQL
  - Tables: `meetingsummaries`, `workgroups`, `users`, `names`
  - JSONB storage for flexible meeting summary structure
- **External Services**:
  - Discord: Authentication and role management
  - GitHub: Repository operations and issue tracking
  - Google Docs: Document generation

### Code Relationships

#### Component Dependencies

```
SummaryTemplate.tsx
├── SummaryMeetingInfo.tsx
├── SummaryAgendaItems.tsx
│   ├── ActionItem.tsx
│   └── DecisionItem.tsx
├── WorkingDocs.tsx
└── TimestampedVideo.tsx
```

#### API Route Usage

- `getApprovedNames.ts` → Used by components needing contributor names
- `upsertMeetingSummary.ts` → Used by meeting summary submission forms
- `userRoles.ts` → Used by components checking user permissions

#### Utility Functions

- `utils/getsummaries.js` → Used by pages displaying summaries
- `utils/saveAgenda.js` → Used by agenda management features
- `utils/exportUtils.ts` → Used by export functionality
- `lib/supabaseClient.js` → Used throughout application for database access

## Data Flow

### Meeting Summary Submission Flow

1. User fills out form on `/submit-meeting-summary`
2. Form data validated client-side
3. POST request to `/api/upsertMeetingSummary`
4. API route validates and processes data
5. Data stored in Supabase `meetingsummaries` table (JSONB format)
6. Response returned to client
7. UI updated to reflect success/error

### Data Retrieval Flow

1. Component/page needs data
2. API call to appropriate endpoint (e.g., `/api/getApprovedNames`)
3. API route queries Supabase database
4. Data formatted and returned
5. Component receives data and renders UI

## External Integrations

### Supabase Integration

- **Purpose**: Database and authentication
- **Usage**: All database operations go through Supabase client (`lib/supabaseClient.js`)
- **Tables Used**:
  - `meetingsummaries`: Meeting summary data
  - `workgroups`: Workgroup configurations
  - `users`: User accounts and roles
  - `names`: Approved contributor names

### Discord Integration

- **Purpose**: Authentication (OAuth) and role management
- **Usage**: User authentication via Discord OAuth, role checking via API
- **Endpoints**: `pages/api/discord.ts`

### GitHub Integration

- **Purpose**: Repository operations, issue tracking, CSV updates
- **Usage**: GitHub API via `@octokit/rest` library
- **Endpoints**: `pages/api/issues.js`, `pages/api/updateCSV.js`, `pages/api/commitGitbook.ts`
- **Utilities**: `utils/githubUtils.ts`

### Google Docs Integration

- **Purpose**: Document generation and management
- **Usage**: Google APIs via `googleapis` library
- **Endpoints**: `pages/api/createGoogleDoc.js`
- **Utilities**: `utils/markdownToGoogleDocs.js`

## Deployment Architecture

### Netlify Deployment

- **Hosting**: Static site hosting for Next.js application
- **Serverless Functions**: Netlify Functions for batch operations
  - `batchUpdateMeetingSummariesArray.js`
  - `batchUpdateMeetingSummariesById.js`
- **Build Process**: `npm run build` → `.next` directory
- **Configuration**: `netlify.toml`

### GitHub Actions

- **Purpose**: Automated workflows
- **Workflow**: `.github/workflows/commit-meeting-summaries.yml`
- **Function**: Daily updates to meeting summaries via Netlify functions

## Security Considerations

- **API Authentication**: API endpoints require API keys
- **Environment Variables**: Sensitive data stored in environment variables
- **CORS**: Configured for cross-origin requests
- **Supabase RLS**: Row-level security policies in Supabase database

## Related Documentation

- [Directory Structure Guide](../guides/directory-structure.md): Detailed file organization
- [API Documentation](../api/): API endpoint specifications
- [Getting Started Guide](../guides/getting-started.md): Setup instructions
