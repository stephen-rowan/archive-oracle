# Data Model: Generate Test Seed Data Tool

**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts  
**Purpose**: Document entity relationships and data transformations

## Input Data Structure

### JSON Input Format

The tool accepts a JSON file containing an array of meeting summary objects:

```json
[
  {
    "workgroup": "Ambassador Town Hall",
    "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    "meetingInfo": { ... },
    "agendaItems": [ ... ],
    "tags": { ... },
    "type": "custom"
  },
  ...
]
```

### Key JSON Entities

1. **Meeting Summary Object** (root level)
   - `workgroup` (string): Workgroup name
   - `workgroup_id` (UUID string): Workgroup identifier
   - `meetingInfo` (object): Meeting metadata
   - `agendaItems` (array): Array of agenda item objects
   - `tags` (object): Tags object with topicsCovered, emotions, etc.
   - `type` (string): Meeting type (typically "custom")

2. **Meeting Info Object** (`meetingInfo`)
   - `name` (string): Meeting name/type
   - `date` (string): Meeting date (ISO format: "YYYY-MM-DD")
   - `host` (string): Facilitator name
   - `documenter` (string): Documenter name
   - `translator` (string, optional): Translator name
   - `peoplePresent` (string): Comma-separated list of attendee names
   - `workingDocs` (array): Array of {title, link} objects
   - `timestampedVideo` (object): Video metadata with url, intro, timestamps

3. **Agenda Item Object** (`agendaItems[]`)
   - `agenda` (string): Agenda topic
   - `status` (string): "carry over" or "resolved"
   - `narrative` (string): Narrative text
   - `discussion` (string): Discussion text
   - `actionItems` (array): Array of action item objects
   - `decisionItems` (array): Array of decision item objects
   - `meetingTopics` (array): Array of topic strings
   - `issues` (array): Array of issue strings
   - Various other fields (townHallUpdates, townHallSummary, etc.)

4. **Action Item Object** (`agendaItems[].actionItems[]`)
   - `text` (string): Action item description
   - `assignee` (string): Assignee name
   - `dueDate` (string): Due date
   - `status` (string): "todo", "in progress", "done", "cancelled"

5. **Decision Item Object** (`agendaItems[].decisionItems[]`)
   - `decision` (string): Decision text
   - `rationale` (string): Rationale
   - `opposing` (string): Opposing views
   - `effect` (string): "affectsOnlyThisWorkgroup", "mayAffectOtherPeople", or ""

6. **Tags Object** (`tags`)
   - `topicsCovered` (string): Comma-separated topics
   - `emotions` (string): Comma-separated emotions
   - `other` (string): Other tags
   - `gamesPlayed` (string): Games played

## Database Schema Entities

### Primary Tables (from schema.sql)

1. **workgroups**
   - `workgroup_id` (UUID, PK): Primary key
   - `workgroup` (text): Workgroup name
   - `created_at` (timestamp): Creation timestamp
   - `user_id` (UUID): User who created workgroup
   - `preferred_template` (json): Template configuration
   - **Unique Constraint**: `workgroup_id` (primary key)

2. **meetingsummaries**
   - `meeting_id` (UUID, PK): Primary key
   - `name` (text): Meeting name/type
   - `date` (timestamp): Meeting date
   - `workgroup_id` (UUID, FK → workgroups): Foreign key to workgroup
   - `user_id` (UUID): User who created summary
   - `template` (text): Template type
   - `summary` (json): Complete meeting summary JSONB
   - `confirmed` (boolean): Confirmation status
   - `created_at` (timestamp): Creation timestamp
   - `updated_at` (timestamp): Update timestamp
   - **Unique Constraint**: `(name, date, workgroup_id, user_id)`

3. **names**
   - `id` (bigint, PK): Primary key (auto-increment)
   - `name` (text): Person name
   - `user_id` (UUID): User who added name
   - `approved` (boolean): Approval status
   - `created_at` (timestamp): Creation timestamp
   - **Unique Constraint**: `name`

