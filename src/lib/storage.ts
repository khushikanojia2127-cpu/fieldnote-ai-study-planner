import type { AppData } from "../types";
import { newId } from "../types";

const STORAGE_KEY = "fieldnote.study-planner.v1";
const LEGACY_DEFAULT_GOAL = "Prepare steadily and revisit difficult topics.";
const LEGACY_SAMPLE_SUBJECT_ID = "sample-python-foundations";
const LEGACY_SAMPLE_TASK_IDS = new Set([
  "sample-task-functions",
  "sample-task-conditionals",
  "sample-task-variables",
]);
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

export function makeEmptyData(): AppData {
  return {
    subjects: [],
    tasks: [],
    sessions: [],
    notes: [],
    quizzes: [],
    preferences: {
      dailyMinutes: 120,
      sessionMinutes: 30,
      horizonDays: 7,
      goal: "",
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

function unassignLegacySubject<T extends { subjectId: string }>(record: T): T {
  return record.subjectId === LEGACY_SAMPLE_SUBJECT_ID
    ? { ...record, subjectId: "" }
    : record;
}

function migrateLegacySampleWorkspace(data: AppData): AppData {
  const subjects = data.subjects.filter(
    (subject) => subject.id !== LEGACY_SAMPLE_SUBJECT_ID,
  );
  const tasks = data.tasks.filter(
    (task) => !LEGACY_SAMPLE_TASK_IDS.has(task.id),
  );
  const sessions = data.sessions.filter(
    (session) => !LEGACY_SAMPLE_SESSION_IDS.has(session.id),
  );
  const removedSampleSubject = subjects.length !== data.subjects.length;
  const hasOldWorkspaceFlag = Object.prototype.hasOwnProperty.call(
    data,
    "sampleWorkspace",
  );
  const hasOrphanedRecords =
    removedSampleSubject &&
    [...data.tasks, ...data.sessions, ...data.notes, ...data.quizzes].some(
      (record) => record.subjectId === LEGACY_SAMPLE_SUBJECT_ID,
    );
  const hasLegacySampleRecords =
    removedSampleSubject ||
    tasks.length !== data.tasks.length ||
    sessions.length !== data.sessions.length;
  const clearLegacyDefaultGoal = data.preferences.goal === LEGACY_DEFAULT_GOAL;

  if (
    !hasOldWorkspaceFlag &&
    !hasLegacySampleRecords &&
    !hasOrphanedRecords &&
    !clearLegacyDefaultGoal
  )
    return data;

  const migrated: AppData & { sampleWorkspace?: boolean } = {
    ...data,
    subjects,
    tasks: tasks.map(unassignLegacySubject),
    sessions: sessions.map(unassignLegacySubject),
    notes: data.notes.map(unassignLegacySubject),
    quizzes: data.quizzes.map(unassignLegacySubject),
    preferences: clearLegacyDefaultGoal
      ? { ...data.preferences, goal: "" }
      : data.preferences,
  };
  delete migrated.sampleWorkspace;
  saveData(migrated);
  return migrated;
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (looksLikeAppData(parsed)) return migrateLegacySampleWorkspace(parsed);
    }
  } catch {
    // If storage is unavailable or a prior value is malformed, start empty.
  }
  return makeEmptyData();
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // The application remains usable in-memory if browser storage is unavailable.
  }
}

export function clearWorkspace(): AppData {
  const empty = makeEmptyData();
  saveData(empty);
  return empty;
}

export { newId };
