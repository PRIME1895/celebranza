<div align="center">

# Celebranza
### Enterprise Autonomous Luxury Event Planning & Financial Intelligence Platform

[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Cloud-111319?style=for-the-badge&logo=google-cloud&logoColor=white)](https://ai.google.dev/)
[![Engine](https://img.shields.io/badge/Intelligence-Google%20Gemini%203.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-10B981?style=for-the-badge&logo=auth0&logoColor=white)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-E07A5F?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Celebranza</b> is an autonomous luxury event planning and financial intelligence operating system.<br/>
  Engineered for event management enterprises, luxury planners, and high-stakes hosts, Celebranza bridges natural language ideation with deterministic financial modeling, real-time Google market grounding, bespoke brand synthesis, and executive voice briefings.
</p>

[Executive Overview](#-executive-overview) • [Core Capabilities](#-core-capabilities) • [Enterprise AI Architecture](#-enterprise-ai-architecture) • [Security & Compliance](#-security--data-integrity) • [Deployment](#-deployment-guide)

---

</div>

## 📌 Executive Overview

Planning premier corporate galas, luxury destination weddings, and landmark milestone celebrations involves coordinating dozens of vendors, dynamic vendor quotes, and complex multi-tier budgets. Traditional methodologies rely on fragmented spreadsheets, static rule-of-thumb percentages, and disconnected communication channels—leading to an industry-average **20–35% budget overrun**.

**Celebranza eliminates this uncertainty** through an integrated, enterprise-ready operating platform:

| Operational Dimension | Conventional Industry Practice | The Celebranza Enterprise Standard |
| :--- | :--- | :--- |
| **Budget Modeling** | Static spreadsheets and ad-hoc formulas prone to human calculation error. | **Autonomous mathematical allocation** with real-time 80% expenditure threshold alerts and mitigation advice. |
| **Market Grounding** | Outdated static rate cards and opaque local pricing across destination hubs. | **Live Google Search & Maps market intelligence** reflecting current regional banquet, per-plate, and vendor realities. |
| **Executive Oversight** | Scattered messaging chains and manual status tracking across teams. | **Executive Voice Briefings** powered by dedicated Gemini speech intelligence delivering instant operational status updates. |
| **Planning Velocity** | 2–3 weeks required to draft comprehensive event blueprints and vendor schedules. | **One-Prompt Event Architect** synthesizing end-to-end itemized blueprints in under 3 seconds. |
| **Brand Identity** | Multi-week turnaround cycles with design agencies for initial visual assets. | **Instant vector monogram branding** synthesized dynamically alongside event taglines and themes. |

---

## ✨ Core Capabilities

### 1. ⚡ Autonomous One-Prompt Event Architect
Celebranza transforms a single natural language brief (e.g., *"3-day destination beach wedding in South Goa, 180 guests, ₹35 Lakh budget"*) into a comprehensive, production-ready operational blueprint:
- **Mathematically Balanced Rupee Allocations:** Formulates exact, 100% balanced distributions across Venue, Catering, Production, Decor, Photography, Entertainment, and Reserves.
- **Curated Landmark Venues:** Matches location parameters with authentic, verified properties (e.g., *The Leela Palace Bengaluru*, *Jagmandir Island Palace Udaipur*, *Candolim Beach Villas Goa*).
- **Phased Milestones & Timelines:** Generates chronologically sequenced workstreams from six months pre-event through day-of production.

### 2. 📊 Real-Time Financial Risk & Allocation Engine
- **Automated 80% Allocation Warning Indicator:** Visual compliance alert triggers whenever any operational category reaches or exceeds 80% of its budget ceiling, accompanied by prescriptive mitigation steps.
- **Dynamic Expenditure Visualizer:** Interactive Recharts visual breakdown displaying committed spending, allocated caps, and variance tracking.
- **Strategic Advisory Intelligence:** On-demand recommendations for contract negotiation, multi-vendor packaging, and risk-adjusted buffers.

### 3. 🎙️ Executive Voice Audio Intelligence
- Hands-free audio summaries detailing days remaining, milestone completion velocity, and pending operational tasks.
- Powered by Google Gemini speech synthesis models (`gemini-3.8-flash-tts` with high-availability fallback to `gemini-3.8-flash-lite-tts`).
- Encapsulated in standard zero-dependency audio containers for instantaneous playback across mobile and desktop interfaces.

### 4. 🌐 Real-Time Google Search & Maps Grounding
- **Search-Grounded Vendor Pricing:** Evaluates live regional market ranges for banquet rentals, photography packages, and catering costs across Indian destination metros (Udaipur, Goa, Mumbai, Bengaluru, Delhi NCR).
- **Maps-Grounded Venue Discovery:** Retrieves verified landmark properties with geographic coordinates and direct navigation links.

### 5. 👥 Guest Intelligence & Seating Operations
- Centralized tracking for RSVPs (Attending, Declined, Pending) with automated seat reservation aggregation.
- Specialized dietary allocation management (Vegetarian, Jain, Vegan, Halal, Gluten-Free) ensuring flawless banquet execution.

### 6. 📄 Multi-Format Enterprise Reporting
- Generates polished documentation across **PDF summaries**, **formatted Markdown briefs**, and **structured CSV exports** for immediate handoff to executive clients, accountants, and production crews.

### 7. 🎨 Editorial Dual-Theming Architecture
- **Obsidian Dark Theme:** High-contrast dark mode tailored for low-light venue production control and executive review.
- **Italian Linen Light Theme:** Warm, editorial aesthetic designed for daytime client presentations and board review.

---

## 🧠 Enterprise AI Architecture

Celebranza leverages an enterprise-grade, multi-model AI pipeline utilizing Google's Gemini models for text intelligence, search grounding, and speech synthesis:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CELEBRANZA AI INTELLIGENCE PIPELINE                  │
└───────────┬────────────────┬─────────────────┬────────────────┬────────┘
            │                │                 │                │
            ▼                ▼                 ▼                ▼
    [Structured Schema] [Audio Synthesis] [Search Grounding] [Maps Grounding]
            │                │                 │                │
     Deterministic     Voice Briefings    Live Market Rates  Landmark Venues
    Budget & Tasks    (Kore Voice Model)  (Udaipur/Goa/BLR)  & Coordinates
            │                │                 │                │
            ▼                ▼                 ▼                ▼
      One-Prompt AI    Executive Voice     Verified Vendor    Geographic
        Architect        Intelligence       Market Quotes     Discovery
```

### AI Model Matrix & Functional Allocation

| Service Endpoint | Assigned Gemini Model | Modality & Capabilities | Business Function |
| :--- | :--- | :--- | :--- |
| **One-Prompt Event Architect** | `gemini-3.5-flash` | Two-Stage: Search Grounding → Structured Schema | Evaluates live market pricing before generating deterministic, mathematically balanced event blueprints in INR (₹). |
| **Executive Voice Briefings** | `gemini-3.8-flash-tts`<br/>*(Fallback: `gemini-3.8-flash-lite-tts`)* | Dedicated Text-to-Speech (Audio Modality) | Converts real-time event status into natural speech briefings for executives on the move. |
| **Market Vendor Discovery** | `gemini-3.5-flash` | Real-time Search Grounding (`googleSearch`) | Gathers current market quotes, reviews, and verified citations across target cities. |
| **Landmark Venue Discovery** | `gemini-3.5-flash` | Location Grounding (`googleMaps`) | Maps premier venues and hospitality destinations with direct geographic linkages. |
| **Conversational Planning Studio** | `gemini-3.5-flash` | Conversational Multi-turn & Vector Synthesis | Interactive planning assistant that produces custom celebration plans and dynamic vector SVG logos. |
| **Financial Optimizer** | `gemini-3.5-flash` | Structured JSON Generation | Delivers targeted cost-control strategies, contract negotiation levers, and contingency buffers. |

---

## 🏛️ High-Level System Architecture

```
                      ┌─────────────────────────────────┐
                      │    Enterprise Web Client UI     │
                      │  (React 19, TypeScript, Vite)   │
                      └────────────────┬────────────────┘
                                       │ HTTPS / JSON
                                       ▼
                      ┌─────────────────────────────────┐
                      │     Celebranza Gateway API      │
                      │  (Express 4, Helmet, Rate Limiter)
                      └────────┬──────────────┬─────────┘
                               │              │
               ┌───────────────┘              └───────────────┐
               ▼                                              ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│    Firebase Authentication   │              │   Google Gemini AI Engine    │
│  • Google Workspace OAuth    │              │  • gemini-3.5-flash          │
│  • Enterprise Email/Password │              │  • gemini-3.8-flash-tts      │
│  • Role-Based Access         │              │  • Search & Maps Grounding   │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 🔒 Security & Data Integrity

Celebranza incorporates enterprise-level defensive controls designed for enterprise reliability:

- **Strict Zero-Secrets Architecture:** All production credentials, API secrets, and environment tokens are strictly isolated from client distribution and source code repositories.
- **Input Sanitization & Boundary Capping:** Comprehensive request sanitizers guard against injection vectors and malicious input before hitting AI inference layers.
- **Vector & SVG Security Sanitization:** Custom SVG vector logos pass through recursive XML sanitization to prevent script execution or external asset exploitation.
- **High-Availability Fallback Resilience:** In the event of temporary upstream API rate limits or network disruptions, the platform gracefully switches to deterministic offline heuristics, ensuring zero disruption to live event production.
- **Enterprise Rate Limiting:** Gateway rate limiters enforce burst protection (100 requests per 15-minute window per IP) to prevent denial-of-service exposure.

---

## 🚀 Deployment Guide

### System Requirements
- **Runtime Environment:** Node.js v18.0.0 or higher
- **Package Manager:** npm or bun
- **Cloud Credentials:** Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Quick Start

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/PRIME1895/celebranza.git
   cd celebranza
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   # Google Gemini API Key (Required for live Gen AI features)
   GEMINI_API_KEY="AIzaSy..."

   # Server Port
   PORT=3000

   # Optional: Firebase Authentication
   VITE_FIREBASE_API_KEY=""
   VITE_FIREBASE_AUTH_DOMAIN=""
   VITE_FIREBASE_PROJECT_ID=""
   VITE_FIREBASE_STORAGE_BUCKET=""
   VITE_FIREBASE_MESSAGING_SENDER_ID=""
   VITE_FIREBASE_APP_ID=""
   ```

4. **Launch Application:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the Celebranza dashboard.

### Production Build & Deployment

To generate optimized production bundles for standard cloud environments (Vercel, Google Cloud Run, AWS, Docker):
```bash
# Compile React frontend and bundle backend server
npm run build

# Start production server
npm start
```

---

## 🎨 Design System & Aesthetic Standards

Celebranza adheres to an editorial, high-end visual design language:
- **Display Typography:** `DM Serif Display` — Classic editorial sophistication.
- **Interface & Metrics Typography:** `Inter` — High-legibility operational clarity.
- **Brand Identity Color:** Terracotta `#E07A5F` — Warm, celebratory luxury.
- **Dark Spectrum:** Deep Obsidian `#0d0f14`, Charcoal Glass `#161822`.
- **Light Spectrum:** Warm Italian Linen `#FAF7F2`, Alabaster `#F4EFE6`.

---

## 📄 License & Intellectual Property

Celebranza is distributed under the **[MIT License](LICENSE)**.

Developed by **[PRIME1895](https://github.com/PRIME1895)** for the Google Gemini Developer Challenge.
Public source code and documentation are hosted on GitHub at [github.com/PRIME1895/celebranza](https://github.com/PRIME1895/celebranza).
