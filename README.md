# Archive Oracle

Archive Oracle is a web application for managing and archiving meeting summaries, built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/).

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Glossary](#glossary)
- [Configuration](#configuration)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 20.3.1 or higher) - JavaScript runtime environment
- **npm** (comes with Node.js) - Package manager for JavaScript
- **Git** - Version control system

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/archive-oracle.git
   cd archive-oracle
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SERVER_API_KEY=your_server_api_key
   DISCORD_BOT_TOKEN=your_discord_bot_token
   ```

4. **⚠️ Verify Supabase project connection** (IMPORTANT):
   
   This repository is configured to connect **ONLY** to the test Supabase project. Before proceeding, verify you're connected to the correct project:
   
   **a. Verify project connection:**
   ```bash
   # Using npm (recommended)
   npm run verify:project
   
   # Or directly
   ./scripts/verify-supabase-project.sh
   ```
   
   This script checks that the repository is linked to the test project (`lhpdnxaqydoeyqmbffow`). If it fails, you'll see instructions to fix it.
   
   **b. Verify database structure:**
   ```bash
   # Using npm (recommended)
   npm run verify:data
   
   # Or directly
   ./scripts/verify-supabase-data.sh
   ```
   
   **Run both verifications at once:**
   ```bash
   npm run verify
   ```
   
   This script verifies that all required database tables exist:
   - `workgroups` - Workgroup configurations
   - `meetingsummaries` - Meeting summary data
   - `names` - Approved contributor names
   - `tags` - Meeting tags
   
   If tables are missing, run migrations:
   ```bash
   supabase db push
   ```
   
   **Expected test project:**
   - **Project Reference ID:** `lhpdnxaqydoeyqmbffow`
   - **Project Name:** `archive-oracle`
   - **Region:** West EU (Ireland)
   - **Purpose:** Test/Development environment only
   
   ⚠️ **DO NOT** proceed if verification fails. Connecting to the wrong project could affect production data.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

For detailed setup instructions, including how to obtain API keys and configure external services, see the [Getting Started Guide](docs/guides/getting-started.md).

### Quick Start

After installation, you can:
- View meeting summaries on the homepage
- Submit new meeting summaries via `/submit-meeting-summary`
- Access admin tools at `/admin-tools`
- Review API documentation in `docs/api/`

## Architecture Overview

Archive Oracle is built using modern web technologies and follows a component-based architecture.

### Technology Stack

- **Next.js 14.2.8**: React framework providing server-side rendering, routing, and API routes
- **React 18.2.0**: JavaScript library for building user interfaces with reusable components
- **TypeScript 5.1.3**: Typed JavaScript that helps catch errors during development
- **Supabase**: Backend-as-a-service platform providing:
  - PostgreSQL database (stores meeting summaries, workgroups, users)
  - Authentication (Discord OAuth integration)
  - Real-time capabilities
- **Netlify**: Hosting platform providing:
  - Static site hosting
  - Serverless functions (Netlify Functions)
  - Continuous deployment

### System Components

1. **Frontend (Next.js Pages)**
   - User interface built with React components
   - Pages for viewing, submitting, and managing meeting summaries
   - Client-side routing and state management

2. **API Routes (`pages/api/`)**
   - RESTful API endpoints for data operations
   - Authentication and authorization
   - Integration with external services (Discord, GitHub, Google Docs)

3. **Database (Supabase PostgreSQL)**
   - `meetingsummaries` table: Stores meeting summary data in JSONB format
   - `workgroups` table: Defines workgroup configurations and templates
   - `users` table: User accounts and roles
   - `names` table: Approved contributor names

4. **Serverless Functions (Netlify Functions)**
   - Batch operations for updating meeting summaries
   - Scheduled tasks and automation

5. **External Integrations**
   - Discord: Authentication and role management
   - GitHub: Repository operations and issue tracking
   - Google Docs: Document generation and management

For detailed architecture documentation, see [docs/architecture/](docs/architecture/). For directory structure, see [docs/guides/directory-structure.md](docs/guides/directory-structure.md).

## API Documentation

Archive Oracle provides RESTful API endpoints for programmatic access to meeting summary data.

### Available Endpoints

- **GET `/api/getApprovedNames`**: Fetch approved contributor names
  - See [API Documentation](docs/api/getApprovedNames.md) for details

- **POST `/api/upsertMeetingSummary`**: Create or update meeting summaries
  - See [API Documentation](docs/api/upsertMeetingSummary.md) for details

### Authentication

API endpoints require authentication using an API key passed in the request header:
- Header: `api_key: YOUR_SERVER_API_KEY` or `x-api-key: YOUR_SERVER_API_KEY`

### Full API Documentation

Complete API documentation is available in the [`docs/api/`](docs/api/) directory:
- [Get Approved Names API](docs/api/getApprovedNames.md)
- [Upsert Meeting Summary API](docs/api/upsertMeetingSummary.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code style and conventions
- Development process
- Submitting pull requests
- Documentation standards

### Quick Links

- [Getting Started Guide](docs/guides/getting-started.md) - Setup instructions
- [Directory Structure Guide](docs/guides/directory-structure.md) - Project organization
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute

## Glossary

This glossary explains technical terms used throughout the project:

- **Next.js**: React framework that provides server-side rendering, file-based routing, and API routes. It simplifies building React applications with built-in optimizations.

- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript. It adds static type checking to help catch errors during development.

- **Supabase**: A backend-as-a-service (BaaS) platform that provides a PostgreSQL database, authentication, real-time subscriptions, and storage. It's an open-source alternative to Firebase.

- **PostgreSQL**: An open-source relational database management system. Supabase uses PostgreSQL as its underlying database engine.

- **JSONB**: PostgreSQL's binary JSON format for storing structured data. It allows efficient storage and querying of JSON documents in the database.

- **OAuth**: An authentication protocol that allows users to log in with third-party services (like Discord) without sharing their passwords. The application uses Discord OAuth for user authentication.

- **Netlify Functions**: Serverless functions that run on Netlify's infrastructure. They allow you to run backend code without managing servers, similar to AWS Lambda.

- **React**: A JavaScript library for building user interfaces. It uses a component-based architecture where UI is built from reusable components.

- **UUID**: Universally Unique Identifier - a 128-bit identifier used to uniquely identify entities (users, workgroups, meetings) in the database.

- **CORS**: Cross-Origin Resource Sharing - a security mechanism that allows web pages to make requests to a different domain than the one serving the web page.

- **API Key**: A secret token used to authenticate API requests and ensure only authorized clients can access endpoints.

- **Serverless**: A cloud computing model where code runs in stateless functions that are automatically managed by the cloud provider, eliminating the need to manage servers.

## Configuration

### ⚠️ Test Project Configuration

**IMPORTANT:** This repository is configured to connect **ONLY** to the test Supabase project. See [supabase/TEST_PROJECT.md](supabase/TEST_PROJECT.md) for details.

**Quick verification commands:**
```bash
# Verify project connection
npm run verify:project

# Verify database structure
npm run verify:data

# Run both verifications
npm run verify
```

### Discord OAuth Setup

This application uses Supabase for authentication with Discord OAuth. To enable Discord sign-in, you need to configure it in both Discord and Supabase:

#### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to **OAuth2** → **General**
4. Copy your **Client ID** and **Client Secret** (you'll need these for Supabase)
5. Under **Redirects**, add your Supabase callback URL:
   - Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference

#### 2. Enable Discord Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Discord** in the list of providers and click to configure
5. Enable the Discord provider
6. Enter your Discord **Client ID** and **Client Secret** from step 1
7. Save the configuration

#### 3. Environment Variables

Make sure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

After completing these steps, Discord sign-in should work correctly.

### Adding Workgroup Data

Workgroups are stored in the Supabase `workgroups` table and define the configuration for different meeting groups. There are several ways to add workgroup data:

#### Method 1: Through the UI (Recommended)

1. Navigate to the **Submit Meeting Summary** page (`/submit-meeting-summary`)
2. Click on the workgroup selector dropdown
3. Select **"Add New Workgroup"** or type a new workgroup name
4. Enter the workgroup name and click to register it
5. The system will automatically create the workgroup with default template settings

#### Method 2: Directly in Supabase Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Table Editor** → **workgroups**
4. Click **Insert** → **Insert row**
5. Fill in the required fields:
   - `workgroup` (text): The name of the workgroup (e.g., "Archives Workgroup")
   - `workgroup_id` (UUID): Will be auto-generated if left empty
   - `preferred_template` (JSON): Template configuration (see structure below)
   - `last_meeting_id` (optional): Reference to the last meeting

**Default Template Structure:**
```json
{
  "workgroup": "Your Workgroup Name",
  "workgroup_id": "",
  "meetingInfo": {
    "name": 1,
    "date": 1,
    "host": 1,
    "documenter": 1,
    "peoplePresent": 1,
    "purpose": 1,
    "townHallNumber": 0,
    "googleSlides": 0,
    "meetingVideoLink": 1,
    "miroBoardLink": 0,
    "otherMediaLink": 0,
    "transcriptLink": 1,
    "mediaLink": 0,
    "workingDocs": 1,
    "timestampedVideo": 0
  },
  "agendaItems": [{
    "agenda": 0,
    "status": 0,
    "narrative": 0,
    "townHallUpdates": 0,
    "townHallSummary": 0,
    "meetingTopics": 0,
    "issues": 0,
    "actionItems": 1,
    "decisionItems": 1,
    "discussionPoints": 1,
    "gameRules": 0,
    "learningPoints": 0
  }],
  "tags": 1,
  "type": "Custom",
  "noSummaryGiven": false,
  "canceledSummary": false
}
```

**Note:** In the template, `1` means the field is enabled/required, and `0` means it's disabled/optional.

#### Method 3: Programmatically

You can use the `updateWorkgroups` utility function in your code:

```javascript
import { updateWorkgroups } from '../utils/updateWorkgroups';

// Add a new workgroup
await updateWorkgroups({ 
  workgroup: "New Workgroup Name" 
});
```

This will automatically create the workgroup with default template settings. The `workgroup_id` will be auto-generated by Supabase.

### Data Templates Overview

The application uses several types of templates and data structures:

#### 1. Workgroup Preferred Templates (`preferred_template`)

Stored in the `workgroups` table, these templates control which fields are enabled/visible for each workgroup. Each template has two main sections:

**Meeting Info Fields:**
- `name` - Meeting type/name (Weekly, Monthly, etc.)
- `date` - Meeting date
- `host` - Meeting host
- `documenter` - Person documenting the meeting
- `peoplePresent` - List of attendees
- `purpose` - Meeting purpose
- `townHallNumber` - Town hall number (for town halls)
- `googleSlides` - Link to Google Slides
- `meetingVideoLink` - Link to meeting video
- `miroBoardLink` - Link to Miro board
- `otherMediaLink` - Other media links
- `transcriptLink` - Link to transcript
- `mediaLink` - Additional media link
- `workingDocs` - Array of working documents (title + link)
- `timestampedVideo` - Object with video URL, intro, and timestamps

**Agenda Item Fields:**
- `agenda` - Agenda title
- `status` - Status (carry over, resolved)
- `narrative` - Narrative description
- `townHallUpdates` - Town hall updates
- `townHallSummary` - Town hall summary
- `meetingTopics` - Array of meeting topics
- `issues` - Array of issues
- `actionItems` - Array of action items (text, assignee, dueDate, status)
- `decisionItems` - Array of decision items (decision, rationale, opposing, effect)
- `discussionPoints` - Array of discussion points
- `gameRules` - Game rules (for gamified meetings)
- `learningPoints` - Array of learning points

**Tags:**
- `topicsCovered` - Topics covered in the meeting
- `emotions` - Emotional tone
- `other` - Other tags
- `gamesPlayed` - Games played (if applicable)

#### 2. Meeting Type Configurations

Defined in `config/meeting/meetingTypesConfig.ts`, these control which meeting types are available for each workgroup:

**Default Meeting Types:**
- Weekly
- Biweekly
- Monthly
- One-off event

**Workgroup-Specific Types:**
- **AI Sandbox/Think-tank**: Sandbox, Think-Tank

To add custom meeting types for a workgroup, edit `config/meeting/meetingTypesConfig.ts`:

```typescript
export const meetingTypesConfig: WorkgroupMeetingTypes = {
  default: {
    defaultType: 'Weekly',
    types: [
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Biweekly', label: 'Biweekly' },
      { value: 'Monthly', label: 'Monthly' },
      { value: 'One-off event', label: 'One-off event' },
    ]
  },
  'Your Workgroup Name': {
    defaultType: 'Weekly',
    types: [
      { value: 'CustomType1', label: 'Custom Type 1' },
      { value: 'CustomType2', label: 'Custom Type 2' },
    ]
  }
};
```

#### 3. Summary Form Data Structure

The complete meeting summary data structure (defined in `types/summaryFormData.schema.json`) includes:

- **Workgroup Info**: `workgroup` (name), `workgroup_id` (UUID)
- **Meeting Info**: All the fields listed in the preferred template
- **Agenda Items**: Array of agenda items with all their fields
- **Tags**: Topics, emotions, games, etc.
- **Type**: Currently only "Custom" or "custom"
- **Flags**: `noSummaryGiven`, `canceledSummary` with customizable text

#### 4. Action Item Status Options

Action items can have the following statuses:
- `todo`
- `in progress`
- `done`
- `cancelled`

#### 5. Decision Item Effect Options

Decision items can have the following effect values:
- `""` (empty)
- `affectsOnlyThisWorkgroup`
- `mayAffectOtherPeople`

#### 6. Agenda Item Status Options

Agenda items can have the following statuses:
- `carry over`
- `resolved`

### Database Schema: The `summary` Column

The `summary` column in the `meetingsummaries` table is a **JSONB** column that stores the complete meeting summary data structure. This column contains all the meeting information, agenda items, tags, and metadata.

#### Table: `meetingsummaries`

**Key Columns:**
- `meeting_id` (UUID, primary key)
- `name` (text) - Meeting type/name
- `date` (timestamp) - Meeting date
- `workgroup_id` (UUID) - Reference to workgroup
- `user_id` (UUID) - User who created/updated the summary
- `template` (text) - Template type (usually "custom")
- `summary` (JSONB) - **Complete meeting summary data** (see structure below)
- `updated_at` (timestamp) - Last update time

**Unique Constraint:** `(name, date, workgroup_id, user_id)`

#### The `summary` Column Structure

The `summary` JSONB column contains the following structure:

```json
{
  "workgroup": "Ambassador Town Hall",
  "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
  "meetingInfo": {
    "name": "Weekly",
    "date": "2025-09-10",
    "host": "John Doe",
    "documenter": "Jane Smith",
    "translator": "Bob Wilson",
    "peoplePresent": "John Doe, Jane Smith, Bob Wilson, Alice",
    "purpose": "Weekly update and planning",
    "townHallNumber": "TH-042",
    "googleSlides": "https://slides.example.com/presentation",
    "meetingVideoLink": "https://video.example.com/watch?v=123",
    "miroBoardLink": "https://miro.com/app/board/xyz",
    "otherMediaLink": "https://example.com/media",
    "transcriptLink": "https://example.com/transcript",
    "mediaLink": "https://example.com/media/extra",
    "workingDocs": [
      {
        "title": "Agenda",
        "link": "https://docs.example.com/agenda"
      },
      {
        "title": "Notes",
        "link": "https://docs.example.com/notes"
      }
    ],
    "timestampedVideo": {
      "url": "https://youtube.com/watch?v=abcd",
      "intro": "Welcome, agenda overview",
      "timestamps": "00:00 Intro\n02:15 Topic A\n10:45 Decisions"
    }
  },
  "agendaItems": [
    {
      "agenda": "Review last week and plan",
      "status": "carry over",
      "townHallUpdates": "Updates from last Town Hall.",
      "townHallSummary": "Summary of decisions.",
      "narrative": "We discussed project milestones.",
      "meetingTopics": ["Budget", "Hiring"],
      "issues": ["Blocked on API access"],
      "actionItems": [
        {
          "text": "Draft budget proposal",
          "assignee": "Alice",
          "dueDate": "2025-09-20",
          "status": "in progress"
        }
      ],
      "decisionItems": [
        {
          "decision": "Adopt weekly standups",
          "rationale": "Improve coordination",
          "opposing": "May increase meeting load",
          "effect": "affectsOnlyThisWorkgroup"
        }
      ],
      "discussionPoints": ["Integration approach"],
      "learningPoints": ["Tool X setup"]
    }
  ],
  "tags": {
    "topicsCovered": "inclusivity, transparency",
    "emotions": "cheerful",
    "other": "",
    "gamesPlayed": "Chess"
  },
  "type": "custom",
  "noSummaryGiven": false,
  "canceledSummary": false,
  "noSummaryGivenText": "No Summary Given",
  "canceledSummaryText": "Meeting was cancelled"
}
```

#### Key Fields in `summary.meetingInfo`

- **`host`** - Facilitator name (displayed as "Facilitator" in UI)
- **`documenter`** - Person documenting the meeting
- **`translator`** - Translator (if applicable)
- **`peoplePresent`** - Comma-separated list of attendees
- **`workingDocs`** - Array of objects with `title` and `link`
- **`timestampedVideo`** - Object with `url`, `intro`, and `timestamps` (string)

#### Querying the `summary` Column

**PostgreSQL/Supabase JSON Queries:**

```sql
-- Get facilitator (host) from a meeting summary
SELECT summary->'meetingInfo'->>'host' as facilitator
FROM meetingsummaries
WHERE meeting_id = 'your-meeting-id';

-- Get all action items
SELECT summary->'agendaItems'->0->'actionItems' as action_items
FROM meetingsummaries
WHERE meeting_id = 'your-meeting-id';

-- Filter by workgroup in summary
SELECT *
FROM meetingsummaries
WHERE summary->>'workgroup' = 'Ambassador Town Hall';

-- Get meetings with specific facilitator
SELECT *
FROM meetingsummaries
WHERE summary->'meetingInfo'->>'host' = 'John Doe';
```

**JavaScript/TypeScript Access:**

```javascript
// Access facilitator
const facilitator = summary.meetingInfo.host;

// Access action items from first agenda item
const actionItems = summary.agendaItems[0].actionItems;

// Access working docs
const workingDocs = summary.meetingInfo.workingDocs;
```

#### Notes

- The `summary` column stores the complete meeting data as JSON, allowing flexible querying
- All meeting content (except metadata like `date`, `name`, `workgroup_id`) is stored in this column
- The structure matches the `summaryFormData` schema defined in `types/summaryFormData.schema.json`
- When updating, the entire `summary` object is typically replaced (upserted)

## Additional Resources

### Documentation

- [Getting Started Guide](docs/guides/getting-started.md) - Detailed setup and installation
- [Directory Structure Guide](docs/guides/directory-structure.md) - Understanding the project organization
- [API Documentation](docs/api/) - Complete API reference
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project

### External Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Supabase platform documentation
- [React Documentation](https://react.dev/) - React library documentation
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript language reference

## Deployment

This application is deployed on **Netlify**, which provides:
- Automatic deployments from Git
- Serverless function hosting
- CDN for static assets
- Environment variable management

For deployment configuration, see `netlify.toml` in the repository root.

Archive data last updated at - 2025-12-05 01:06:20 UTC
