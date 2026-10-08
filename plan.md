# AI Study Planner — implementation and design plan

## Product scope

Build a responsive study-planning web app for college students from the accepted project Blueprint and the attached project report. Deliver a dashboard; editable subjects/topics; academic task and deadline management; AI-generated, editable study schedules; a grounded AI Study Assistant; student-content-based notes and summaries; quizzes with answer submission and feedback; progress tracking; and visible responsible-AI guidance. The attached PDF is a project report, not a trustworthy complete course syllabus. Do not fabricate course material: let students create their own content and clearly identify any optional starter records as editable sample data.

Optional automatic/email deadline reminders, accounts/login, and publication are out of scope. Use browser-local persistence so the planner works without registration. AI requests use the configured server-side Manus AI service; the browser must never receive the server credential.

## Implementation approach

- Create a React + TypeScript + Vite client and a small Node/Express server in the same project, listening on the configured port 3000. The Express server serves the client build in production and exposes a narrow `/api/ai` endpoint for allowed AI actions.
- Use the configured Manus platform endpoint and server credential at runtime to call the OpenAI-compatible chat-completions endpoint. Do not hardcode credentials or request a separate provider key. Validate action inputs and model output; present generated text as AI-produced and editable. AI output is grounded only in the subject/topic/notes/question and schedule constraints supplied by the student. If generation fails, retain student input and show a recoverable error; do not fabricate an AI response.
- Persist subjects, topics, tasks, study sessions, notes, quiz attempts and user preferences in versioned browser `localStorage`. Seed only a small, visibly labelled editable sample set for a first-run preview; keep a one-click clear/reset option. No account, remote student-data database, email or reminders.
- Use client modules for the dashboard, navigation, subject/task CRUD, planner generation/editing, assistant, notes/summary, quiz, progress and shared storage/types. Favor semantic, accessible controls and responsive layouts.
- Schedule generation should include the student's chosen study window, task deadlines/priority/estimated effort, subject topics, available study time, preferred session length and target. AI proposes a structured schedule; the UI validates it, shows conflicts or gaps, and allows students to revise, move, reschedule and complete each session.
- Summary generation must use only text the student entered. Quiz generation must use only the selected student-provided notes/topic; support answer selection/submission, scoring, explanations, retry/review and visible AI attribution.

## Project structure

- `src/` — React/TypeScript client entry, app shell, UI components, feature views and styling.
- `src/features/dashboard/` — deadline, today, activity and aggregate progress summaries.
- `src/features/subjects/` — subject/topic CRUD and editable sample-data handling.
- `src/features/tasks/` — academic task CRUD, fields, filters and completion state.
- `src/features/planner/` — availability/preferences, AI schedule request, schedule display/edit/reschedule/complete actions.
- `src/features/assistant/` — context-grounded academic Q&A and generation states.
- `src/features/notes/` — student note editing and source-grounded summaries.
- `src/features/quizzes/` — quiz creation, answering, scoring, feedback and review.
- `src/features/progress/` — aggregate and subject-level completion, quiz performance and consistency.
- `src/lib/` — shared types, local persistence, date/validation utilities and API client.
- `server/` — Express API, Manus AI service proxy and production static-file serving.
- `public/manus-routes.json` — synchronized declaration for the single-page app route `/`.
- Root `package.json`, `tsconfig.json`, Vite/server configuration and `app.config.ts` — pinned toolchain/scripts, compilation and app metadata.

## Design system

- **Design Movement:** Botanical laboratory field journal recolored with the user's reference: precise field notes framed by confident blue color blocks, warm paper and a small coral signal.
- **Core Principles:** Calm focus; legible evidence; student agency; precise, transparent AI.
- **Color Philosophy:** Deep periwinkle navy anchors navigation and primary actions; clear sky blue adds lift and progress; warm cream keeps the study surface soft; coral marks attention and quick actions. Preserve strong contrast and retain botanical linework as a quiet motif rather than a green color wash.
- **Layout Paradigm:** A field-notes workspace: narrow, stable instrument-rail navigation; a wide working canvas; and context cards for “today,” upcoming deadlines and AI provenance. Use asymmetrical editorial sections rather than a centered grid of identical cards.
- **Signature Elements:** Fine botanical linework and leaf-vein dividers; specimen-style subject chips recolored with navy/blue/coral swatches; ruled notebook and index-label details for study sessions and source notes.
- **Interaction Philosophy:** Direct manipulation, quick inline edits, clear completion controls and reversible scheduling changes. AI suggestions are drafts, not commands; always keep the source/context visible and explain conflicts before accepting a plan.
- **Animation:** Subtle 140–220ms opacity/position transitions for opening panels and completing items; gentle progress-ring movement; reduced-motion support; no perpetual or distracting animation.
- **Typography System:** DM Sans for interface/body copy paired with Fraunces for large headings and specimen names. Increase the existing compact type scale by roughly one pixel at small sizes (about 7% overall), keeping its hierarchy and tabular numerals for durations/progress.
- **Brand Essence:** “Fieldnote turns your own coursework into a plan you can actually follow.” Personality: grounded, curious, encouraging.
- **Brand Voice:** Clear, calm, student-to-student; name evidence and next action rather than making motivational promises. Examples: “A small, focused block is still progress.” “Drafted from your topics — check the order, then make it yours.”
- **Wordmark & Logo:** A distinctive “Fieldnote” wordmark paired with a small custom sprout/leaf-vein glyph nested in a rounded specimen-tab outline; recolor the mark in navy, cream and coral.
- **Signature Brand Color:** Deep periwinkle navy `#405A98`, balanced with sky blue `#70B7DF`, warm cream `#FFF6DE` and coral `#F4889B`.

## Serving and dependencies

The browser client calls only relative application routes. The Express server calls the Manus AI endpoint with `MANUS_API_URL` and `MANUS_API_KEY` on the server side. No database or authentication is provisioned. A Vite development server/proxy supports local Preview; a single Node production process serves built client assets and `/api/ai`. Keep browser-facing requests relative for the Preview proxy. Avoid decorative assets; the planner is an internal productivity dashboard, and its visuals should come from the designed interface itself.
