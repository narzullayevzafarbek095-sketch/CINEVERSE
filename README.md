# CineVerse AI — Smart Movie Discovery Platform

A cinematic, production-grade movie discovery and recommendation web application blending the depth of IMDb, the aesthetic polish of Netflix, and an interactive AI-powered personal movie assistant.

---

## 🌟 Key Features

### 1. 🎬 Cinematic Visual Experience
- **Color Architecture**: Deep black backdrop (`#08090D`), dark charcoal panels (`#12141C`), vibrant violet (`#8B5CF6`) and electric cyan/blue (`#00F0FF`).
- **Atmospheric Typography**: Google Fonts *Outfit* for headers and *Plus Jakarta Sans* for UI elements.
- **Micro-Interactions**: Ambient card glows, hover scales, skeleton loaders, and custom sleek scrollbars.

### 2. 🤖 "Find Your Next Movie" AI Recommendation Engine
- **Multi-Factor Interactive Wizard**: Guided 6-step exploration asking about mood (*Happy, Excited, Relaxed, Curious, Emotional, Mind-Bending, Thrilled*), preferred runtime, release era, format, and minimum IMDb rating.
- **Algorithmic Match Scoring**: Calculates direct genre synergy, mood resonance, era calibration, and critic weighting to generate a 0–100% match score.
- **Why CineVerse AI Recommended This**: Bulleted breakdown displaying the exact rationale behind each suggestion.
- **Transparent Dual-Engine**:
  - **Algorithmic Smart Matcher (Offline Engine)**: Works 100% out-of-the-box without needing an external API key.
  - **Gemini Neural Engine**: Optionally call Google Gemini 1.5 Flash when an API key is configured.

### 3. 🔍 Advanced Multi-Vector Search & Discovery
- Instant search with live dropdown suggestions as you type.
- Multi-filter combinations: Genre, Release Year, Format (Movies / Anime / Series), Actor or Director, and Minimum Rating Slider.
- Dynamic sorting: Popularity, Highest Rated First, Release Date (Newest), Title A-Z.
- Useful empty states with one-click filter resets.

### 4. 🎞️ Movie Detail View & HD Trailer Player
- Full-bleed backdrop art and movie metadata matrix (IMDb score, CineVerse score, Runtime, Release date, Budget, Box office gross, Spoken languages).
- Cast roster with photos and character names.
- Inline and modal YouTube trailer playback.
- Similar movie recommendations reel.
- Community and critic reviews with star ratings and likes.

### 5. 🔖 Personal Watchlist & Custom Collections
- Save movies with one-click bookmarking.
- Mark movies as "Watched" with date logs and personal 1–10 star ratings.
- Create custom collections (e.g., *"Weekend Marathon"*, *"Mind Benders"*, *"Date Night"*).
- Export and download watchlist JSON backups.
- Persistent `localStorage` storage across sessions.

### 6. 👤 User Profile Dashboard
- Personal cinema analytics: Total screening hours, favorite genres breakdown, personal reviews history, and recently explored films.
- Profile editor with custom display name, bio, and taste preferences.
- Clearly marked as a local demo profile.

### 7. 🛡️ Administrator Control Center
- Secure session passcode barrier (default: `cineverse2026`).
- Telemetry & usage statistics (Searches, AI runs, Watchlist additions, Active sessions).
- Community review moderation queue (Approve, Flag, or Delete reviews).
- Platform-wide broadcast announcement banner manager.
- Live API and cache health monitor (TMDB status, Gemini status, Local cache size).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0 or newer)
- npm or pnpm

### Installation

1. Clone or extract the project directory:
   ```bash
   cd "New folder (2)"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your keys:
   - `VITE_TMDB_API_KEY`: Get a free key at [themoviedb.org](https://www.themoviedb.org/settings/api).
   - `VITE_GEMINI_API_KEY`: Get a key at [Google AI Studio](https://aistudio.google.com/).
   - `VITE_ADMIN_PASSCODE`: Passcode for Admin Dashboard (default: `cineverse2026`).

   > **Note**: Even without any API keys, CineVerse AI is 100% functional with an offline curated database of 40+ top blockbuster films with real trailers!

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:3000`.

---

## 🛠️ Tech Stack
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom cinematic design tokens
- **Icons**: Lucide React
- **Data Engine**: Dual-mode (The Movie Database TMDB v3 API + Curated Master Database)
- **AI Synthesis**: Google Gemini 1.5 Flash API + Local Vector Match Engine
