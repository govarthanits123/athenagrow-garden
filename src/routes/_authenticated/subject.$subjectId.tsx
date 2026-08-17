import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, FileText, Loader2, Lock } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { SubjectTree } from "@/components/garden/SubjectTree";
import { FloatingAthena } from "@/components/AthenaPanel";
import { subjectProgress, useMaterials, useProfile, useSubject } from "@/lib/athena";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/subject/$subjectId")({
  head: () => ({
    meta: [
      { title: "Subject Roadmap — AthenaGrow" },
      {
        name: "description",
        content:
          "Follow your growing vine of lessons, quizzes, practice and revision for this subject.",
      },
      { property: "og:title", content: "Subject Roadmap — AthenaGrow" },
      {
        property: "og:description",
        content: "A vertical learning path generated from your own syllabus.",
      },
    ],
  }),
  component: SubjectPage,
});

const KIND_LABEL: Record<string, string> = {
  lesson: "Lesson",
  quiz: "Quiz",
  practice: "Practice",
  viva: "Viva",
  revision: "Revision",
  assessment: "Assessment",
  summary: "Summary",
};

function SubjectPage() {
  const { subjectId } = Route.useParams();
  const { subject, isLoading } = useSubject(subjectId);
  const materials = useMaterials(subjectId);
  const profile = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-2xl">This subject isn't in your garden</h1>
        <Link to="/garden" className="mt-3 inline-block text-primary">
          Back to garden
        </Link>
      </div>
    );
  }

  const p = subjectProgress(subject);
  const firstIncomplete = subject.topics.findIndex((t) => !t.completed);

  return (
    <div>
      <GardenSky className="min-h-[240px] px-5 pb-8 pt-10">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <SubjectTree mastery={p.percent} seed={subject.id} size={110} />
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl">{subject.name}</h1>
            <p className="mt-1 text-sm text-foreground/70">
              {p.stageLabel} • {p.done}/{p.total} topics • {p.percent}% mastery
            </p>
            <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-background/60">
              <div className="h-full rounded-full bg-primary" style={{ width: `${p.percent}%` }} />
            </div>
          </div>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl px-5 pb-10">
        {materials.data && materials.data.length > 0 && (
          <div className="rounded-3xl glass-card p-4">
            <h2 className="font-display text-lg">Your material</h2>
            <ul className="mt-2 space-y-1">
              {materials.data.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate">{m.name}</span>
                  <span className="text-xs">({m.kind})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mt-6 font-display text-xl">Your learning vine</h2>
        <ol className="relative mt-4 space-y-3 pl-8">
          <span className="absolute left-3 top-2 bottom-2 w-1 rounded-full bg-primary/25" />
          {subject.topics.map((t, i) => {
            const locked = i > firstIncomplete && firstIncomplete !== -1 && !t.completed && i > firstIncomplete;
            const isNext = i === firstIncomplete;
            return (
              <li key={t.id} className="relative">
                <span className="absolute -left-[1.4rem] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-card ring-2 ring-primary/30">
                  {t.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : isNext ? (
                    <Circle className="h-4 w-4 animate-glow-pulse text-primary" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  )}
                </span>
                <Link
                  to="/topic/$topicId"
                  params={{ topicId: t.id }}
                  className={cn(
                    "block rounded-3xl glass-card p-4 transition-transform hover:-translate-y-0.5",
                    t.completed && "opacity-90",
                    isNext && "ring-2 ring-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {KIND_LABEL[t.kind] ?? "Lesson"} • {t.difficulty} • {t.est_minutes} min
                      </p>
                    </div>
                    {locked && <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>

      <FloatingAthena
        context={{
          learner: profile.data?.display_name ?? undefined,
          subject: subject.name,
          roadmap: subject.topics.map((t) => t.title).join(", ").slice(0, 3000),
          progress: `${p.done}/${p.total} topics complete`,
          material: materials.data?.map((m) => m.content).join("\n\n").slice(0, 12000),
        }}
      />
    </div>
  );
}
