import type { AppData } from "../types";
import { newId } from "../types";

const STORAGE_KEY = "fieldnote.study-planner.v1";
const LEGACY_SAMPLE_SESSION_IDS = new Set([
  "sample-session-one",
  "sample-session-two",
  "sample-session-three",
]);

export function dateKey(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function makeSampleData(): AppData {
  const subjectId = "sample-python-foundations";
  return {
    sampleWorkspace: true,
    subjects: [
      {
        id: subjectId,
        name: "Python foundations",
        code: "SAMPLE · IT",
        topics: [
          "Variables & data types",
          "Operators",
          "Conditional statements",
          "Loops",
          "Functions",
        ],
        color: "#405A98",
      },
    ],
    tasks: [
      {
        id: "sample-task-functions",
        title: "Revise functions",
        subjectId,
        description: "Review the functions topic from the report example.",
        dueDate: dateKey(2),
        priority: "high",
        kind: "revision",
        estimatedMinutes: 45,
        completed: false,
      },
      {
        id: "sample-task-conditionals",
        title: "Practice conditionals",
        subjectId,
        description: "An editable sample revision task.",
        dueDate: dateKey(4),
        priority: "medium",
        kind: "assignment",
        estimatedMinutes: 60,
        completed: false,
      },
      {
        id: "sample-task-variables",
        title: "Review variables & operators",
        subjectId,
        description: "An editable sample revision task.",
        dueDate: dateKey(6),
        priority: "low",
        kind: "revision",
        estimatedMinutes: 30,
        completed: true,
      },
    ],
    sessions: [],
    notes: [],
    quizzes: [],
    preferences: {
      dailyMinutes: 120,
      sessionMinutes: 30,
      horizonDays: 7,
      goal: "Prepare steadily and revisit difficult topics.",
    },
  };
}

function looksLikeAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<AppData>;
  return (
    Array.isArray(data.subjects) &&
    Array.isArray(data.tasks) &&
    Array.isArray(data.sessions) &&
    Array.isArray(data.notes) &&
    Array.isArray(data.quizzes) &&
    !!data.preferences
  );
}

function removeLegacySampleSessions(data: AppData): AppData {
  const sessions = data.sessions.filter(
    (session) => !LEGACY_SAMPLE_SESSION_IDS.has(session.id),
  );
  if (sessions.length === data.sessions.length) return data;

  const migrated = { ...data, sessions };
  saveData(migrated);
  return migrated;
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (looksLikeAppData(parsed)) return removeLegacySampleSessions(parsed);
    }
  } catch {
    // If storage is unavailable or a prior value is malformed, start with editable sample data.
  }
  return makeSampleData();
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // The application remains usable in-memory and the UI can surface a storage warning if needed.
  }
}

export function clearWorkspace(): AppData {
  const empty: AppData = {
    sampleWorkspace: false,
    subjects: [],
    tasks: [],
    sessions: [],
    notes: [],
    quizzes: [],
    preferences: {
      dailyMinutes: 120,
      sessionMinutes: 30,
      horizonDays: 7,
      goal: "Prepare steadily and revisit difficult topics.",
    },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  } catch {
    /* Best effort. */
  }
  return empty;
}

export { newId };
