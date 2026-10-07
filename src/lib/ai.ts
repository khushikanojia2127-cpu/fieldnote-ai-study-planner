import type { QuizQuestion, StudyTask, Subject } from "../types";

export interface PlanDraft {
  sessions: Array<{
    date: string;
    title: string;
    subjectId: string;
    minutes: number;
    focus: string;
  }>;
}

export interface QuizDraft {
  title: string;
  questions: QuizQuestion[];
}

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || !payload.result)
    throw new Error(
      payload.error ||
        "The AI could not complete that request. Please try again.",
    );
  return payload.result;
}

export async function askAssistant(input: {
  question: string;
  subject: string;
  topic: string;
  notes: string;
}): Promise<string> {
  const result = await request<{ text: string }>({
    action: "assistant",
    ...input,
  });
  return result.text;
}

export async function summarizeNotes(
  title: string,
  content: string,
): Promise<string> {
  const result = await request<{ text: string }>({
    action: "summary",
    title,
    content,
  });
  return result.text;
}

export async function generateQuiz(input: {
  subject: string;
  topic: string;
  notes: string;
  count: number;
}): Promise<QuizDraft> {
  return request<QuizDraft>({ action: "quiz", ...input });
}

export async function generatePlan(input: {
  today: string;
  days: number;
  dailyMinutes: number;
  sessionMinutes: number;
  goal: string;
  subjects: Pick<Subject, "id" | "name" | "topics">[];
  tasks: Pick<
    StudyTask,
    "title" | "subjectId" | "dueDate" | "priority" | "estimatedMinutes"
  >[];
}): Promise<PlanDraft> {
  return request<PlanDraft>({ action: "plan", ...input });
}
