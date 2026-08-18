import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateLearningPathClient } from "@/lib/athena-api";
import { buildRoadmap, detectSubjectName, fallbackRoadmap, parseTopics } from "./roadmap";

export type Profile = {
  id: string;
  display_name: string | null;
  category: string | null;
  xp: number;
};

export type Topic = {
  id: string;
  subject_id: string;
  title: string;
  kind: string;
  position: number;
  difficulty: string;
  est_minutes: number;
  completed: boolean;
  mastery: number;
  completed_at: string | null;
};

export type Subject = {
  id: string;
  name: string;
  mastery: number;
  created_at: string;
};

export type SubjectWithTopics = Subject & { topics: Topic[] };

export const XP_PER_TOPIC = 25;

async function uid(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You are not signed in.");
  return data.user.id;
}

/* ---------------------------------- profile --------------------------------- */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const id = await uid();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, category, xp")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ id })
        .select("id, display_name, category, xp")
        .single();
      if (insertError) throw insertError;
      return created as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { display_name?: string; category?: string }) => {
      const id = await uid();
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

async function addXp(amount: number) {
  const id = await uid();
  const { data } = await supabase.from("profiles").select("xp").eq("id", id).maybeSingle();
  const next = (data?.xp ?? 0) + amount;
  await supabase.from("profiles").update({ xp: next }).eq("id", id);
  return next;
}

/* --------------------------------- subjects --------------------------------- */

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async (): Promise<SubjectWithTopics[]> => {
      const id = await uid();
      const { data: subjects, error } = await supabase
        .from("subjects")
        .select("id, name, mastery, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const ids = (subjects ?? []).map((s) => s.id);
      if (!ids.length) return [];
      const { data: topics, error: topicError } = await supabase
        .from("topics")
        .select(
          "id, subject_id, title, kind, position, difficulty, est_minutes, completed, mastery, completed_at",
        )
        .in("subject_id", ids)
        .order("position", { ascending: true });
      if (topicError) throw topicError;
      return (subjects ?? []).map((s) => ({
        ...(s as Subject),
        topics: ((topics ?? []) as Topic[]).filter((t) => t.subject_id === s.id),
      }));
    },
  });
}

export function useSubject(subjectId: string) {
  const query = useSubjects();
  return {
    ...query,
    subject: query.data?.find((s) => s.id === subjectId) ?? null,
  };
}

