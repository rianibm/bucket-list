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
- **Interactive Somatic Breathing Tool**: Calming four-phase Box Breathing circle with rhythmic visual animations for physiological regulation.
- **Crisis & Professional Helplines**: Indonesian emergency and support resources (119 for medical emergencies, healing119.id for psychological support, Yayasan Pulih, Into The Light) with visible emergency guidance. Support-service availability can change.
- **Explicit Fallbacks**: If inference is unavailable, the application labels general local support clearly. Crisis disclosures take priority over ordinary coaching, including while offline.

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

## Safety, privacy, and usage limits

All three inference endpoints accept same-origin JSON requests, validate input and output schemas, limit request bodies to 16 KiB, and bound model output to 4,096 tokens. Requests are limited across endpoints to 5 per minute and 20 per UTC day per hashed visitor IP, with a shared site budget of 200 inference requests per UTC day. Atomic quota reservations use Netlify Database and Drizzle; the generated migration is applied automatically during deployment. If quota storage is unavailable, inference fails closed and the client offers labeled general support. Failed provider attempts still consume a quota reservation. Daily limits reset at midnight UTC; the short retry header does not override daily exhaustion.

Quota rows contain counters, expiry timestamps, and daily IP hashes; they contain no raw IPs, messages, intentions, or reflections. Expired counters are removed when reserving subsequent requests. The public application does not require accounts, so IP limits can affect people sharing a network. The site-wide request cap bounds anonymous inference usage even across multiple IPs.

Personal lists and reflections remain only in the current page session and disappear on reload. Legacy localStorage records are removed without being rendered. The clear-data control resets the session, removes legacy records, and prevents pending replies from restoring cleared data. Messages submitted to AI are processed by the AI provider; the clear-data control cannot retract an already submitted provider request.

Crisis routing uses conservative phrase matching before network access and again on the server. It does not diagnose risk or detect every possible crisis. Emergency help remains accessible throughout the application, and every coach session includes immediate safety guidance regardless of classification. AI instructions prioritize escalation and prohibit diagnosis or treatment claims.

Run `yarn test` for security and interface regression tests, and `yarn typecheck` for application, server function, database, and tooling type checks.
