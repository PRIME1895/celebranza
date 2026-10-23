<div align="center">

# ✦ Celebranza ✦
### Autonomous Luxury Event Planning & Financial Intelligence Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <b>Celebranza</b> transforms high-stakes celebration planning into a seamless, deterministic science.<br/>
  Engineered with Google Gemini 3.5 Flash, structured output schemas, Google Search & Maps grounding, and real-time financial optimization for luxury weddings, milestone birthdays, and premier community galas.
</p>

[Key Features](#-core-capabilities) • [Gemini Architecture](#-gemini-35-flash-intelligence-layer) • [System Design](#-system-architecture) • [Getting Started](#-getting-started) • [API Contracts](#-api-specifications) • [Test Suite](#-automated-testing)

---

</div>

## 📌 Executive Summary & Problem Space

Planning high-stakes destination celebrations across premier Indian hubs (**Udaipur, Goa, Mumbai, Bengaluru**) presents major logistical and financial liabilities:

| Dimension | The Status Quo | The Celebranza Standard |
| :--- | :--- | :--- |
| **Budget Modeling** | Arbitrary rules of thumb and static spreadsheets resulting in 20–35% average budget overruns. | **Mathematically balanced category allocation** with real-time 80% overrun warning indicators. |
| **Market Intelligence** | Stale quotes, hidden administrative fees, and regional price opacity. | **Google Search & Maps grounded pricing** for authentic venues, catering per-plate rates, and production. |
| **Executive Oversight** | Scattered WhatsApp chats, disjointed email chains, and untracked deposits. | **Executive Voice Audio Briefings** powered by Gemini linear PCM wrapped in standard WAV containers. |
| **Ideation & Velocity** | Weeks spent writing briefs, gathering moodboards, and waiting for initial designer drafts. | **One-Prompt Event Architect** delivering a full itemized blueprint in under 3 seconds. |
| **Brand Identity** | Slow, expensive agency cycles for event logos and branding. | **Clean monogram branding** synthesized dynamically alongside color palettes and taglines. |

---

## ✨ Core Capabilities

### 1. ⚡ One-Prompt Event & Financial Architect
Transform a single natural language input (e.g., *"3-day destination beach wedding in South Goa, 180 guests, ₹35 Lakh budget"*) into an end-to-end event blueprint:
- **Mathematical Expense Distribution:** Computes exact rupee allocations across Venue, Catering, Decor, Photography, Attire, Entertainment, Invitations, and Emergency Reserves.
- **Venue Selection:** Authentically selects verified landmark venues (e.g., *The Leela Palace Bengaluru*, *Jagmandir Island Palace Udaipur*, *Candolim Beach Villas Goa*).
- **Target Milestones & Itemized Tasks:** Generates chronologically ordered planning checklists from 6 months out to day-of execution.

### 2. 📊 Financial Optimizer & Visual Risk Management
- **80% Category Allocation Cap:** Automated visual alert banner triggers whenever any category consumes 80% or more of its allocated budget, providing immediate mitigation steps.
- **Interactive Recharts Donut Breakdown:** Real-time visual expenditure analysis displaying spent amounts, allocated ceilings, and percentage consumption.
- **Strategic Advice Engine:** Instant market recommendations for contract negotiation, vendor bundles, and contingency buffer preservation.

### 3. 🎙️ Executive Voice Audio Briefings
- Live audio briefings detailing countdown days, task readiness percentages, and upcoming milestones.
- Server-side streaming converts raw 16-bit 24kHz linear PCM audio from Gemini into a canonical 44-byte RIFF WAV header for native zero-dependency browser playback.

### 4. 🌐 Real-Time Search & Maps Grounding
- **Search Grounding:** Pulls current market rates, vendor package structures, and negotiation tips.
- **Maps Grounding:** Queries premier venues, boutique stays, and banquets with verified location metadata and direct Google Maps links.

### 5. 👥 Guest RSVP & Seating Analytics
- Tracks accepted, declined, and pending RSVPs with automated dietary requirement aggregation and dietary requirement breakdowns.

### 6. 📄 Multi-Format Executive Export
- Generates comprehensive event summaries in **PDF**, formatted **Markdown**, and structured **CSV** spreadsheets for immediate sharing with families, accountants, and production crews.

### 7. 🎨 Dual Luxury Editorial Theming
- **Obsidian Dark Mode:** Deep midnight obsidian (`#0d0f14`) with terracotta accents (`#E07A5F`) and charcoal glass cards.
- **Warm Italian Cream Light Mode:** Warm editorial linen (`#FAF7F2`) with high-contrast terracotta borders and zero text overlay collisions.

---

## 🧠 Gemini 3.5 Flash Intelligence Layer

Celebranza leverages **Gemini 3.5 Flash** across multiple specialized modalities:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      GOOGLE GEMINI 3.5 FLASH                          │
└───────────┬────────────────┬─────────────────┬────────────────┬────────┘
            │                │                 │                │
            ▼                ▼                 ▼                ▼
   [Structured JSON]   [Audio Stream]   [Search Ground]   [Maps Ground]
            │                │                 │                │
     responseSchema        Linear PCM        googleSearch      googleMaps
   (Type.OBJECT/ARRAY)   (24kHz 16-bit)      (Live Rates)     (Venues)
            │                │                 │                │
            ▼                ▼                 ▼                ▼
     One-Prompt &      Executive Voice    Vendor Market      Landmark
   Budget Blueprint       Briefing         Intelligence      Discovery
```

| Route | Model | Modality | Output Contract |
| :--- | :--- | :--- | :--- |
| `/api/planning/one-prompt-planner` | `gemini-3.5-flash` | Structured JSON | Strict `responseSchema` generating full event blueprint with itemized budget, tasks, and vendors |
| `/api/planning/quick-suggest` | `gemini-3.5-flash` | JSON / Text | Low-latency financial recommendations with categorized tags |
| `/api/planning/tts-briefing` | `gemini-3.5-flash` | Audio Modality (`Kore`) | 24kHz linear PCM audio buffer encapsulated into 44-byte RIFF WAV container |
| `/api/planning/search-vendors` | `gemini-3.5-flash` | Tool Grounding | Live Google Search market rates and citation links |
| `/api/planning/maps-vendors` | `gemini-3.5-flash` | Tool Grounding | Google Maps venue locations and verified place references |
| `/api/planning/chat-planner` | `gemini-3.5-flash` | Conversational JSON | Interactive planning assistant synthesizing custom blueprints on the fly |

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client["Frontend Client (React 19 + TypeScript + Vite)"]
        UI["Celebranza UI (Tailwind v4)"]
        State["State Manager & LocalStorage Sync"]
        AuthCtx["Firebase Auth Context (Google / Email)"]
        Recharts["Recharts Donut & Allocation Visualizer"]
    end

    subgraph Server["Backend Server (Express + TypeScript)"]
        Security["Helmet + Rate Limiting Middleware"]
        Sanitize["Input Capping & XSS Cleaner"]
        SafeJSON["SafeJsonParse (Control Character Stripper)"]
        RetryEngine["Gemini 503 Resiliency & Exponential Backoff"]
        AudioEncoder["PCM to 44-Byte RIFF WAV Encoder"]
    end

    subgraph GoogleAI["Google Gemini 3.5 Flash"]
        Flash["gemini-3.5-flash Engine"]
        SearchAPI["Google Search Grounding"]
        MapsAPI["Google Maps Grounding"]
        AudioAPI["Speech Synthesis (Kore Voice)"]
    end

    UI --> State
    State <-->|celebranza_events| LocalStorage[Browser LocalStorage]
    UI -->|REST API| Security
    Security --> Sanitize
    Sanitize --> RetryEngine
    RetryEngine -->|Structured Output| Flash
    RetryEngine -->|Search Grounding| SearchAPI
    RetryEngine -->|Maps Grounding| MapsAPI
    RetryEngine -->|Audio Modalities| AudioAPI
    Flash --> SafeJSON
    SafeJSON --> UI
    AudioAPI --> AudioEncoder -->|data:audio/wav;base64| UI
    AuthCtx <-->|OAuth / Identity| FirebaseAuth["Firebase Authentication"]
```

---

## 🔒 Security & Resiliency Engineering

1. **Transient 503 Spike Resiliency:**
   - Implements automated exponential backoff retry wrapper (`generateContentWithRetry`) across all endpoints to gracefully absorb transient 503 high-demand surges from cloud endpoints.
2. **Safe JSON Stream Parsing (`safeJsonParse`):**
   - Automatically sanitizes non-printable ASCII control characters (`0x00`–`0x1F`), strips markdown code fences (` ```json `), and extracts valid JSON payloads to prevent syntax crashes.
3. **Strict Zero-Secrets Policy:**
   - Sensitive environment variables (`.env`, credentials) are strictly gitignored. Build outputs and local caches are isolated.
4. **SVG & XSS Sanitization:**
   - All external media and vector strings pass through rigorous sanitizers stripping `<script>`, `<iframe>`, `<foreignObject>`, and event handlers.
5. **Rate Limiting & Defense-in-Depth:**
   - Express rate-limiter restricts traffic to 100 requests per 15-minute window per IP, paired with `helmet` HTTP headers and payload size boundaries.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone & Install
```bash
git clone https://github.com/PRIME1895/celebranza.git
cd celebranza
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```env
# Google Gemini API Key (Required for live AI features)
GEMINI_API_KEY="AIzaSy..."

# Server Port (Defaults to 3000)
PORT=3000

# Optional: Firebase Authentication Web Configuration
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```
> *Note: If no API key is provided, Celebranza automatically activates deterministic offline Demo Mode so the entire application remains fully testable without network access.*

### 3. Launch Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 🧪 Automated Testing

Celebranza includes a native Node.js test suite validating financial formulas, data aggregation, security sanitizers, and audio buffer encoding:

```bash
npm test
```

### Test Suite Coverage:
```
✔ sanitizeInput limits string lengths and trims whitespace
✔ sanitizeSvg strips script, iframe, and inline event handlers
✔ addWavHeader generates a compliant 44-byte RIFF WAV audio buffer
✔ budget allocation math balances total expenditure and percentages
✔ API mock handles valid structured response with source: "gemini"
✔ formatCurrencyINR formats Indian Lakhs accurately (₹15,00,000)
✔ formatLakhsShort formats condensed notation (15.0L)
✔ calculateEventProgress clamps between 0 and 100
✔ calculateBudgetSummary computes spent, remaining, and percentage
✔ filterVendors accurately filters by status and search text
✔ validateEventInput handles valid and invalid payload
✔ calculateRSVPSummary aggregates accepted, declined, pending, and seats
✔ checkCategoryBudgetWarning detects categories exceeding 80% allocation

Summary: 13 passed, 0 failed, 100% assertion pass rate.
```

---

## 📦 Production Deployment

### Build Application
Compiles the React frontend using Vite and bundles the Express backend server into an optimized single binary via `esbuild`:
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Create Clean Submission Archive
```bash
zip -r celebranza.zip . -x "node_modules/*" ".env" ".git/*" "dist/*" "server.js"
```

---

## 📡 API Specifications

### `POST /api/planning/one-prompt-planner`
Generates a complete event blueprint from natural language.
- **Body:** `{ "prompt": "Udaipur destination wedding, 250 guests, budget ₹45L", "eventType": "wedding" }`
- **Response:**
  ```json
  {
    "success": true,
    "source": "gemini",
    "model": "gemini-3.5-flash",
    "data": {
      "title": "Royal Lakeside Wedding",
      "type": "wedding",
      "city": "Udaipur",
      "venue": "Jagmandir Island Palace, Lake Pichola",
      "budget": 4500000,
      "expectedGuests": 250,
      "categoryBreakdown": [
        { "category": "Venue & Catering", "amount": 1890000, "percentage": 42, "note": "Island palace banquet & premium catering" }
      ],
      "milestones": [ ... ],
      "itemizedExpenses": [ ... ]
    }
  }
  ```

### `POST /api/planning/quick-suggest`
Provides strategic financial allocations and contingency recommendations.
- **Body:** `{ "budget": 2000000, "eventType": "wedding", "currentPhase": "Planning" }`
- **Response:**
  ```json
  {
    "success": true,
    "source": "gemini",
    "model": "gemini-3.5-flash",
    "data": {
      "suggestion": "Allocate 40% to venue and catering, 20% to design, and reserve a strict 15% contingency fund.",
      "tags": ["BudgetAllocation", "FinancialBuffer", "RiskMitigation"]
    }
  }
  ```

### `POST /api/planning/tts-briefing`
Returns synthesized audio briefing for active celebration.
- **Body:** `{ "eventTitle": "Sunset Beach Wedding", "daysLeft": 95, "progress": 47, "budgetSpent": "56%" }`
- **Response:**
  ```json
  {
    "success": true,
    "source": "gemini",
    "audioDataUrl": "data:audio/wav;base64,UklGR...",
    "briefingText": "Good morning! Here is your executive briefing for Sunset Beach Wedding..."
  }
  ```

---

## 🎨 Design Tokens & Aesthetic Standards

- **Heading Typography:** `DM Serif Display` (Google Fonts)
- **Body & Data Typography:** `Inter` (Google Fonts)
- **Primary Accent:** Terracotta `#E07A5F`
- **Background Palette:**
  - Dark Mode: Obsidian `#0d0f14` | Card `#161822` | Surface `#1f2230`
  - Light Mode: Italian Warm Linen `#FAF7F2` | Card `#F4EFE6` | Surface `#EDE6D9`
- **Status Indicators:**
  - Success / On Track: Emerald `#10B981`
  - Warning / >80% Budget Cap: Crimson `#EF4444`
  - Pending / Active: Amber `#F59E0B`

---

## 📄 License & Attribution

This project is open-source under the **[MIT License](LICENSE)**.

Developed by **[PRIME1895](https://github.com/PRIME1895)** for the Google Gemini Developer Challenge.
All intellectual property, code architecture, and designs are maintained in the public repository at [github.com/PRIME1895/celebranza](https://github.com/PRIME1895/celebranza).
