import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { recommend, subjectProgress, useSubjects } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => ({
    meta: [
      { title: "Discover Next Steps — AthenaGrow" },
      {
        name: "description",
        content: "Athena suggests which topic to grow next based on your real mastery and pace.",
      },
      { property: "og:title", content: "Discover Next Steps — AthenaGrow" },
      { property: "og:description", content: "Smart, data-driven study suggestions." },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const subjects = useSubjects();
  const list = subjects.data ?? [];
  const next = recommend(list);

  return (
    <div>
      <GardenSky className="min-h-[180px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl">Discover</h1>
          <p className="mt-1 text-sm text-foreground/70">Where your garden needs water next.</p>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-5 pb-10">
        <section className="rounded-3xl glass-card p-5">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-4 w-4 text-primary" /> Suggested next
          </h2>
          {next ? (
            <Link
              to="/topic/$topicId"
              params={{ topicId: next.topic.id }}
              className="mt-3 block rounded-2xl bg-secondary/70 p-4"
            >
              <p className="font-medium">{next.topic.title}</p>
              <p className="text-xs text-muted-foreground">
                {next.subject.name} • {next.topic.difficulty} • {next.topic.est_minutes} min
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{next.reason}</p>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing pending. Plant a new subject to keep growing.
            </p>
          )}
        </section>

        <section className="rounded-3xl glass-card p-5">
          <h2 className="font-display text-xl">Needs attention</h2>
          <ul className="mt-3 space-y-2">
            {list
              .map((s) => ({ s, p: subjectProgress(s) }))
              .filter((x) => x.p.percent < 100)
              .sort((a, b) => a.p.percent - b.p.percent)
              .map(({ s, p }) => (
                <li key={s.id}>
                  <Link
                    to="/subject/$subjectId"
                    params={{ subjectId: s.id }}
                    className="flex items-center justify-between rounded-2xl bg-secondary/70 px-3 py-2 text-sm"
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{p.percent}%</span>
                  </Link>
                </li>
              ))}
            {list.every((s) => subjectProgress(s).percent === 100) && (
              <li className="text-sm text-muted-foreground">Everything is blooming. Beautiful work.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
