# AI Study Planner — outcomes

## [x] Student dashboard and local workspace

- Show today's study sessions, upcoming deadlines, subjects, study-plan activities, completed tasks, recent activity and overall progress.
- Persist student-created planner data in this browser without requiring login; provide a visible clear-local-data control with an explicit confirmation.
- Start a fresh browser workspace with no placeholder subjects/topics, tasks/deadlines, sessions, notes, quiz attempts or editable-sample-workspace banner; show opt-in actions to add a subject or create a plan.
- On existing local workspaces, remove only the fixed demo subject `sample-python-foundations`, demo tasks `sample-task-functions`, `sample-task-conditionals`, `sample-task-variables`, and demo sessions `sample-session-one`, `sample-session-two`, `sample-session-three`. Preserve every other stored subject, task, session, note, quiz and customized preference; if a preserved task, session, note or quiz references the removed demo subject, keep that record and clear its subject association to unassigned. Clear the planner goal only if it still exactly equals the old default placeholder, “Prepare steadily and revisit difficult topics.”; preserve any other goal and all other settings.
- Do not prefill a student's first visit with a study schedule. Show the planner's empty state and opt-in creation actions until the student explicitly requests AI plan generation or adds a session; show “Refresh AI draft” only when a plan exists.

## [x] Editable subjects, topics and academic tasks

- Let students create and manage subjects and their topics without inventing course-specific syllabus content.
- Do not seed sample subjects or tasks; guide students to add a subject and their own topics before creating subject-linked tasks.
- Let students add assignments, projects, revision activities and presentations. Each task supports title, subject association, description, deadline, priority, estimated effort, task type and pending/completed status; show pending, completed and upcoming views.

## [x] Personalized, editable study plans

- Let students provide subjects/topics, available study time, exam/assignment dates, preferred study duration and study goals.
- Generate a structured personalized study schedule using those inputs plus task deadlines, priority and estimated effort; show conflicts or missing information instead of inventing academic content.
- Let students add, move, reschedule, edit and complete study sessions. Label AI-generated plans, keep them editable, and remind students to review them before relying on them.
- With no subjects, offer an explicit way to add a first subject before planning; show “Refresh AI draft” only when a plan exists.

## [x] Grounded AI Study Assistant

- Let students ask academic questions and request explanations, examples, simpler explanations, revision points or practice questions.
- Ground answers in the student-supplied subject/topic/notes/question context, label responses as AI-generated, include verification guidance, and keep the assistant positioned as support for—not a replacement for—independent study or teacher guidance.
- Preserve entered questions on recoverable failure and show a clear retry path; never display fabricated output as a successful AI response.

## [x] Notes, summaries and quizzes from student content

- Let students create and edit notes; generate shorter revision summaries only from content they enter.
- Generate quizzes from a selected student-provided topic or notes, never an invented syllabus. Let students submit answers, receive scoring and feedback, then review or retry; label generated material and invite verification.

## [x] Progress and responsible-AI transparency

- Track completed tasks, completed study sessions, subject-level progress, quiz performance and study consistency.
- Clearly mark generated content, make AI output editable, communicate uncertainty where applicable, remind students to verify AI-generated information, and guide them away from overdependence.

## [x] Botanical-lab interface, reference palette and integrated AI service

- Use the botanical-lab field-journal layout with the supplied four-band palette: deep periwinkle navy (`#405A98`), sky blue (`#70B7DF`), warm cream (`#FFF6DE`) and coral (`#F4889B`); keep botanical linework as a quiet motif and retain responsive accessible controls.
- Increase the existing compact font sizes modestly (about one pixel at small sizes/roughly 7% across the scale), preserving readable hierarchy and avoiding clipping on desktop and mobile.
- Provide AI functionality through a server-side Manus AI proxy using only configured platform runtime credentials; do not expose server credentials to browser code or require a separate provider key. Keep data local to the student's browser; do not add login, email/automatic reminders or publishing as part of this scope.

## [x] First-open onboarding for new students

- On a browser's first open, show a guided introduction explaining how to add subjects/topics, manage tasks and deadlines, generate and review an editable study plan, use the notes, quiz and AI companion tools, and track progress.
- Make the guide self-paced with Back/Next, Skip and Finish actions; store its seen/dismissed preference locally so it does not automatically reopen on the next visit, and provide an always-available “How it works” action to reopen it.
- Explain that study data is stored in this browser, only student-selected text is sent to Manus AI when an AI action is requested, and AI-generated suggestions should be checked against course materials.
- Use the site's existing navy, sky-blue, cream and coral Fieldnote design and make the guide accessible and usable on desktop and mobile.

## [x] Production deployment contract

- Include a root Dockerfile that uses the project's pinned pnpm toolchain and committed lockfile, installs dependencies under the checked-in lifecycle policy, builds the client/server, and starts `node dist/server.mjs` with `PORT` (default `3000`) on `0.0.0.0`.
- Configure the server project with Webdev `deploy.dockerfilePath: "Dockerfile"` and `deploy.healthPath: "/api/health"`; ensure this path is an unauthenticated 2xx response and do not bake private runtime credentials into the image.
