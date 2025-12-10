## Upsert Meeting Summary API

### Overview
Create or update a meeting summary record in the `meetingsummaries` table. This endpoint requires an API key and uses server-side **Supabase** (a backend-as-a-service platform providing PostgreSQL database) service-role access. The term **"upsert"** means "update or insert" - if a record exists, it's updated; if not, it's created.

**Related Components**: This endpoint is used by meeting summary submission forms, particularly the `SubmitMissingSummary.tsx` component and the `/submit-meeting-summary` page. The `SummaryTemplate.tsx` component displays the data structure that this endpoint accepts. See the [Directory Structure Guide](../guides/directory-structure.md) for component locations.

### Endpoint
- Method: POST
- Path: `/api/upsertMeetingSummary`

### Authentication
- Required header: `api_key: YOUR_SERVER_API_KEY` (or `x-api-key`)
- Content type: `Content-Type: application/json`

### CORS
- Supports `POST` and `OPTIONS` (preflight)

### Request Body
Required fields:
- `workgroup` (string): Human-readable workgroup name
- `workgroup_id` (string, UUID): **UUID** (Universally Unique Identifier) is a 128-bit identifier used to uniquely identify entities
- `user_id` (string, UUID): User to associate with the summary (also a UUID)
- `meetingInfo` (object):
  - `name` (string)
  - `date` (string, format `YYYY-MM-DD`)

Optional fields:
- `meetingInfo`: may include `host`, `documenter`, `translator`, `peoplePresent`, `purpose`, `townHallNumber`, `googleSlides`, `meetingVideoLink`, `miroBoardLink`, `otherMediaLink`, `transcriptLink`, `mediaLink`, `workingDocs` (array), `timestampedVideo` (object)
- `agendaItems` (array)
- `tags` (object)
- `type` (string) – defaults to `"custom"`
- `noSummaryGiven` (boolean) – defaults to `false`
- `canceledSummary` (boolean) – defaults to `false`

Validation rules:
- `meetingInfo.date` must be `YYYY-MM-DD`
- If provided, `meetingInfo.workingDocs` must be an array
- If provided, `agendaItems` must be an array

### Behavior
- Upsert into `meetingsummaries` using composite uniqueness on `(name, date, workgroup_id, user_id)` - **composite uniqueness** means the combination of these four fields must be unique
- `date` is normalized to **ISO** (International Organization for Standardization) format at midnight **UTC** (Coordinated Universal Time, the primary time standard)
- The full payload is stored in `summary` (a **JSONB** column - PostgreSQL's binary JSON format for storing structured data) with defaults applied
- `template` is set from `type`
- `updated_at` is set server-side

### Responses
- 200 OK: `{ data: [{ date, meeting_id, updated_at }] }`
- 400 Bad Request: `{ error: string }`
- 403 Forbidden (missing/invalid API key)
- 405 Method Not Allowed
- 500 Server error

### Minimal Example
```bash
curl -X POST "https://your-app.example.com/api/upsertMeetingSummary" \
  -H "Content-Type: application/json" \
  -H "api_key: $SERVER_API_KEY" \
  -d '{
    "workgroup": "Ambassador Town Hall",
    "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    "user_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "meetingInfo": { "name": "Weekly", "date": "2024-06-04" }
  }'
```

### Full Example
```bash
curl -X POST "https://your-app.example.com/api/upsertMeetingSummary" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SERVER_API_KEY" \
  -d '{
    "workgroup": "Ambassador Town Hall",
    "workgroup_id": "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    "user_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "meetingInfo": {
      "name": "Weekly",
      "date": "2024-06-04",
      "host": "PeterE",
      "documenter": "CallyFromAuron",
      "peoplePresent": "A, B, C",
      "purpose": "Weekly get-together"
    },
    "agendaItems": [
      { "status": "carry over", "discussionPoints": ["..."], "actionItems": [{ "status": "todo" }] }
    ],
    "tags": { "topicsCovered": "inclusivity", "emotions": "cheerful" },
    "type": "custom"
  }'
```

### JavaScript (fetch) Example
```javascript
await fetch("/api/upsertMeetingSummary", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api_key": process.env.SERVER_API_KEY
  },
  body: JSON.stringify({
    workgroup: "Ambassador Town Hall",
    workgroup_id: "72ce0bc0-276e-4cde-bfb9-cdabc5ed953e",
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    meetingInfo: { name: "Weekly", date: "2024-06-04" }
  })
});
```

### Notes
- Ensure you have a valid `workgroup_id` and `user_id` already present in your system.
- Contact the API owner to obtain `SERVER_API_KEY`.

