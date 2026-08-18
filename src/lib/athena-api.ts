type AthenaAction = "askAthena" | "generateLearningPath" | "generateQuiz";

function resolveApiBaseUrl() {
  const configured = import.meta.env?.VITE_API_BASE_URL;
  if (configured && typeof configured === "string" && configured.trim()) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return window.location.origin.replace(/\/$/, "");
    }
  }

  throw new Error(
    "Athena backend is not configured. Set VITE_API_BASE_URL to your deployed backend URL, for example https://your-athenagrow-backend.example.com.",
  );
}

async function requestAthena<T>(action: AthenaAction, payload: unknown): Promise<T> {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/athena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data: payload }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body?.error === "string"
        ? body.error
        : "Athena backend is not configured. Set VITE_API_BASE_URL to your deployed backend URL.";
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function askAthenaClient(input: {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    learner?: string;
    subject?: string;
    topic?: string;
    roadmap?: string;
    material?: string;
    progress?: string;
  };
}): Promise<{ answer: string }> {
  return requestAthena<{ answer: string }>("askAthena", input);
}

export async function generateLearningPathClient(input: {
  syllabus: string;
  notes?: string;
  subjectHint?: string;
}): Promise<{ subject: string; topics: { title: string; difficulty: "Easy" | "Medium" | "Hard"; est_minutes: number }[] }> {
  return requestAthena<{ subject: string; topics: { title: string; difficulty: "Easy" | "Medium" | "Hard"; est_minutes: number }[] }>("generateLearningPath", input);
}

export async function generateQuizClient(input: {
  subject: string;
  topic: string;
  material?: string;
  count?: number;
}): Promise<{ questions: { question: string; options: string[]; answer: number; explanation: string }[] }> {
  return requestAthena<{ questions: { question: string; options: string[]; answer: number; explanation: string }[] }>("generateQuiz", input);
}
