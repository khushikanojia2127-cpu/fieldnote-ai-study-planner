import type { AppData } from "../types";
import { newId } from "../types";

const STORAGE_KEY = "fieldnote.study-planner.v1";

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
        color: "#719677",
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
    sessions: [
      {
        id: "sample-session-one",
        title: "Variables & data types",
        subjectId,
        date: dateKey(0),
        startTime: "09:30",
        minutes: 25,
        focus:
          "Write a tiny example and explain each data type in your own words.",
        completed: false,
        aiGenerated: false,
      },
      {
        id: "sample-session-two",
        title: "Operators",
        subjectId,
        date: dateKey(0),
        startTime: "11:00",
        minutes: 25,
        focus: "Practice with three short expressions.",
        completed: false,
        aiGenerated: false,
      },
      {
        id: "sample-session-three",
        title: "Function recap",
        subjectId,
        date: dateKey(1),
        startTime: "10:00",
        minutes: 45,
        focus: "Recall the example without looking, then check your notes.",
        completed: false,
        aiGenerated: false,
      },
    ],
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

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (looksLikeAppData(parsed)) return parsed;
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
