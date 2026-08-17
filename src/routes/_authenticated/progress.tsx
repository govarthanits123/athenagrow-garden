import { createFileRoute } from "@tanstack/react-router";
import { Award, Loader2 } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { SubjectTree } from "@/components/garden/SubjectTree";
import { subjectProgress, useAchievements, useStats, useSubjects } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Growth & Progress — AthenaGrow" },
      {
        name: "description",
        content: "Weekly study time, mastery score, quiz accuracy and the badges you've bloomed.",
      },
      { property: "og:title", content: "Growth & Progress — AthenaGrow" },
      { property: "og:description", content: "Real numbers behind your growing garden." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const stats = useStats();
  const subjects = useSubjects();
  const achievements = useAchievements();
  const list = subjects.data ?? [];

  return (
    <div>
      <GardenSky className="min-h-[180px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl">Your growth</h1>
          <p className="mt-1 text-sm text-foreground/70">Every number here comes from real study.</p>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-5 pb-10">
        {stats.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: "XP earned", value: stats.data?.xp ?? 0 },
            { label: "Mastery score", value: `${stats.data?.masteryScore ?? 0}%` },
            { label: "Minutes this week", value: stats.data?.weeklyMinutes ?? 0 },
            {
              label: "Quiz accuracy",
              value: stats.data?.quizAccuracy === null || stats.data?.quizAccuracy === undefined
                ? "—"
                : `${stats.data.quizAccuracy}%`,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl glass-card p-4">
              <p className="font-display text-2xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl glass-card p-5">
          <h2 className="font-display text-xl">Mastery by subject</h2>
          <div className="mt-3 space-y-3">
            {list.length === 0 && (
              <p className="text-sm text-muted-foreground">Plant a subject to start tracking.</p>
            )}
            {list.map((s) => {
              const p = subjectProgress(s);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <SubjectTree mastery={p.percent} seed={s.id} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.percent}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.percent}%</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl glass-card p-5">
          <h2 className="font-display text-xl">Badges bloomed</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(achievements.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Complete your first topic to bloom a badge.
              </p>
            )}
            {(achievements.data ?? []).map((a) => (
              <div key={a.id} className="flex items-start gap-2 rounded-2xl bg-secondary/70 p-3">
                <Award className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