export function subjectProgress(subject: SubjectWithTopics) {
  const total = subject.topics.length;
  const done = subject.topics.filter((t) => t.completed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const next = subject.topics.find((t) => !t.completed) ?? null;
  const stage = percent >= 100 ? 4 : percent >= 70 ? 3 : percent >= 40 ? 2 : percent >= 10 ? 1 : 0;
  const stageLabel = ["Seed", "Sprout", "Sapling", "Blooming", "Mastered"][stage] ?? "Seed";
  return { total, done, percent, next, stage, stageLabel };
}

export type CreateSubjectInput = {
  name?: string | undefined;
  syllabus: string;
  syllabusFileName?: string | undefined;
  notes?: { name: string; text: string }[] | undefined;
  onStage?: ((stage: string) => void) | undefined;
};

export type CreateSubjectResult = {
  subjectId: string;
  usedAi: boolean;
  topicCount: number;
};

/** The real "Grow My Garden" pipeline. Never loses the subject if AI fails. */
export async function createSubjectFromMaterial(
  input: CreateSubjectInput,
): Promise<CreateSubjectResult> {
  const stage = input.onStage ?? (() => {});
  const syllabus = input.syllabus.trim();
  if (syllabus.replace(/\s/g, "").length < 20) {
    throw new Error("Please upload or paste a little more syllabus content first.");
  }
  const userId = await uid();
  const notes = input.notes ?? [];

  stage("Analyzing your syllabus...");
  let subjectName = (input.name ?? "").trim() || detectSubjectName(syllabus);
  let nodes = fallbackRoadmap(syllabus);
  let usedAi = false;

  try {
    stage("Understanding your learning material...");
    const ai = await generateLearningPathClient({
      syllabus,
      notes: notes.map((n) => n.text).join("\n\n").slice(0, 20000) || undefined,
      subjectHint: input.name?.trim() || undefined,
    });
    if (ai.topics.length) {
      if (!input.name?.trim() && ai.subject) subjectName = ai.subject;
      nodes = buildRoadmap(ai.topics.map((t) => t.title));
      const byTitle = new Map(ai.topics.map((t) => [t.title, t]));
      nodes = nodes.map((n) => {
        const match = byTitle.get(n.title);
        return match
          ? { ...n, difficulty: match.difficulty, est_minutes: match.est_minutes }
          : n;
      });
      usedAi = true;
    }
  } catch {
    // Deterministic fallback path — the learner still gets a full roadmap.
    const parsed = parseTopics(syllabus);
    nodes = buildRoadmap(parsed);
  }

  stage("Organizing topics...");
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .insert({ user_id: userId, name: subjectName.slice(0, 80) })
    .select("id")
    .single();
  if (subjectError) throw subjectError;

  stage("Building your personalized roadmap...");
  const { error: topicError } = await supabase.from("topics").insert(
    nodes.map((n, i) => ({
      user_id: userId,
      subject_id: subject.id,
      title: n.title.slice(0, 160),
      kind: n.kind,
      position: i,
      difficulty: n.difficulty,
      est_minutes: n.est_minutes,
    })),
  );
  if (topicError) throw topicError;

  stage("Growing your learning garden...");
  const materials = [
    {
      user_id: userId,
      subject_id: subject.id,
      name: input.syllabusFileName ?? "Pasted syllabus",
      kind: "syllabus",
      content: syllabus.slice(0, 60000),
    },
    ...notes.map((n) => ({
      user_id: userId,
      subject_id: subject.id,
      name: n.name,
      kind: "notes",
      content: n.text.slice(0, 60000),
    })),
  ];
  await supabase.from("materials").insert(materials);
  await unlockAchievement("first_sprout", "First Sprout", "You planted your first subject.");

  return { subjectId: subject.id, usedAi, topicCount: nodes.length };
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

/* -------------------------------- materials -------------------------------- */

export function useMaterials(subjectId?: string) {
  return useQuery({
    queryKey: ["materials", subjectId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("materials")
        .select("id, subject_id, name, kind, content, created_at")
        .order("created_at", { ascending: true });
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ---------------------------------- topics --------------------------------- */

async function refreshSubjectMastery(subjectId: string) {
  const { data } = await supabase
    .from("topics")
    .select("completed")
    .eq("subject_id", subjectId);
  const total = data?.length ?? 0;
  const done = data?.filter((t) => t.completed).length ?? 0;
  const mastery = total ? Math.round((done / total) * 100) : 0;
  await supabase.from("subjects").update({ mastery }).eq("id", subjectId);
  return mastery;
}

export function useCompleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topic: Topic) => {
      const userId = await uid();
      const { error } = await supabase
        .from("topics")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          mastery: Math.max(topic.mastery, 80),
        })
        .eq("id", topic.id);
      if (error) throw error;
      const mastery = await refreshSubjectMastery(topic.subject_id);
      const xp = await addXp(XP_PER_TOPIC);
      await supabase.from("study_sessions").insert({
        user_id: userId,
        subject_id: topic.subject_id,
        minutes: topic.est_minutes,
      });
      await unlockAchievement("first_leaf", "First Leaf", "You completed your first topic.");
      if (mastery >= 100)
        await unlockAchievement("subject_master", "Subject Master", "You mastered a whole subject.");
      if (xp >= 500)
        await unlockAchievement("xp_500", "Growth Spurt", "You earned 500 XP of learning.");
      return { mastery, xp };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/* ---------------------------------- goals ---------------------------------- */

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, text, done, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGoalMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["goals"] });

  const add = useMutation({
    mutationFn: async (text: string) => {
      const userId = await uid();
      const { error } = await supabase.from("goals").insert({ user_id: userId, text });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("goals").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, toggle, remove };
}

/* ------------------------------- achievements ------------------------------ */

export async function unlockAchievement(code: string, title: string, description: string) {
  const userId = await uid();
  await supabase
    .from("achievements")
    .upsert({ user_id: userId, code, title, description }, { onConflict: "user_id,code" });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("id, code, title, description, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------- quiz results ------------------------------ */

export function useSaveQuizResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: {
      subjectId: string;
      topicId: string;
      score: number;
      total: number;
    }) => {
      const userId = await uid();
      const xp = r.score * 10;
      const { error } = await supabase.from("quiz_results").insert({
        user_id: userId,
        subject_id: r.subjectId,
        topic_id: r.topicId,
        score: r.score,
        total: r.total,
        xp,
      });
      if (error) throw error;
      await addXp(xp);
      if (r.total > 0 && r.score === r.total)
        await unlockAchievement("quiz_ace", "Quiz Ace", "You scored a perfect quiz.");
      return { xp };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

/* ---------------------------------- stats ---------------------------------- */

export type Stats = {
  weeklyMinutes: number;
  masteryScore: number;
  quizAccuracy: number | null;
  xp: number;
  completedTopics: number;
  totalTopics: number;
  achievements: number;
};

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async (): Promise<Stats> => {
      const id = await uid();
      const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
      const [profile, sessions, topics, quizzes, achievements] = await Promise.all([
        supabase.from("profiles").select("xp").eq("id", id).maybeSingle(),
        supabase.from("study_sessions").select("minutes").gte("created_at", weekAgo),
        supabase.from("topics").select("completed, mastery"),
        supabase.from("quiz_results").select("score, total"),
        supabase.from("achievements").select("id"),
      ]);

      const weeklyMinutes = (sessions.data ?? []).reduce((sum, s) => sum + (s.minutes ?? 0), 0);
      const allTopics = topics.data ?? [];
      const completedTopics = allTopics.filter((t) => t.completed).length;
      const quizRows = quizzes.data ?? [];
      const quizTotal = quizRows.reduce((s, q) => s + (q.total ?? 0), 0);
      const quizScore = quizRows.reduce((s, q) => s + (q.score ?? 0), 0);

      return {
        weeklyMinutes,
        masteryScore: allTopics.length
          ? Math.round((completedTopics / allTopics.length) * 100)
          : 0,
        quizAccuracy: quizTotal ? Math.round((quizScore / quizTotal) * 100) : null,
        xp: profile.data?.xp ?? 0,
        completedTopics,
        totalTopics: allTopics.length,
        achievements: (achievements.data ?? []).length,
      };
    },
  });
}

/* ------------------------------ recommendation ----------------------------- */

export function recommend(subjects: SubjectWithTopics[]) {
  const candidates = subjects
    .map((s) => ({ subject: s, progress: subjectProgress(s) }))
    .filter((c) => c.progress.next);
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.progress.percent - b.progress.percent);
  const pick = candidates[0]!;
  const lastDone = pick.subject.topics
    .filter((t) => t.completed_at)
    .map((t) => new Date(t.completed_at as string).getTime())
    .sort((a, b) => b - a)[0];
  const days = lastDone ? Math.floor((Date.now() - lastDone) / 864e5) : null;
  const reason =
    days === null
      ? "You haven't started this subject yet — the seed is waiting."
      : days === 0
        ? "You made progress today. Keep the momentum growing."
        : `Last studied ${days} day${days === 1 ? "" : "s"} ago.`;
  return { subject: pick.subject, topic: pick.progress.next!, reason };
}

/* -------------------------------- time of day ------------------------------ */

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export function dayPart(date = new Date()): DayPart {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}
