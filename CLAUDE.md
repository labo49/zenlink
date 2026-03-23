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
- Supabase is self-hosted (not Supabase Cloud) on a Google Cloud VM
- The `VITE_SUPABASE_URL` in `.env` points to the VM's public IP/domain
- Supabase Edge Functions run on the VM and handle AI tagging logic

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
