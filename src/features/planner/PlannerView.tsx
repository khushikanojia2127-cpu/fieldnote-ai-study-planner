import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  Clock3,
  Leaf,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  EmptyState,
  LoadingButton,
  PageTitle,
  Tag,
} from "../../components/UI";
import { dateKey } from "../../lib/storage";
import { newId, type AppData, type StudySession } from "../../types";

export function PlannerView({
  data,
  onUpdate,
  onGenerate,
  busy,
}: {
  data: AppData;
  onUpdate: (transform: (state: AppData) => AppData) => void;
  onGenerate: () => void;
  busy: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    subjectId: data.subjects[0]?.id || "",
    date: dateKey(0),
    minutes: 30,
    focus: "",
  });
  const sessions = useMemo(
    () =>
      [...data.sessions].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(b.startTime),
      ),
    [data.sessions],
  );
  const groups = sessions.reduce<Record<string, StudySession[]>>(
    (result, session) => {
      (result[session.date] ||= []).push(session);
      return result;
    },
    {},
  );
  const updatePreference = (
    key: keyof AppData["preferences"],
    value: number | string,
  ) =>
    onUpdate((state) => ({
      ...state,
      preferences: { ...state.preferences, [key]: value },
    }));
  const updateSession = (id: string, patch: Partial<StudySession>) =>
    onUpdate((state) => ({
      ...state,
      sessions: state.sessions.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        if (patch.completed !== undefined)
          updated.completedAt = patch.completed
            ? new Date().toISOString()
            : undefined;
        return updated;
      }),
    }));
  const removeSession = (id: string) =>
    onUpdate((state) => ({
      ...state,
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
  const moveSession = (session: StudySession, direction: number) => {
    const date = new Date(`${session.date}T12:00:00`);
    date.setDate(date.getDate() + direction);
    updateSession(session.id, {
      date: new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 10),
    });
  };
  const addSession = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.subjectId) return;
    const session: StudySession = {
      ...draft,
      id: newId(),
      title: draft.title.trim(),
      startTime: "10:00",
      minutes: Number(draft.minutes),
      completed: false,
      aiGenerated: false,
    };
    onUpdate((state) => ({ ...state, sessions: [...state.sessions, session] }));
    setDraft((current) => ({ ...current, title: "", focus: "" }));
    setAdding(false);
  };
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="A PLAN WITH ROOM TO BREATHE"
        title="Study plan"
        description="A draft rhythm—not a deadline machine. Adjust anything that doesn't fit."
        action={
          <LoadingButton
            className="button button-primary"
            onClick={onGenerate}
            busy={busy}
            disabled={!data.subjects.length}
          >
            <Sparkles size={16} /> Draft with AI
          </LoadingButton>
        }
      />
      <div className="plan-intro-banner">
        <div className="plan-intro-icon">
          <Leaf size={19} />
        </div>
        <div>
          <strong>Start with your real week.</strong>
          <p>
            When you draft, your subjects, topics, study settings and open
            deadlines are sent to Manus AI. Review and edit every suggested
            session.
          </p>
        </div>
        <Tag tone="paper">YOU'RE IN CONTROL</Tag>
      </div>
      <div className="plan-layout">
        <Card className="plan-settings">
          <p className="eyebrow">YOUR STUDY WINDOW</p>
          <h2>What feels realistic?</h2>
          <p className="muted-copy">
            These settings help keep suggestions gentle and doable.
          </p>
          <label>
            Minutes available each day
            <div className="input-suffix">
              <input
                type="number"
                min="15"
                max="600"
                step="15"
                value={data.preferences.dailyMinutes}
                onChange={(e) =>
                  updatePreference(
                    "dailyMinutes",
                    Math.max(15, Number(e.target.value)),
                  )
                }
              />
              <span>min / day</span>
            </div>
          </label>
          <label>
            Preferred block length
            <div className="input-suffix">
              <input
                type="number"
                min="15"
                max="180"
                step="5"
                value={data.preferences.sessionMinutes}
                onChange={(e) =>
                  updatePreference(
                    "sessionMinutes",
                    Math.max(15, Number(e.target.value)),
                  )
                }
              />
              <span>min / session</span>
            </div>
          </label>
          <label>
            Planning horizon
            <select
              value={data.preferences.horizonDays}
              onChange={(e) =>
                updatePreference("horizonDays", Number(e.target.value))
              }
            >
              <option value={3}>Next 3 days</option>
              <option value={7}>Next 7 days</option>
              <option value={10}>Next 10 days</option>
              <option value={14}>Next 14 days</option>
            </select>
          </label>
          <label>
            Study goal
            <textarea
              rows={3}
              value={data.preferences.goal}
              onChange={(e) => updatePreference("goal", e.target.value)}
              placeholder="What would feel good to make progress on?"
            />
          </label>
          <div className="plan-settings-note">
            <Clock3 size={15} />
            <span>Deadlines and task priority are considered too.</span>
          </div>
          <LoadingButton
            className="button button-primary button-block"
            onClick={onGenerate}
            busy={busy}
            disabled={!data.subjects.length}
          >
            <Sparkles size={15} /> Build a study draft
          </LoadingButton>
          <button
            className="button button-soft button-block"
            onClick={() => setAdding(true)}
            disabled={!data.subjects.length}
          >
            <Plus size={15} /> Add a session yourself
          </button>
        </Card>
        <div className="schedule-panel">
          <div className="schedule-panel-head">
            <div>
              <p className="eyebrow">YOUR WORKING SCHEDULE</p>
              <h2>
                {sessions.length} study{" "}
                {sessions.length === 1 ? "block" : "blocks"}
              </h2>
            </div>
            <button className="text-link" onClick={onGenerate} disabled={busy}>
              <RefreshCw size={14} /> Refresh AI draft
            </button>
          </div>
          {sessions.length ? (
            <div className="schedule-days">
              {Object.entries(groups).map(([date, items]) => (
                <div className="schedule-day" key={date}>
                  <div className="schedule-date">
                    <span className="date-marker">
                      {new Intl.DateTimeFormat("en", { day: "2-digit" }).format(
                        new Date(`${date}T12:00:00`),
                      )}
                    </span>
                    <span>
                      <strong>
                        {date === dateKey()
                          ? "Today"
                          : new Intl.DateTimeFormat("en", {
                              weekday: "long",
                            }).format(new Date(`${date}T12:00:00`))}
                      </strong>
                      <small>
                        {new Intl.DateTimeFormat("en", {
                          month: "long",
                          day: "numeric",
                        }).format(new Date(`${date}T12:00:00`))}
                      </small>
                    </span>
                    <span className="date-tally">
                      {items.length} {items.length === 1 ? "block" : "blocks"}
                    </span>
                  </div>
                  <div className="schedule-cards">
                    {items.map((session) => {
                      const subject = data.subjects.find(
                        (s) => s.id === session.subjectId,
                      );
                      return (
                        <div
                          className={`study-session-card ${session.completed ? "study-session-done" : ""}`}
                          key={session.id}
                        >
                          <span
                            className="session-color-line"
                            style={{
                              backgroundColor: subject?.color || "#719677",
                            }}
                          />
                          <div className="study-session-time">
                            <Clock3 size={14} />
                            {session.startTime || "10:00"}
                            <br />
                            <span>{session.minutes} min</span>
                          </div>
                          <div className="study-session-main">
                            <div className="study-session-title">
                              <strong>{session.title}</strong>
                              {session.aiGenerated && (
                                <Tag tone="sage">AI draft</Tag>
                              )}
                            </div>
                            <span className="study-session-subject">
                              {subject?.name || "Unassigned"}
                            </span>
                            {session.focus && <p>{session.focus}</p>}
                            <div className="session-edit-row">
                              <label>
                                <CalendarDays size={13} />
                                <input
                                  type="date"
                                  aria-label={`Reschedule ${session.title}`}
                                  value={session.date}
                                  onChange={(e) =>
                                    updateSession(session.id, {
                                      date: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="session-duration">
                                <Clock3 size={13} />
                                <input
                                  type="number"
                                  aria-label={`Duration for ${session.title}`}
                                  min="10"
                                  max="180"
                                  step="5"
                                  value={session.minutes}
                                  onChange={(e) =>
                                    updateSession(session.id, {
                                      minutes: Number(e.target.value),
                                    })
                                  }
                                />{" "}
                                min
                              </label>
                              <button
                                className="mini-edit-button"
                                onClick={() => moveSession(session, -1)}
                                title="Move one day earlier"
                              >
                                <ArrowUp size={13} />
                                <span className="sr-only">
                                  Move one day earlier
                                </span>
                              </button>
                              <button
                                className="mini-edit-button"
                                onClick={() => moveSession(session, 1)}
                                title="Move one day later"
                              >
                                <ArrowDown size={13} />
                                <span className="sr-only">
                                  Move one day later
                                </span>
                              </button>
                              <button
                                className="mini-edit-button remove-session"
                                onClick={() => removeSession(session.id)}
                                title="Remove session"
                              >
                                <Trash2 size={13} />
                                <span className="sr-only">Remove session</span>
                              </button>
                            </div>
                          </div>
                          <button
                            className={`session-check ${session.completed ? "checked" : ""}`}
                            aria-label={
                              session.completed
                                ? "Mark session incomplete"
                                : "Complete session"
                            }
                            onClick={() =>
                              updateSession(session.id, {
                                completed: !session.completed,
                              })
                            }
                          >
                            {session.completed && <Check size={13} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                title="No sessions planned"
                message="Add your subjects and topics, then ask AI for a starting draft—or add a study block yourself."
              />
            </Card>
          )}
        </div>
      </div>
      {adding && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAdding(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="session-modal-title">Add a study block</h2>
                <p>A focused moment you can move later.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setAdding(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form className="form-stack" onSubmit={addSession}>
              <label>
                Session title
                <input
                  autoFocus
                  required
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  placeholder="e.g. Revisit SQL joins"
                />
              </label>
              <label>
                Subject
                <select
                  value={draft.subjectId}
                  onChange={(e) =>
                    setDraft({ ...draft, subjectId: e.target.value })
                  }
                >
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-row">
                <label>
                  Date
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) =>
                      setDraft({ ...draft, date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Minutes
                  <input
                    type="number"
                    min="10"
                    max="180"
                    step="5"
                    value={draft.minutes}
                    onChange={(e) =>
                      setDraft({ ...draft, minutes: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
              <label>
                Focus <span className="optional-label">Optional</span>
                <textarea
                  rows={2}
                  value={draft.focus}
                  onChange={(e) =>
                    setDraft({ ...draft, focus: e.target.value })
                  }
                  placeholder="What will you try?"
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
                <button className="button button-primary" type="submit">
                  Add block
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