4. **tags**
   - `id` (bigint, PK): Primary key (auto-increment)
   - `tag` (text): Tag text
   - `type` (text): Tag type (e.g., "topicsCovered", "emotions")
   - `user_id` (UUID): User who added tag
   - `created_at` (timestamp): Creation timestamp
   - **Unique Constraint**: `(tag, type)`

5. **archives** (optional, may not be populated from JSON)
   - `id` (UUID, PK): Primary key
   - `year` (text): Archive year
   - `month` (text): Archive month
   - `week` (text): Archive week
   - `content` (text): Archive content
   - `created_at` (timestamp): Creation timestamp
   - `updated_at` (timestamp): Update timestamp
   - **Unique Constraint**: `(year, month, week)`

### Dependency Graph

```
workgroups (no dependencies)
  ↓
meetingsummaries (depends on: workgroups)
  ↓
names (no dependencies, but referenced by meetingsummaries.summary JSONB)
tags (no dependencies, but referenced by meetingsummaries.summary JSONB)
```

**INSERT Order**:
1. `workgroups` (reference table)
2. `names` (reference table, extracted from peoplePresent)
3. `tags` (reference table, extracted from tags object)
4. `meetingsummaries` (depends on workgroups)

## Data Transformation Rules

### 1. Workgroup Mapping

**JSON → SQL**:
- `workgroup` → `workgroups.workgroup`
- `workgroup_id` → `workgroups.workgroup_id` (use as-is if valid UUID, otherwise generate deterministically)
- If `workgroup_id` missing: Generate deterministic UUID from `workgroup` name using SHA-256 hash

**Synthetic Values**:
- `created_at`: Use current timestamp or meeting date (deterministic)
- `user_id`: Generate deterministic UUID from workgroup name + "user" context
- `preferred_template`: NULL or empty JSON object `{}`

### 2. Meeting Summary Mapping

**JSON → SQL**:
- `meetingInfo.name` → `meetingsummaries.name`
- `meetingInfo.date` → `meetingsummaries.date` (parse ISO date string to timestamp)
- `workgroup_id` → `meetingsummaries.workgroup_id` (reference to workgroups table)
- Entire JSON object → `meetingsummaries.summary` (store as JSONB)
- `type` → `meetingsummaries.template`

**Synthetic Values**:
- `meeting_id`: Generate deterministic UUID from `(name, date, workgroup_id)` tuple
- `user_id`: Generate deterministic UUID from workgroup context
- `confirmed`: Default to `false`
- `created_at`: Use meeting date or current timestamp
- `updated_at`: Same as `created_at`

**Unique Constraint Handling**:
- Check for duplicates based on `(name, date, workgroup_id, user_id)`
- Process first occurrence, skip subsequent duplicates with warning

### 3. Names Extraction and Normalization

**JSON → SQL**:
- Extract from `meetingInfo.peoplePresent` (comma-separated string)
- Split by comma, trim whitespace
- For each unique name:
  - Check if exists in `names` table (by unique `name` constraint)
  - If not exists, insert with:
    - `name`: Extracted name
    - `user_id`: Deterministic UUID from name + "user" context
    - `approved`: Default to `true` (or `false` if needed)
    - `created_at`: Use meeting date or current timestamp

**Deduplication**:
- Track unique names across all meeting summaries
- Only insert each name once (respect unique constraint)

### 4. Tags Extraction and Normalization

**JSON → SQL**:
- Extract from `tags` object:
  - `topicsCovered`: Split by comma, create tags with `type="topicsCovered"`
  - `emotions`: Split by comma, create tags with `type="emotions"`
  - `gamesPlayed`: Split by comma, create tags with `type="gamesPlayed"`
  - `other`: If non-empty, create tag with `type="other"`

**For each tag**:
- Check if exists in `tags` table (by unique `(tag, type)` constraint)
- If not exists, insert with:
  - `tag`: Extracted tag text (trimmed)
  - `type`: Tag type (e.g., "topicsCovered")
  - `user_id`: Deterministic UUID from tag + type + "user" context
  - `created_at`: Use meeting date or current timestamp

