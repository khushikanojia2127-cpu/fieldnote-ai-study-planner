import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Check,
  CircleHelp,
  Clock3,
  Leaf,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Card,
  EmptyState,
  PageTitle,
  ProgressBar,
  Tag,
} from "../../components/UI";
import type { AppData, ViewKey } from "../../types";
import { dateKey } from "../../lib/storage";

const weekday = new Intl.DateTimeFormat("en", { weekday: "long" }).format(
  new Date(),
);
const fullDate = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(new Date());

export function DashboardView({
  data,
  onNavigate,
  onToggleTask,
  onToggleSession,
  onCreateTask,
  onGeneratePlan,
}: {
  data: AppData;
  onNavigate: (page: ViewKey) => void;
  onToggleTask: (id: string) => void;
  onToggleSession: (id: string) => void;
  onCreateTask: () => void;
  onGeneratePlan: () => void;
}) {
  const today = dateKey(0);
  const sessions = data.sessions
    .filter((s) => s.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const tasks = [...data.tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);
  const doneTasks = data.tasks.filter((t) => t.completed).length;
  const overall = data.tasks.length
    ? Math.round((doneTasks / data.tasks.length) * 100)
    : 0;
  const minutesToday = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const completedSessions = sessions.filter((s) => s.completed).length;
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const recentActivity: {
    id: string;
    kind: "task" | "session" | "quiz";
    label: string;
    detail: string;
    at: string;
  }[] = [
    ...data.tasks.flatMap((task) =>
      task.completedAt
        ? [
            {
              id: `task-${task.id}`,
              kind: "task" as const,
              label: "Completed a task",
              detail: task.title,
              at: task.completedAt,
            },
          ]
        : [],
    ),
    ...data.sessions.flatMap((session) =>
      session.completedAt
        ? [
            {
              id: `session-${session.id}`,
              kind: "session" as const,
              label: "Completed a study block",
              detail: session.title,
              at: session.completedAt,
            },
          ]
        : [],
    ),
    ...data.quizzes.flatMap((quiz) =>
      quiz.lastScoreAt && typeof quiz.lastScore === "number"
        ? [
            {
              id: `quiz-${quiz.id}`,
              kind: "quiz" as const,
              label: `Practiced a quiz · ${quiz.lastScore}%`,
              detail: quiz.title,
              at: quiz.lastScoreAt,
            },
          ]
        : [],
    ),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);

  return (
    <div className="page-stack dashboard-page">
      <PageTitle
        eyebrow={`${weekday.toUpperCase()} · ${fullDate.toUpperCase()}`}
        title={`${greeting}, learner.`}
        description="A little structure for a lot of good thinking."
        action={
          <button
            className="button button-ghost"
            onClick={() => onNavigate("progress")}
          >
            <span>View progress</span>
            <ArrowUpRight size={16} />
          </button>
        }
      />
      <section className="focus-banner">
        <div className="focus-copy">
          <div className="focus-kicker">
            <span className="live-dot" /> YOUR FIELDNOTE FOR TODAY
          </div>
          <h2>
            Make room for
            <br />
            <em>one good idea.</em>
          </h2>
          <p>
            {sessions.length
              ? `${sessions.length} focused blocks are on your desk today. Start with the next small step.`
              : "Your next study block can be small, focused, and yours."}
          </p>
          <button className="button button-light" onClick={onGeneratePlan}>
            <Sparkles size={15} /> Build my study plan <ArrowRight size={15} />
          </button>
        </div>
        <div className="focus-illustration" aria-hidden="true">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="specimen">
            <svg viewBox="0 0 180 190" fill="none">
              <path
                d="M87 169C91 136 96 106 120 76C134 59 148 48 161 42"
                stroke="#D7E5C7"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M121 77C108 77 94 71 87 58C80 45 82 31 85 20C105 27 119 37 124 51C127 60 126 70 121 77Z"
                fill="#70B7DF"
              />
              <path
                d="M108 93C96 88 83 89 73 98C62 108 60 121 61 135C81 132 96 125 103 114C107 107 109 100 108 93Z"
                fill="#F7DCE0"
              />
              <path
                d="M136 60C137 47 146 36 158 32C170 28 179 30 188 33C182 49 173 59 161 63C151 66 142 64 136 60Z"
                fill="#F4889B"
              />
              <path
                d="M91 146C106 122 121 101 151 71"
                stroke="#DCEAF8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M119 100L106 97M136 83L137 68M153 66L166 54"
                stroke="#DCEAF8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="specimen-label specimen-label-one">
            FIG. 01 <i>focus</i>
          </span>
          <span className="specimen-label specimen-label-two">
            GROW AT YOUR OWN PACE
          </span>
        </div>
        <div className="focus-index">
          <span>01</span>
          <span>03</span>
        </div>
      </section>
      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-sage">
              <Clock3 size={17} />
            </span>
            <span className="stat-note">TODAY</span>
          </div>
          <strong>
            {Math.floor(minutesToday / 60)}h {minutesToday % 60 || "00"}m
          </strong>
          <span className="stat-caption">planned focus time</span>
          <div className="stat-foot">
            <span className="mini-bars">
              <i />
              <i />
              <i className="bar-on" />
              <i />
              <i className="bar-on" />
              <i />
              <i />
            </span>
            <span>
              {completedSessions}/{sessions.length} blocks done
            </span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-amber">
              <CalendarClock size={17} />
            </span>
            <span className="stat-note">IN THE QUEUE</span>
          </div>
          <strong>
            {data.tasks
              .filter((t) => !t.completed)
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <span className="stat-caption">open tasks & assignments</span>
          <div className="stat-foot">
            <span className="stat-foot-dot dot-amber" />
            <span>
              {
                data.tasks.filter(
                  (t) => !t.completed && t.dueDate <= dateKey(3),
                ).length
              }{" "}
              due in the next 3 days
            </span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-green">
              <Check size={17} />
            </span>
            <span className="stat-note">YOUR MOMENTUM</span>
          </div>
          <strong>{overall}%</strong>
          <span className="stat-caption">tasks completed this round</span>
          <div className="stat-foot">
            <span className="foot-track">
              <i style={{ width: `${overall}%` }} />
            </span>
            <span>
              {doneTasks} of {data.tasks.length} done
            </span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-blue">
              <BookOpen size={17} />
            </span>
            <span className="stat-note">IN YOUR GARDEN</span>
          </div>
          <strong>{data.subjects.length.toString().padStart(2, "0")}</strong>
          <span className="stat-caption">subjects being nurtured</span>
          <div className="stat-foot">
            <Leaf size={13} className="leaf-tiny" />
            <span>
              {data.sessions.filter((s) => s.aiGenerated).length} AI-drafted
              sessions
            </span>
          </div>
        </Card>
      </div>
      <div className="dashboard-columns">
        <Card className="today-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE NEXT FEW HOURS</p>
              <h2>Today's study blocks</h2>
            </div>
            <button className="text-link" onClick={() => onNavigate("planner")}>
              Open plan <ArrowRight size={14} />
            </button>
          </div>
          {sessions.length ? (
            <div className="session-list">
              {sessions.map((session) => {
                const subject = data.subjects.find(
                  (s) => s.id === session.subjectId,
                );
                return (
                  <div
                    className={`session-row ${session.completed ? "session-completed" : ""}`}
                    key={session.id}
                  >
                    <button
                      className={`session-check ${session.completed ? "checked" : ""}`}
                      aria-label={
                        session.completed
                          ? "Mark session incomplete"
                          : "Complete session"
                      }
                      onClick={() => onToggleSession(session.id)}
                    >
                      {session.completed && <Check size={13} />}
                    </button>
                    <div className="session-time">
                      {session.startTime || "—"}
                    </div>
                    <div
                      className="session-divider"
                      style={{ background: subject?.color || "#719677" }}
                    />
                    <div className="session-detail">
                      <div>
                        <strong>{session.title}</strong>
                        {session.aiGenerated && <Tag tone="sage">AI draft</Tag>}
                      </div>
                      <span>
                        {subject?.name || "Unassigned"}
                        {session.focus ? ` · ${session.focus}` : ""}
                      </span>
                    </div>
                    <span className="session-length">
                      {session.minutes} min
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="A fresh page"
              message="There are no study blocks on today's page yet."
              action={
                <button
                  className="button button-secondary"
                  onClick={onGeneratePlan}
                >
                  Draft a plan
                </button>
              }
            />
          )}
          <div className="session-footer">
            <span className="footer-marker">
              <span /> BLOCKS BUILT FOR REAL LIFE
            </span>
            <button
              className="icon-link"
              aria-label="Open study plan"
              onClick={() => onNavigate("planner")}
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </Card>
        <Card className="deadline-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ON YOUR HORIZON</p>
              <h2>Next deadlines</h2>
            </div>
            <button
              className="icon-link"
              aria-label="Open all tasks"
              onClick={() => onNavigate("tasks")}
            >
              <ArrowUpRight size={17} />
            </button>
          </div>
          {tasks.length ? (
            <div className="deadline-list">
              {tasks.map((task) => {
                const subject = data.subjects.find(
                  (s) => s.id === task.subjectId,
                );
                const days = Math.round(
                  (new Date(`${task.dueDate}T00:00:00`).getTime() -
                    new Date(`${today}T00:00:00`).getTime()) /
                    86400000,
                );
                return (
                  <div className="deadline-row" key={task.id}>
                    <button
                      className="task-circle"
                      aria-label={`Complete ${task.title}`}
                      onClick={() => onToggleTask(task.id)}
                    />
                    <div className="deadline-copy">
                      <strong>{task.title}</strong>
                      <span>
                        <i
                          style={{ background: subject?.color || "#719677" }}
                        />
                        {subject?.name || "Unassigned"} · {task.kind}
                      </span>
                    </div>
                    <Tag
                      tone={days <= 2 ? "rose" : days <= 4 ? "amber" : "sage"}
                    >
                      {days <= 0
                        ? "Today"
                        : days === 1
                          ? "Tomorrow"
                          : `${days} days`}
                    </Tag>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Nothing due"
              message="Add a task when something lands on your desk."
              action={
                <button
                  className="button button-secondary"
                  onClick={onCreateTask}
                >
                  <Plus size={15} /> Add a task
                </button>
              }
            />
          )}
          <button className="add-task-line" onClick={onCreateTask}>
            <Plus size={15} /> Add an academic task
          </button>
        </Card>
      </div>
      <div className="bottom-grid">
        <Card className="subject-progress-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE AT A TIME</p>
              <h2>Subjects in progress</h2>
            </div>
            <button
              className="text-link"
              onClick={() => onNavigate("subjects")}
            >
              All subjects <ArrowRight size={14} />
            </button>
          </div>
          {data.subjects.length ? (
            <div className="subject-progress-list">
              {data.subjects.slice(0, 4).map((subject) => {
                const related = data.tasks.filter(
                  (t) => t.subjectId === subject.id,
                );
                const completed = related.filter((t) => t.completed).length;
                const progress = related.length
                  ? Math.round((completed / related.length) * 100)
                  : 0;
                return (
                  <div className="subject-progress-row" key={subject.id}>
                    <div
                      className="subject-mark"
                      style={{ background: subject.color }}
                    >
                      {subject.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="subject-progress-main">
                      <div className="subject-progress-label">
                        <strong>{subject.name}</strong>
                        <span>
                          {completed}/{related.length} tasks
                        </span>
                      </div>
                      <ProgressBar value={progress} color={subject.color} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Add your first subject"
              message="Start with a course or topic you're working on."
              action={
                <button
                  className="button button-secondary"
                  onClick={() => onNavigate("subjects")}
                >
                  Add a subject
                </button>
              }
            />
          )}
        </Card>
        <Card className="rhythm-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR STUDY RHYTHM</p>
              <h2>Seven days, softly</h2>
            </div>
            <span className="rhythm-week">THIS WEEK</span>
          </div>
          <div
            className="rhythm-chart"
            aria-label="Study sessions planned over the next seven days"
          >
            {Array.from({ length: 7 }, (_, i) => {
              const date = dateKey(i - new Date().getDay() + 1);
              const count = data.sessions.filter((s) => s.date === date).length;
              const height = Math.max(16, Math.min(90, count * 29));
              return (
                <div className="rhythm-day" key={i}>
                  <div className="rhythm-bar-track">
                    <span
                      className={
                        date === dateKey(0)
                          ? "rhythm-bar rhythm-today"
                          : "rhythm-bar"
                      }
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span>
                    {new Intl.DateTimeFormat("en", {
                      weekday: "narrow",
                    }).format(new Date(`${date}T12:00:00`))}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="rhythm-note">
            <span className="rhythm-legend" /> Planned sessions{" "}
            <span className="rhythm-average">No streaks. Just a rhythm.</span>
          </div>
        </Card>
      </div>
      <Card className="recent-activity-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A RECORD OF YOUR EFFORT</p>
            <h2>Recent activity</h2>
          </div>
          <span className="rhythm-week">ON THIS DEVICE</span>
        </div>
        {recentActivity.length ? (
          <div className="recent-activity-list">
            {recentActivity.map((item) => (
              <div className="recent-activity-row" key={item.id}>
                <span className={`recent-activity-icon activity-${item.kind}`}>
                  {item.kind === "task" ? (
                    <Check size={14} />
                  ) : item.kind === "session" ? (
                    <Clock3 size={14} />
                  ) : (
                    <CircleHelp size={14} />
                  )}
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
                <time>
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(item.at))}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <div className="activity-empty">
            <Leaf size={16} />
            <span>
              Complete a task, finish a study block or practice a quiz to see
              your recent effort here.
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
