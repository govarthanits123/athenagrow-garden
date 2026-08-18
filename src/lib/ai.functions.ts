import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MODEL = "google/gemini-3.6-flash";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export type AthenaChatRequest = {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    learner?: string;
    subject?: string;
    topic?: string;
    roadmap?: string;
    material?: string;
    progress?: string;
  };
};

async function gateway(messages: Msg[], jsonMode = false): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Athena is busy right now. Please retry in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted. Add credits to keep Athena thinking.");
    throw new Error(`Athena could not respond (${res.status}). ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Athena returned an empty response.");
  return text;
}

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function generateLearningPathServer(input: {
  syllabus: string;
  notes?: string;
  subjectHint?: string;
}) {
  const raw = await gateway(
    [
      {
        role: "system",
        content:
          "You are Athena, a curriculum designer. From the learner's syllabus you output a JSON learning path. " +
          'Reply with ONLY JSON of shape {"subject":"string","topics":[{"title":"string","difficulty":"Easy|Medium|Hard","est_minutes":number}]}. ' +
          "Use 5-12 topics, ordered from foundations to advanced, titles under 60 chars, derived from the actual content.",
      },
      {
        role: "user",
        content:
          (input.subjectHint ? `Preferred subject name: ${input.subjectHint}\n\n` : "") +
          `SYLLABUS:\n${input.syllabus.slice(0, 20000)}` +
          (input.notes ? `\n\nNOTES EXCERPT:\n${input.notes.slice(0, 6000)}` : ""),
      },
    ],
    true,
  );

  const parsed = parseJson<{
    subject?: string;
    topics?: { title?: string; difficulty?: string; est_minutes?: number }[];
  }>(raw);

  const topics = (parsed.topics ?? [])
    .map((t) => ({
      title: String(t.title ?? "").trim(),
      difficulty: (["Easy", "Medium", "Hard"].includes(String(t.difficulty))
        ? t.difficulty
        : "Medium") as "Easy" | "Medium" | "Hard",
      est_minutes: Number(t.est_minutes) > 0 ? Math.round(Number(t.est_minutes)) : 25,
    }))
    .filter((t) => t.title.length > 2);

  if (!topics.length) throw new Error("Athena could not derive topics.");

  return {
    subject: (parsed.subject ?? input.subjectHint ?? "My Subject").toString().slice(0, 80),
    topics,
  };
}

export async function askAthenaServer(input: AthenaChatRequest): Promise<{ answer: string }> {
  const c = input.context ?? {};
  const contextLines = [
    c.learner ? `Learner name: ${c.learner}` : "",
    c.subject ? `Current subject: ${c.subject}` : "",
    c.topic ? `Current topic: ${c.topic}` : "",
    c.progress ? `Progress: ${c.progress}` : "",
    c.roadmap ? `Roadmap: ${c.roadmap}` : "",
    c.material ? `Learner's uploaded material (use this first):\n${c.material}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const answer = await gateway([
    {
      role: "system",
      content:
        "You are Athena, a warm, precise study companion inside AthenaGrow, a garden-themed learning app. " +
        "Answer study questions clearly with short paragraphs, markdown headings and bullet points when helpful. " +
        "When the learner's own uploaded material is provided, ground your answer in it and say when you go beyond it. " +
        "If asked for a quiz, produce numbered questions with the answers at the end.\n\n" +
        (contextLines ? `CONTEXT\n${contextLines}` : "No extra context available."),
    },
    ...input.messages,
  ]);
  return { answer };
}

export async function generateQuizServer(input: {
  subject: string;
  topic: string;
  material?: string;
  count?: number;
}) {
  const count = input.count ?? 5;
  const raw = await gateway(
    [
      {
        role: "system",
        content:
          "You write multiple-choice quizzes. Reply with ONLY JSON: " +
          '{"questions":[{"question":"string","options":["a","b","c","d"],"answer":0,"explanation":"string"}]}. ' +
          "answer is the zero-based index of the correct option. Exactly 4 options each.",
      },
      {
        role: "user",
        content:
          `Subject: ${input.subject}\nTopic: ${input.topic}\nNumber of questions: ${count}` +
          (input.material ? `\n\nBase questions on this material:\n${input.material}` : ""),
      },
    ],
    true,
  );

  const parsed = parseJson<{
    questions?: {
      question?: string;
      options?: string[];
      answer?: number;
      explanation?: string;
    }[];
  }>(raw);

  const questions = (parsed.questions ?? [])
    .map((q) => ({
      question: String(q.question ?? "").trim(),
      options: (q.options ?? []).map((o) => String(o)).slice(0, 4),
      answer: Number(q.answer ?? 0),
      explanation: String(q.explanation ?? ""),
    }))
    .filter((q) => q.question && q.options.length === 4 && q.answer >= 0 && q.answer < 4);

  if (!questions.length) throw new Error("Athena could not build a quiz. Please retry.");
  return { questions };
}

/** Generates a subject + roadmap from syllabus/notes text. */
export const generateLearningPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        syllabus: z.string().min(1).max(60000),
        notes: z.string().max(60000).optional(),
        subjectHint: z.string().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => generateLearningPathServer(data));

/** Athena chat with learning context. */
export const askAthena = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(6000),
            }),
          )
          .min(1)
          .max(40),
        context: z
          .object({
            learner: z.string().max(80).optional(),
            subject: z.string().max(120).optional(),
            topic: z.string().max(160).optional(),
            roadmap: z.string().max(3000).optional(),
            material: z.string().max(12000).optional(),
            progress: z.string().max(500).optional(),
          })
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => askAthenaServer(data));

/** Generates a multiple-choice quiz for a topic. */
export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        subject: z.string().min(1).max(120),
        topic: z.string().min(1).max(160),
        material: z.string().max(12000).optional(),
        count: z.number().min(3).max(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => generateQuizServer(data));
