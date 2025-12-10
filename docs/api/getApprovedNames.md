## Get Approved Names API

### Overview
Fetch approved contributor names from the `names` table. This endpoint uses **Supabase** (a backend-as-a-service platform providing PostgreSQL database) to retrieve data from the database.

**Related Components**: This endpoint is used by components that need to display or select contributor names, such as `SelectNames.tsx` in the components directory. See the [Directory Structure Guide](../guides/directory-structure.md) for component locations.

### Endpoint
- Method: GET
- Path: `/api/getApprovedNames`

### Authentication
- Required header: `api_key: YOUR_SERVER_API_KEY` (or `x-api-key`)
  - **API Key**: A secret token used to authenticate API requests and ensure only authorized clients can access the endpoint

### CORS
- Supports `GET` and `OPTIONS` (preflight)
  - **CORS** (Cross-Origin Resource Sharing): A security mechanism that allows web pages to make requests to a different domain than the one serving the web page
  - **OPTIONS (preflight)**: A request method used by browsers to check if a cross-origin request is allowed before making the actual request

### Query Parameters
- None

### Response
- 200 OK:
```json
{
  "data": [
    { "name": "Alice" },
    { "name": "Bob" }
  ]
}
```
- 403 Forbidden (missing/invalid API key)
- 405 Method Not Allowed
- 500 Server error: `{ "error": string }`

Notes:
- Results include only rows where `approved` is `true`
- Sorted ascending by `name`

### Minimal Example
```bash
curl -X GET "https://your-app.example.com/api/getApprovedNames" \
  -H "api_key: $SERVER_API_KEY"
```

### JavaScript (fetch) Example
```javascript
const res = await fetch("/api/getApprovedNames", {
  headers: { "api_key": process.env.SERVER_API_KEY }
});
const { data } = await res.json();
// data is an array of { name }
```


