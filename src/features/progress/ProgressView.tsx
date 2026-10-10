import {
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  CircleHelp,
  Leaf,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  EmptyState,
  PageTitle,
  ProgressBar,
  Tag,
} from "../../components/UI";
import { formatDate } from "../../lib/format";
import { dateKey } from "../../lib/storage";
import type { AppData, ViewKey } from "../../types";

export function ProgressView({
  data,
  onNavigate,
}: {
  data: AppData;
  onNavigate: (page: ViewKey) => void;
}) {
  const doneTasks = data.tasks.filter((t) => t.completed).length;
  const doneSessions = data.sessions.filter((s) => s.completed).length;
  const totalMinutes = data.sessions
    .filter((s) => s.completed)
    .reduce((sum, session) => sum + session.minutes, 0);
  const quizScores = data.quizzes
    .map((q) => q.lastScore)
    .filter((score): score is number => typeof score === "number");
  const averageQuiz = quizScores.length
    ? Math.round(
        quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length,
      )
    : 0;
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = dateKey(i - 6);
    return {
      key,
      count: data.sessions.filter((s) => s.date === key && s.completed).length,
      minutes: data.sessions
        .filter((s) => s.date === key && s.completed)
        .reduce((sum, session) => sum + session.minutes, 0),
    };
  });
  const max = Math.max(1, ...days.map((day) => day.minutes));
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="NOTICE YOUR OWN MOMENTUM"
        title="Progress, at your pace"
        description="A few signals to help you see what is working. No streaks, no pressure."
        action={
          <Tag tone="paper">
            <Leaf size={13} /> YOURS TO INTERPRET
          </Tag>
        }
      />
      <div className="progress-stat-grid">
        <Card className="progress-stat">
          <span className="progress-stat-icon">
            <CheckCircle2 size={18} />
          </span>
          <span className="eyebrow">TASKS FINISHED</span>
          <strong>
            {doneTasks}
            <small> / {data.tasks.length}</small>
          </strong>
          <ProgressBar
            value={
              data.tasks.length ? (doneTasks / data.tasks.length) * 100 : 0
            }
          />
          <span>Academic work completed</span>
        </Card>
        <Card className="progress-stat">
          <span className="progress-stat-icon">
            <CalendarCheck2 size={18} />
          </span>
          <span className="eyebrow">STUDY BLOCKS</span>
          <strong>
            {doneSessions}
            <small> / {data.sessions.length}</small>
          </strong>
          <ProgressBar
            value={
              data.sessions.length
                ? (doneSessions / data.sessions.length) * 100
                : 0
            }
            color="#6d9694"
          />
          <span>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m of completed
            focus
          </span>
        </Card>
        <Card className="progress-stat">
          <span className="progress-stat-icon">
            <CircleHelp size={18} />
          </span>
          <span className="eyebrow">QUIZ PRACTICE</span>
          <strong>
            {averageQuiz}
            <small>{quizScores.length ? "%" : "—"}</small>
          </strong>
          <ProgressBar
            value={quizScores.length ? averageQuiz : 0}
            color="#b18a55"
          />
          <span>
            {quizScores.length
              ? `${quizScores.length} scored attempts`
              : "No scored attempts yet"}
          </span>
        </Card>
        <Card className="progress-stat">
          <span className="progress-stat-icon">
            <BookOpen size={18} />
          </span>
          <span className="eyebrow">COURSE GARDEN</span>
          <strong>
            {data.subjects.length}
            <small> subjects</small>
          </strong>
          <span className="subject-count-caption">
            {data.subjects.reduce(
              (sum, subject) => sum + subject.topics.length,
              0,
            )}{" "}
            student-added topics in your library
          </span>
        </Card>
      </div>
      <div className="progress-main-grid">
        <Card className="weekly-progress">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE PAST SEVEN DAYS</p>
              <h2>Time you chose to study</h2>
            </div>
            <Tag tone="sage">
              <TrendingUp size={13} /> STEADY OVER PERFECT
            </Tag>
          </div>
          <div className="weekly-chart">
            {days.map((day) => (
              <div className="weekly-day" key={day.key}>
                <span className="chart-time">
                  {day.minutes
                    ? `${Math.floor(day.minutes / 60)}h ${day.minutes % 60 ? `${day.minutes % 60}m` : ""}`
                    : "—"}
                </span>
                <div className="weekly-track">
                  <span
                    className="weekly-fill"
                    style={{
                      height: `${Math.max(4, (day.minutes / max) * 100)}%`,
                      opacity: day.minutes ? 1 : 0.24,
                    }}
                  />
                </div>
                <span className="chart-label">
                  {formatDate(day.key, { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
          <div className="weekly-chart-foot">
            <span>
              <span className="chart-dot" />
              Completed sessions
            </span>
            <span>Consistency matters more than perfect attendance.</span>
          </div>
        </Card>
        <Card className="subject-coverage">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BY SUBJECT</p>
              <h2>Learning in layers</h2>
            </div>
          </div>
          {data.subjects.length ? (
            <div className="coverage-list">
              {data.subjects.map((subject) => {
                const tasks = data.tasks.filter(
                  (t) => t.subjectId === subject.id,
                );
                const completed = tasks.filter((t) => t.completed).length;
                const sessions = data.sessions.filter(
                  (s) => s.subjectId === subject.id && s.completed,
                ).length;
                const value = tasks.length
                  ? Math.round((completed / tasks.length) * 100)
                  : 0;
                return (
                  <div className="coverage-item" key={subject.id}>
                    <div className="coverage-top">
                      <span
                        className="coverage-marker"
                        style={{ background: subject.color }}
                      />
                      <div>
                        <strong>{subject.name}</strong>
                        <span>
                          {completed}/{tasks.length} tasks · {sessions} sessions
                          done
                        </span>
                      </div>
                      <span>{value}%</span>
                    </div>
                    <ProgressBar value={value} color={subject.color} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Your first layer"
              message="Add a subject to start seeing your progress here."
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
      </div>
      <div className="progress-footnote">
        <Leaf size={15} />
        <span>
          Progress reflects only what you record in Fieldnote on this device. A
          missed day is simply a new page.
        </span>
        <button onClick={() => onNavigate("planner")}>Adjust your plan</button>
      </div>
    </div>
  );
}