**Deduplication**:
- Track unique `(tag, type)` pairs across all meeting summaries
- Only insert each tag once (respect unique constraint)

### 5. Nested Structures (Stored in JSONB)

**Agenda Items, Action Items, Decision Items**:
- These are stored within the `summary` JSONB column
- No separate table rows created
- Preserve structure as-is in JSON

**Working Documents**:
- Stored in `summary.meetingInfo.workingDocs` array
- No separate table rows created

**Timestamped Video**:
- Stored in `summary.meetingInfo.timestampedVideo` object
- No separate table rows created

## Validation Rules

### Required Field Validation

1. **workgroups**:
   - `workgroup_id`: Required (generate if missing)
   - `workgroup`: Required (from JSON, error if missing)
   - `created_at`: Required (synthesize if missing)

2. **meetingsummaries**:
   - `meeting_id`: Required (generate deterministically)
   - `name`: Required (from `meetingInfo.name`, error if missing)
   - `date`: Required (from `meetingInfo.date`, parse and validate)
   - `workgroup_id`: Required (must reference existing workgroup)
   - `summary`: Required (entire JSON object)
   - `created_at`: Required (synthesize if missing)

3. **names**:
   - `name`: Required (from extraction, skip if empty after trim)
   - `created_at`: Required (synthesize if missing)

4. **tags**:
   - `tag`: Required (from extraction, skip if empty after trim)
   - `type`: Required (from tag category)
   - `created_at`: Required (synthesize if missing)

### Data Type Validation

1. **UUIDs**: Must be valid UUID format (36 characters, hyphens at positions 8, 13, 18, 23)
2. **Dates**: Must parse as valid ISO date strings (`YYYY-MM-DD`)
3. **Timestamps**: Convert dates to PostgreSQL timestamp format
4. **JSON**: Must be valid JSON (entire meeting summary object)

### Referential Integrity Validation

1. **Foreign Keys**:
   - `meetingsummaries.workgroup_id` must reference existing `workgroups.workgroup_id`
   - Validate before generating INSERT statements

2. **Unique Constraints**:
   - `workgroups.workgroup_id`: Check for duplicates, use first occurrence
   - `meetingsummaries.(name, date, workgroup_id, user_id)`: Check for duplicates, use first occurrence
   - `names.name`: Check for duplicates, use first occurrence
   - `tags.(tag, type)`: Check for duplicates, use first occurrence

## Error Handling

### Invalid Data Scenarios

1. **Invalid UUID**: Log error, generate deterministic UUID from context
2. **Invalid Date**: Log error, skip record with warning
3. **Missing Required Field**: Log error, skip record with warning
4. **Duplicate Unique Constraint**: Log warning, skip duplicate, continue processing
5. **Broken Foreign Key**: Log error, skip dependent record, continue processing
6. **Malformed JSON**: Log error, skip entire input file (fatal error)

### Error Collection

- Collect all errors and warnings in arrays during processing
- Log to console in real-time (`console.error`, `console.warn`)
- Include summary in generated `TESTDATA.md` with:
  - Total errors/warnings count
  - Examples of errors/warnings
  - List of skipped records

## Deterministic Value Generation

### UUID Generation Strategy

For deterministic UUIDs, use SHA-256 hash of context string:

```javascript
function generateDeterministicUUID(contextString) {
  const hash = crypto.createHash('sha256').update(contextString).digest('hex');
  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
}
```

**Context Strings**:
- Workgroup ID: `"workgroup:" + workgroupName`
- Meeting ID: `"meeting:" + name + ":" + date + ":" + workgroup_id`
- User ID: `"user:" + workgroupName + ":user"`
- Name User ID: `"user:" + name + ":user"`
- Tag User ID: `"user:" + tag + ":" + type + ":user"`

### Timestamp Generation Strategy

- Use meeting date for `created_at` timestamps when available
- If meeting date missing, use current timestamp (non-deterministic, but acceptable for test data)
- For `updated_at`, use same as `created_at`
