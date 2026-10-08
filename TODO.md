# AI Study Planner — outcomes

## [x] Student dashboard and local workspace
- Show today's study sessions, upcoming deadlines, subjects, study-plan activities, completed tasks, recent activity and overall progress.
- Persist student-created planner data in this browser without requiring login; provide a visible way to clear/reset local data. If starter records are shown, label each set as editable sample data.

## [x] Editable subjects, topics and academic tasks
- Let students create and manage subjects and their topics without inventing course-specific syllabus content.
- Let students add assignments, projects, revision activities and presentations. Each task supports title, subject association, description, deadline, priority, estimated effort, task type and pending/completed status; show pending, completed and upcoming views.

## [x] Personalized, editable study plans
- Let students provide subjects/topics, available study time, exam/assignment dates, preferred study duration and study goals.
- Generate a structured personalized study schedule using those inputs plus task deadlines, priority and estimated effort; show conflicts or missing information instead of inventing academic content.
- Let students add, move, reschedule, edit and complete study sessions. Label AI-generated plans, keep them editable, and remind students to review them before relying on them.

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

## [ ] Production deployment contract
- Include a root Dockerfile that uses the project's pinned pnpm toolchain and committed lockfile, installs dependencies under the checked-in lifecycle policy, builds the client/server, and starts `node dist/server.mjs` with `PORT` (default `3000`) on `0.0.0.0`.
- Configure the server project with Webdev `deploy.dockerfilePath: "Dockerfile"` and `deploy.healthPath: "/api/health"`; ensure this path is an unauthenticated 2xx response and do not bake private runtime credentials into the image.
