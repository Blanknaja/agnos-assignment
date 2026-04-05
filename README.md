# Agnos Assignment — Patient Real-Time Registration System

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd agnos-assignment
npm install
```

### 2. Configure environment

Copy the example env file and fill Supabase credentials like this:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://jkedukxrwlbqownazefm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZWR1a3hyd2xicW93bmF6ZWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTgyODgsImV4cCI6MjA5MDc3NDI4OH0.GKeHW3yF5GvPBr0kMS8qUL5onrUYZrRlkkhVCfNbmq4
```

## Desktop

![App Preview Desktop](./public/image/readme/index-page-desktop.png)

## Mobile

![App Preview Mobile](./public/image/readme/index-page-mobile.png)

## Feature

![App Preview Mobile](./public/image/readme/feature.png)

---

## Overview

A real-time patient data intake system built for Agnos Health. Patients fill out a registration form at `/patient`, while clinical staff monitor all incoming submissions live at `/staff-view` — with no page refresh required.

The system is powered by **Supabase Realtime** and **Presence**, giving both patients and staff a seamless, always-in-sync experience.

## Tech Stack

| Tool              | Version         | Role                                      |
| ----------------- | --------------- | ----------------------------------------- |
| **Next.js**       | 16 (App Router) | Full-stack React framework                |
| **React**         | 19              | UI rendering                              |
| **TypeScript**    | 5 (Strict)      | Type safety across the codebase           |
| **Tailwind CSS**  | 4               | Utility-first styling                     |
| **Supabase**      | ^2              | PostgreSQL database + Realtime + Presence |
| **Framer Motion** | ^12             | Animations & transitions                  |
| **Lucide React**  | ^1.7            | Icon library                              |
| **Recharts**      | ^3              | Analytics charts on staff dashboard       |

---

## Why Supabase Instead of WebSocket?

### The Problem We Hit

We started by thinking about using a **raw WebSocket server** — and on the surface it made total sense. WebSocket is a well-known, low-latency protocol for bidirectional real-time communication. If a patient types something, we push the update to all connected clients instantly. Simple enough.

But the moment we thought through the full user journey, a critical issue appeared:

> **What happens when the patient closes the tab and comes back? Or refreshes the page?**

With a raw WebSocket approach, the answer is: **all in-memory state is gone.** WebSocket keeps data alive only as long as the connection is open. It is fundamentally a transport pipe, not storage. On reconnect, the client has no idea what happened before — it needs to separately call a REST API or database to restore state, which means we would have had to build _two_ systems: one for real-time push, and one for persistence.

