import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Leaf, Loader2, Plus, Sprout } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { SubjectTree } from "@/components/garden/SubjectTree";
import { FloatingAthena } from "@/components/AthenaPanel";
import { Button } from "@/components/ui/button";
import { dayPart, recommend, subjectProgress, useProfile, useStats, useSubjects } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Your Garden Home — AthenaGrow" },
      {
        name: "description",
        content:
          "See today's growth, your next lesson and every subject blooming in your AthenaGrow learning garden.",
      },
      { property: "og:title", content: "Your Garden Home — AthenaGrow" },
      {
        property: "og:description",
        content: "Grow knowledge like a living plant. Track mastery, streaks and next steps.",
      },
    ],
  }),
  component: HomePage,
});

const GREETING: Record<string, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Still growing tonight",
};

function HomePage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const subjects = useSubjects();
  const stats = useStats();

  useEffect(() => {
    if (profile.data && !profile.data.display_name) navigate({ to: "/onboarding" });
  }, [profile.data, navigate]);

  const list = subjects.data ?? [];
  const next = recommend(list);
  const name = profile.data?.display_name ?? "learner";
  const greeting = GREETING[dayPart()] ?? "Hello";
  const avgMastery = list.length
    ? Math.round(list.reduce((s, x) => s + subjectProgress(x).percent, 0) / list.length)
    : 0;

  return (
    <div>
      <GardenSky className="min-h-[280px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium text-foreground/70">{greeting},</p>
          <h1 className="font-display text-4xl leading-tight">{name}</h1>
          <p className="mt-2 max-w-md text-sm text-foreground/70">
            Your garden holds {list.length} subject{list.length === 1 ? "" : "s"} and{" "}
            {stats.data?.completedTopics ?? 0} grown topics.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link to="/create">
                <Plus className="mr-1 h-4 w-4" /> Grow a new subject
              </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link to="/garden">
                <Leaf className="mr-1 h-4 w-4" /> Visit garden
              </Link>
            </Button>
          </div>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-5 px-5">
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "XP", value: stats.data?.xp ?? 0 },
            { label: "Mastery", value: `${avgMastery}%` },
            { label: "This week", value: `${stats.data?.weeklyMinutes ?? 0}m` },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl glass-card p-4 text-center">
              <p className="font-display text-2xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl glass-card p-5">
          <h2 className="font-display text-xl">What should I learn next?</h2>
          {subjects.isLoading ? (
            <Loader2 className="mt-3 h-5 w-5 animate-spin text-primary" />
          ) : next ? (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">{next.reason}</p>
              <p className="mt-2 font-medium">{next.topic.title}</p>
              <p className="text-xs text-muted-foreground">
                {next.subject.name} • {next.topic.difficulty} • {next.topic.est_minutes} min
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link to="/topic/$topicId" params={{ topicId: next.topic.id }}>
                  Continue growing <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">
                {list.length
                  ? "Every topic is grown. Plant a new subject to keep going."
                  : "Plant your first seed by uploading a syllabus."}
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link to="/create">
                  <Sprout className="mr-1 h-4 w-4" /> Grow my garden
                </Link>
              </Button>
            </div>
          )}
        </section>

        {list.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Your garden</h2>
              <Link to="/garden" className="text-sm text-primary">
                See all
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {list.slice(0, 4).map((s) => {
                const p = subjectProgress(s);
                return (
                  <Link
                    key={s.id}
                    to="/subject/$subjectId"
                    params={{ subjectId: s.id }}
                    className="rounded-3xl glass-card p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <SubjectTree mastery={p.percent} seed={s.id} size={120} className="mx-auto" />
                    <p className="mt-2 truncate font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.stageLabel} • {p.percent}%
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <FloatingAthena
        context={{
          learner: profile.data?.display_name ?? undefined,
          progress: `${stats.data?.completedTopics ?? 0}/${stats.data?.totalTopics ?? 0} topics complete, ${stats.data?.xp ?? 0} XP`,
        }}
      />
    </div>
  );
}
