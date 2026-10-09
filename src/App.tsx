import {
  ArrowRight,
  CircleHelp,
  Leaf,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandMark, Sidebar } from "./components/Sidebar";
import { IntroTour } from "./components/IntroTour";
import { AssistantView } from "./features/assistant/AssistantView";
import { DashboardView } from "./features/dashboard/DashboardView";
import { NotesView } from "./features/notes/NotesView";
import { PlannerView } from "./features/planner/PlannerView";
import { ProgressView } from "./features/progress/ProgressView";
import { QuizzesView } from "./features/quizzes/QuizzesView";
import { SubjectsView } from "./features/subjects/SubjectsView";
import { TasksView } from "./features/tasks/TasksView";
import { generatePlan as requestPlan } from "./lib/ai";
import { clearWorkspace, dateKey, loadData, saveData } from "./lib/storage";
import type { AppData, StudySession, ViewKey } from "./types";

const viewDetails: Record<ViewKey, { label: string; subtitle: string }> = {
  today: { label: "Today", subtitle: "Your study desk" },
  subjects: { label: "Subjects", subtitle: "Course library" },
  tasks: { label: "Tasks & deadlines", subtitle: "Your to-do list" },
  planner: { label: "Study plan", subtitle: "Your working schedule" },
  assistant: { label: "AI study companion", subtitle: "Learning support" },
  notes: { label: "Notes & summaries", subtitle: "Your notebook" },
  quizzes: { label: "Quizzes", subtitle: "Practice shelf" },
  progress: { label: "Progress", subtitle: "Study rhythm" },
};
const INTRO_STORAGE_KEY = "fieldnote.intro.seen.v1";

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [view, setView] = useState<ViewKey>("today");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [busyPlan, setBusyPlan] = useState(false);
  const [toast, setToast] = useState("");
  const [introOpen, setIntroOpen] = useState(false);
  useEffect(() => {
    try {
      setIntroOpen(window.localStorage.getItem(INTRO_STORAGE_KEY) !== "seen");
    } catch {
      setIntroOpen(true);
    }
  }, []);
  const dismissIntro = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "seen");
    } catch {
      // Keep the guide usable if browser storage is unavailable.
    }
    setIntroOpen(false);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        document
          .querySelector<HTMLInputElement>(".global-search input")
          ?.focus();
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    saveData(data);
  }, [data]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    document.title = `Fieldnote — ${viewDetails[view].label}`;
  }, [view]);
  const updateData = (transform: (current: AppData) => AppData) =>
    setData((current) => transform(current));
  const goTo = (key: ViewKey) => {
    setView(key);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleTask = (id: string) =>
    updateData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: task.completed
                ? undefined
                : new Date().toISOString(),
            }
          : task,
      ),
    }));
  const toggleSession = (id: string) =>
    updateData((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === id
          ? {
              ...session,
              completed: !session.completed,
              completedAt: session.completed
                ? undefined
                : new Date().toISOString(),
            }
          : session,
      ),
    }));
  const generateStudyPlan = async () => {
    if (!data.subjects.length) {
      setToast("Add a subject and topics before asking for a study plan.");
      goTo("subjects");
      return;
    }
    setBusyPlan(true);
    setToast("");
    try {
      const plan = await requestPlan({
        today: dateKey(0),
        days: data.preferences.horizonDays,
        dailyMinutes: data.preferences.dailyMinutes,
        sessionMinutes: data.preferences.sessionMinutes,
        goal: data.preferences.goal,
        subjects: data.subjects.map(({ id, name, topics }) => ({
          id,
          name,
          topics,
        })),
        tasks: data.tasks
          .filter((task) => !task.completed)
          .map(({ title, subjectId, dueDate, priority, estimatedMinutes }) => ({
            title,
            subjectId,
            dueDate,
            priority,
            estimatedMinutes,
          })),
      });
      if (!plan.sessions.length) {
        setToast(
          "The AI did not have enough student-provided topic detail to make a useful draft. Add topics to a subject and try again.",
        );
        return;
      }
      const currentDate = dateKey(0);
      const finalDate = dateKey(data.preferences.horizonDays - 1);
      const dailyStart = new Map<string, number>();
      const newSessions: StudySession[] = [...plan.sessions]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((draft, index) => {
          const minutesFromMidnight = dailyStart.get(draft.date) ?? 9 * 60;
          const hour = Math.floor(minutesFromMidnight / 60)
            .toString()
            .padStart(2, "0");
          const minute = (minutesFromMidnight % 60).toString().padStart(2, "0");
          dailyStart.set(draft.date, minutesFromMidnight + draft.minutes + 15);
          return {
            ...draft,
            id: `ai-${Date.now()}-${index}`,
            startTime: `${hour}:${minute}`,
            completed: false,
            aiGenerated: true,
          };
        });
      updateData((current) => ({
        ...current,
        sessions: [
          ...current.sessions.filter(
            (session) =>
              !session.aiGenerated ||
              session.completed ||
              session.date < currentDate ||
              session.date > finalDate,
          ),
          ...newSessions,
        ],
      }));
      setToast(
        `Your editable ${newSessions.length}-block study draft is ready. Have a look through it before you make it yours.`,
      );
      goTo("planner");
    } catch (error) {
      setToast(
        error instanceof Error
          ? error.message
          : "The study draft could not be generated just now. Your plan is unchanged; try again shortly.",
      );
    } finally {
      setBusyPlan(false);
    }
  };
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return { subjects: [], tasks: [], notes: [] };
    return {
      subjects: data.subjects
        .filter((s) =>
          `${s.name} ${s.code} ${s.topics.join(" ")}`.toLowerCase().includes(q),
        )
        .slice(0, 3),
      tasks: data.tasks
        .filter((t) => `${t.title} ${t.description}`.toLowerCase().includes(q))
        .slice(0, 3),
      notes: data.notes
        .filter((n) => `${n.title} ${n.content}`.toLowerCase().includes(q))
        .slice(0, 3),
    };
  }, [data, search]);
  const resultCount =
    searchResults.subjects.length +
    searchResults.tasks.length +
    searchResults.notes.length;
  const resetSamples = () => {
    if (
      !window.confirm(
        "Clear the editable sample content and start with an empty local workspace?",
      )
    )
      return;
    setData(clearWorkspace());
    setToast(
      "Sample data cleared. Your workspace is now empty and ready for your own coursework.",
    );
  };
  return (
    <div className="app-frame">
      <Sidebar
        view={view}
        onChange={goTo}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumb">
            <span>fieldnote</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{viewDetails[view].subtitle}</strong>
          </div>
          <div className="topbar-search-wrap">
            <label
              className={`global-search ${searchOpen ? "search-focused" : ""}`}
            >
              <Search size={16} />
              <input
                value={search}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your fieldnotes…"
                aria-label="Search subjects, tasks and notes"
              />
              <kbd>⌘ K</kbd>
              {search && (
                <button
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(true);
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </label>
            {searchOpen && search.trim().length >= 2 && (
              <div className="search-results">
                <div className="search-results-label">
                  {resultCount ? "IN YOUR WORKSPACE" : "NO MATCHES YET"}
                </div>
                {searchResults.subjects.map((subject) => (
                  <button key={subject.id} onClick={() => goTo("subjects")}>
                    <span
                      className="search-result-dot"
                      style={{ background: subject.color }}
                    />
                    <span>
                      <strong>{subject.name}</strong>
                      <small>Subject · {subject.topics.length} topics</small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))}
                {searchResults.tasks.map((task) => (
                  <button key={task.id} onClick={() => goTo("tasks")}>
                    <span className="search-result-dot search-dot-task" />
                    <span>
                      <strong>{task.title}</strong>
                      <small>Academic task</small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))}
                {searchResults.notes.map((note) => (
                  <button key={note.id} onClick={() => goTo("notes")}>
                    <span className="search-result-dot search-dot-note" />
                    <span>
                      <strong>{note.title}</strong>
                      <small>Study note</small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))}
                {!resultCount && (
                  <p>Try searching for a subject, task or note title.</p>
                )}
                <button
                  className="search-dismiss"
                  onClick={() => setSearchOpen(false)}
                >
                  Close search
                </button>
              </div>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="intro-help-trigger"
              type="button"
              onClick={() => setIntroOpen(true)}
              aria-haspopup="dialog"
              aria-label="How to use Fieldnote"
              title="How to use Fieldnote"
            >
              <CircleHelp size={16} />
              <span>How it works</span>
            </button>
            <span className="local-status">
              <span /> LOCAL WORKSPACE
            </span>
            <button
              className="button button-topbar"
              onClick={() => goTo("tasks")}
            >
              <Plus size={15} />
              <span>New task</span>
            </button>
          </div>
        </header>
        <button
          className={`click-away ${searchOpen ? "click-away-on" : ""}`}
          aria-label="Close search"
          onClick={() => setSearchOpen(false)}
        />
        <main className="page-content">
          {data.sampleWorkspace && (
            <div className="sample-notice">
              <span className="sample-notice-icon">
                <Leaf size={15} />
              </span>
              <span>
                <strong>Editable sample workspace</strong>
                <small>
                  Python topics shown as examples in your report—not your course
                  syllabus.
                </small>
              </span>
              <button onClick={resetSamples}>
                <RotateCcw size={13} /> Start fresh
              </button>
            </div>
          )}
          {view === "today" && (
            <DashboardView
              data={data}
              onNavigate={goTo}
              onToggleTask={toggleTask}
              onToggleSession={toggleSession}
              onCreateTask={() => goTo("tasks")}
              onGeneratePlan={() => void generateStudyPlan()}
            />
          )}
          {view === "subjects" && (
            <SubjectsView data={data} onUpdate={updateData} />
          )}
          {view === "tasks" && (
            <TasksView
              data={data}
              onUpdate={updateData}
              onCreateSubject={() => goTo("subjects")}
            />
          )}
          {view === "planner" && (
            <PlannerView
              data={data}
              onUpdate={updateData}
              onGenerate={() => void generateStudyPlan()}
              busy={busyPlan}
            />
          )}
          {view === "assistant" && <AssistantView data={data} />}
          {view === "notes" && <NotesView data={data} onUpdate={updateData} />}
          {view === "quizzes" && (
            <QuizzesView data={data} onUpdate={updateData} />
          )}
          {view === "progress" && (
            <ProgressView data={data} onNavigate={goTo} />
          )}
        </main>
        <footer className="app-footer">
          <BrandMark compact />
          <span>Make a plan. Make it yours.</span>
          <span className="footer-privacy">
            <Leaf size={12} /> Planner data saves in this browser. Text you send
            to AI is processed by Manus AI on request.
          </span>
        </footer>
      </div>
      {toast && (
        <div role="status" className="toast-message">
          <span className="toast-leaf">
            <Sparkles size={15} />
          </span>
          <span>{toast}</span>
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <button
        className="outside-click"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setSearchOpen(false)}
      />
      <IntroTour open={introOpen} onDismiss={dismissIntro} onNavigate={goTo} />
    </div>
  );
}