We confirmed this is a real limitation: the WebSocket protocol itself has no concept of durability. Any server-side state stored in memory (e.g., a patient's in-progress form) is lost if the connection drops, the browser tab is refreshed, or the server restarts.

### The Solution We Found

While researching alternatives, we discovered that **Supabase has a `postgres_changes` feature** — a Realtime channel that listens to actual PostgreSQL row-level changes (via WAL / logical replication) and broadcasts them as events to all subscribed clients.

This changes everything:

- Every keypress the patient makes is written to **PostgreSQL** (durable storage), debounced at 200ms
- Supabase's Realtime layer detects the row change and **pushes it to the staff dashboard instantly**
- If the patient refreshes or returns later, the form data is simply **fetched from the database** — nothing is lost

Under the hood, Supabase Realtime _does_ use WebSocket as the transport. But because it's backed by PostgreSQL as the source of truth, we get both real-time push _and_ persistence in one tool, without building or managing any server infrastructure ourselves.

| Consideration         | Raw WebSocket                              | Supabase Realtime ✅                    |
| --------------------- | ------------------------------------------ | --------------------------------------- |
| **Infrastructure**    | Requires a persistent server to be running | Fully managed, serverless-compatible    |
| **Persistence**       | State is lost if the server restarts       | All state persists in PostgreSQL        |
| **Presence tracking** | Must build from scratch                    | Built-in Presence API                   |
| **Reconnection**      | Must handle manually                       | Handled automatically by the SDK        |
| **Auth & security**   | Build your own                             | Row-Level Security (RLS) via PostgreSQL |
| **Scalability**       | Tricky without dedicated infra             | Scales horizontally by default          |
| **Dev speed**         | Slow — write server + client               | Single `createClient()` call            |

---

## Project Structure

```
agnos-assignment/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (wraps all pages with PatientProvider)
│   ├── page.tsx                # Home page (/)
│   ├── HomeClient.tsx          # Client component for the home page
│   ├── globals.css             # Global CSS + Tailwind base styles
│   │
│   ├── patient/                # Patient registration route (/patient)
│   │   ├── page.tsx            # Server component — reads ?id= from URL, passes to client
│   │   ├── layout.tsx          # Patient-specific layout
│   │   └── PatientClientWrapper.tsx  # Client component — session bootstrap & sync logic
│   │
│   └── staff-view/             # Staff monitoring route (/staff-view)
│       ├── page.tsx            # Server component shell
│       ├── layout.tsx          # Staff-view specific layout
│       └── StaffClient.tsx     # Client component for dashboard
│
├── components/                 # Reusable UI building blocks
│   ├── button.tsx              # Base <Button> component (variant-aware)
│   ├── input.tsx               # Base <Input> component
│   ├── label.tsx               # Base <Label> component
│   │
│   └── ui/                     # Feature-level composed components
│       ├── MainHeader.tsx      # Global sticky top navigation bar
│       ├── Footer.tsx          # Global footer
│       ├── Pagination.tsx      # Reusable pagination control
│       ├── PatientForm.tsx     # The patient registration form (main feature component)
│       ├── StaffDashboard.tsx  # The staff monitoring dashboard (main feature component)
│       ├── searchwithbutton.tsx# Search input with integrated button
│       │
│       ├── dashboard/          # Sub-components used inside StaffDashboard
│       │   ├── AnalyticsSection.tsx  # Charts: gender distribution, age groups, languages
│       │   ├── DashboardUI.tsx       # Layout shell for the dashboard grid
│       │   ├── PatientList.tsx       # Patient table (desktop) + card view (mobile)
│       │   ├── PatientSidebar.tsx    # Right-side detail panel for selected patient
│       │   └── StatusBadge.tsx       # "Submitted" / "Filling" badge component
│       │
│       ├── header/             # Sub-components used inside MainHeader
│       │   ├── MenuLink.tsx          # Animated full-screen nav link item
│       │   └── StatusIndicator.tsx   # Connection/Session status display in header
│       │
│       └── patient-form/       # Sub-components used inside PatientForm
│           ├── FormSection.tsx       # Reusable section wrapper with icon + title
│           └── SuccessOverlay.tsx    # Full-screen overlay shown after form submission
│
├── contexts/
│   └── PatientContext.tsx      # Global state, Supabase subscription, all actions
│
├── const/                      # All hardcoded values — one place to change them all
│   ├── patient.ts              # PATIENT_STATUS, GENDER_OPTIONS, DEFAULT_PATIENT_DATA
│   ├── session.ts              # SESSION_EXPIRY_DAYS (set to null = never expires)
│   ├── supabase.ts             # SUPABASE_CONFIG (channel name, table name)
│   └── time.ts                 # Time presets: ONE_HOUR, HALF_DAY, ONE_WEEK, etc.
│
├── interface/                  # TypeScript type definitions
│   ├── patient.ts              # PatientData, PatientRealTimeState, PatientContextType, etc.
│   └── staff.ts                # Staff/analytics-related types
│
└── lib/                        # Shared utilities and service clients
    ├── supabase.ts             # Supabase client singleton (createClient)
    └── utils.ts                # Pure functions: calculateAge, mapRecordToState,
                                #   calculateFormProgress, getAgeGroupData, etc.
```

### Folder rationale

- **`const/`** — Every "magic value" in the codebase lives here. When a product requirement changes (e.g., status labels, table names, session expiry), there is exactly one file to edit.
- **`interface/`** — Centralises all TypeScript types. Components never define their own inline interfaces for shared data shapes.
- **`lib/`** — Pure, side-effect-free utilities and singleton client instances. Nothing in `lib/` knows about React.
- **`contexts/`** — The single source of truth for application state. All Supabase subscriptions and mutations flow through here.
- **`components/ui/`** — Feature-level components. Composed from the base atoms in `components/`.

---

## Real-Time Sync — How It Works

### Architecture

```markdown
Action flow
┌─────────────────┐ PostgreSQL ┌─────────────────────┐
│ Patient Page │ upsert (debounced 200ms) │ │
│ /patient?id=X │ ─────────────────────────► │ Supabase │
│ │ │ (patients table) │
│ [types in form]│ ◄────────────────────────── │ │
└─────────────────┘ Realtime postgres_changes └──────────┬──────────┘
│
│ postgres_changes
│ + presence sync
▼
┌─────────────────────┐
│ Staff Dashboard │
│ /staff-view │
│ │
│ [sees updates live]│
└─────────────────────┘
```

```
Real-time Synchronization Architecture Flow ( sequence )



[ Patient Client ]                  [ Supabase Backend ]                  [ Staff Dashboard Client ]
(Patient Form)                      (PostgreSQL + Realtime)               (Next.js React State)
      |                                      |                                      |
  1. Fill form & Submit -------------------->|                                      |
      | (HTTP POST Request)                  |                                      |
      |                                      |                                      |
      |                                2. Save data to table (WRITE)                |
      |                                      |                                      |
      |                                3. Write to WAL (Postgres Change)            |
      |                                      |                                      |
      |                                4. Read WAL & Broadcast via WebSocket ------>|
      |                                      |                                      |
      |                                      |                                5. Receive Payload Event (INSERT)
      |                                      |                                      |
      |                                      |                                6. Update React State
      |                                      |                                      |
      |                                      |                                7. UI Re-renders automatically!
```

## Pages

### `/patient` — Patient Registration Form

patient-full-desktop

![Patient Form Desktop](./public/image/readme/patient-full-desktop.png)

![Patient Form Mobile](./public/image/readme/patient-full-mobile.png)

- Session-based: each patient gets a unique `?id=` URL they can return to
- Live Sync indicator in the bottom of the form shows sync status
- Auto-generates a new session on first visit
- Submission triggers a countdown overlay before resetting the form

### `/staff-view` — Staff Dashboard

![Staff Dashboard](https://your-mockup-url-here.com/staff-dashboard.png)

- Real-time patient list, updating as patients type
- Online/Offline dot indicator per patient (via Supabase Presence)
- Filter by status: All / Active / Filling / Submitted
- "Contains" search across name, email, and session ID
- Analytics section: gender distribution, age groups, top languages
- Sidebar panel with full patient detail view + form progress bar

---

---

## ✨ Bonus Features

These features go beyond the core requirements and were added to improve the clinical staff experience.

### Analytics Dashboard

The staff view includes a dedicated analytics section built with **Recharts**, providing live-updating charts derived from the current patient dataset:

| Chart                  | Description                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Age Distribution**   | Horizontal bar chart breaking down patients into Kids (0–12), Teens (13–19), Adults (20–59), and Seniors (60+). Computed from `dateOfBirth` using a pure `calculateAge()` function. |
| **Language Mix**       | Donut pie chart showing the top 5 preferred languages across all registered patients. Helps staff anticipate interpreter needs.                                                     |
| **Registration Trend** | Line chart displaying daily registration volume over time, with today's count highlighted. Shows whether patient intake is increasing, stable, or declining.                        |
| **Average Completion** | A single KPI metric showing the mean form-fill progress (%) across all patients — at a glance, staff can tell how complete the data is.                                             |

All chart data is derived in real-time from the `allPatients` state — no separate API calls. When a new patient submits or updates their form, the charts update automatically via Supabase Realtime.

### Other Bonus Highlights

- **Supabase Presence** — Real-time online/offline dot indicator per patient, beyond just data sync
- **Session-based resumable forms** — Patients can close the tab and return to their in-progress form via the same URL
- **Form completion progress bar** — Each patient card in the staff view shows a live % progress indicator
- **Responsive design** — Two distinct layouts: data table on desktop, card stack on mobile
