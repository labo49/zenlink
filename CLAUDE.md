# ZenLink Project Manifest

## 🎯 Project Overview
ZenLink is a private, single-user link-saving tool (Pocket replacement). It allows for cross-platform link saving, AI-powered hashtag suggestions, and a sophisticated "Snooze" system.

## 🛠 Tech Stack
- **Extension Framework:** WXT (Vite-based, cross-browser for Chrome/Firefox)
- **Database:** Supabase (PostgreSQL) — self-hosted on a Google Cloud VM
- **Authentication:** Google OAuth via Supabase Auth
- **Styling:** Tailwind CSS
- **AI Integration:** Gemini API (for hashtag generation)
- **State Management:** TanStack Query (for syncing UI with DB)

## ☁️ Infrastructure
- Supabase is hosted on Supabase Cloud
- Project URL: `https://tysfpsvjzjzimiipykol.supabase.co`
- Supabase Edge Functions handle AI tagging logic

## 🚀 Core Features & Logic

### 1. Link Capture
- Capture `url`, `title`, and `favicon`
- **AI Tagging:** On popup open, send title to Gemini to receive 3-5 `#hashtag` suggestions
- **Manual Tags:** Allow user to append or delete tags before saving

### 2. The Snooze Engine
- **Friday Morning:** Next Friday at 09:00 AM
- **Monday Morning:** Next Monday at 09:00 AM
- **4 Weeks:** CurrentDate + 28 days
- **Next Browser Session:** A boolean flag `on_next_session`. The background script must check this flag when the browser starts and move these links to the "Inbox."

### 3. Search & UI
- Full-text search on title and tags
- "Snoozed" view vs. "Inbox" view

## 🗂 Backlog
- **Firefox build** — run `npm run build:firefox`, test and package for Firefox Add-ons
- **Import CSV** — allow user to import a CSV of links (url, title, tags columns) in bulk into Supabase
- **Gemini AI tag analysis** — Edge Function built (`supabase/functions/suggest-tags/index.ts`), deployed on Supabase, using `gemini-2.0-flash-lite` via REST API. Timing out on free tier — needs investigation. Model: `gemini-2.0-flash-lite`, key set in Supabase secrets as `GEMINI_API_KEY`

## 📏 Development Rules
- **TypeScript Only:** Strict typing; no `any`
- **Component Pattern:** Use functional components with Tailwind utility classes
- **Supabase Client:** Centralized in `src/lib/supabase.ts`
- **Error Handling:** Graceful degradation if the AI tagging service is down (allow manual tags only)

## 📂 Directory Structure
- `/entrypoints` — Extension entry points (popup, background, options)
- `/components` — Shared UI components
- `/hooks` — Custom React hooks for Supabase/Auth
- `/server` — Supabase Edge Functions (AI Tagging logic)
