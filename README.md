# Little Yes — AI Mental Wellness & Courage Engine

A personalized, psychologically grounded web application that transforms mental health challenges (anxiety, overthinking, emotional burnout, imposter syndrome, and boundary struggles) into gentle, manageable micro-courage actions ("Little Yes").

Powered by **Google Gemini 2.5 Flash** through **Netlify AI Gateway** and serverless modern Netlify Functions (`.mts`).

## Features

- **Clinical Psychological Framework**: Grounded in Behavioral Activation (CBT), Mindful Self-Compassion, and nervous system regulation (Window of Tolerance).
- **Emotional Baseline Check-in**: Adapts courage thresholds to the user's immediate emotional capacity (e.g. Overwhelmed/Cemas, Burnout, Isolated, Self-Critical, or Ready to Grow).
- **AI Mental Health Dare Generation**: Generates 6 bespoke micro-actions tailored to the user's specific emotional struggle, complete with:
  - Psychological rationale explaining neuroplastic benefits (*"Mengapa ini baik untuk mentalmu"*)
  - Ultra-low friction starting step under 2 minutes (*"Langkah awal termudah"*)
  - Somatic grounding instructions if anxiety flares up (*"Jika rasa cemas muncul"*)
- **Ruang Teduh AI (Instant Mental Wellness Companion)**: Real-time empathetic AI sounding board that provides emotional de-escalation, cognitive reframing (CBT), grounding exercises, and actionable micro-dares.
- **AI Reflection & Debriefing**: When users take on or complete a dare, the AI provides personalized clinical validation, therapeutic insights, and daily affirmations to consolidate courage pathways.
- **Interactive Somatic Breathing Tool**: Calming 4-7-8 and Box Breathing circle with rhythmic visual animations for physiological regulation.
- **Crisis & Professional Helplines**: Verified Indonesian and international crisis resources (Kemenkes Sejiwa 119 ext 8, LISA Hotline, Yayasan Pulih, Into The Light) with ethical clinical safety disclaimers.
- **Zero-Downtime Fallback**: If offline or during network interruptions, the application gracefully falls back to an enriched local clinical rules engine.

## Netlify Architecture

- **AI Gateway**: Utilizes `@google/genai` zero-config integration proxied through Netlify AI Gateway (`gemini-2.5-flash`).
- **Netlify Functions**:
  - `netlify/functions/generate-dares.mts` — Synthesizes personalized therapeutic dares (`/api/generate-dares`).
  - `netlify/functions/reflect-dare.mts` — Evaluates user reflections and provides psychological debriefing (`/api/reflect-dare`).
  - `netlify/functions/mental-coach.mts` — Live conversational mental wellness companion (`/api/mental-coach`).
- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, and custom vintage-organic typography (`Playfair Display` + `DM Sans`).

## Getting Started

Requires Node.js 20+ and Yarn 4.

```sh
yarn install
yarn dev
```

For full Netlify Function and AI Gateway local emulation:
```sh
netlify dev --port 8889
```

## Available Scripts

- `yarn dev` — Start the local Vite development server
- `yarn build` — Type-check and create production bundle in `dist/`
- `yarn typecheck` — Run TypeScript type-checking
