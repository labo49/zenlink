# suggest-tags Edge Function

Calls the Gemini API to suggest 3–5 hashtags for a given page title.

## Deploy

```bash
supabase functions deploy suggest-tags
```

## Set the secret

```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

## Request

```json
POST /functions/v1/suggest-tags
Authorization: Bearer <user_access_token>
{ "title": "How to build a browser extension with WXT" }
```

## Response

```json
{ "tags": ["browserextension", "wxt", "javascript", "webdev", "tutorial"] }
```

## Failure behaviour

Returns `{ "tags": [] }` on any error — the UI falls back to manual tag entry.
