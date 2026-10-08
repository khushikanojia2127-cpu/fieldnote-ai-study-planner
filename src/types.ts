export type TaskPriority = "high" | "medium" | "low";
export type TaskKind = "assignment" | "project" | "revision" | "presentation";
export type ViewKey =
  | "today"
  | "subjects"
  | "tasks"
  | "planner"
  | "assistant"
  | "notes"
  | "quizzes"
  | "progress";

export interface Subject {
  id: string;
  name: string;
  code: string;
  topics: string[];
  color: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  kind: TaskKind;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  title: string;
  subjectId: string;
  date: string;
  startTime: string;
  minutes: number;
  focus: string;
  completed: boolean;
  aiGenerated: boolean;
  completedAt?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  summary: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface StudyQuiz {
  id: string;
  title: string;
  subjectId: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: string;
  lastScore?: number;
  lastScoreAt?: string;
}

export interface PlannerPreferences {
  dailyMinutes: number;
  sessionMinutes: number;
  horizonDays: number;
  goal: string;
}

export interface AppData {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  notes: StudyNote[];
  quizzes: StudyQuiz[];
  preferences: PlannerPreferences;
  sampleWorkspace: boolean;
}

export const palette = [
  "#405A98",
  "#2F7FB0",
  "#C4526C",
  "#636EAB",
  "#477B85",
  "#8C5268",
];

export function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );
}
