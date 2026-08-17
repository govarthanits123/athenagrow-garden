import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { SubjectTree } from "@/components/garden/SubjectTree";
import { Button } from "@/components/ui/button";
import { subjectProgress, useDeleteSubject, useSubjects } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/garden")({
  head: () => ({
    meta: [
      { title: "My Learning Garden — AthenaGrow" },
      {
        name: "description",
        content:
          "Every subject is a living tree. Watch leaves and blossoms appear as your mastery grows.",
      },
      { property: "og:title", content: "My Learning Garden — AthenaGrow" },
      {
        property: "og:description",
        content: "Seeds, sprouts, saplings and blooming trees — your real study progress, visualized.",
      },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  const subjects = useSubjects();
  const remove = useDeleteSubject();
  const list = subjects.data ?? [];

  return (
    <div>
      <GardenSky className="min-h-[200px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl">My garden</h1>
          <p className="mt-1 text-sm text-foreground/70">
            {list.length} subject{list.length === 1 ? "" : "s"} growing
          </p>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-5 pb-10">
        <Button asChild className="w-full rounded-2xl">
          <Link to="/create">
            <Plus className="mr-1 h-4 w-4" /> Plant a new subject
          </Link>
        </Button>

        {subjects.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}

        {!subjects.isLoading && list.length === 0 && (
          <div className="rounded-3xl glass-card p-8 text-center">
            <SubjectTree mastery={0} size={140} className="mx-auto" />
            <p className="mt-3 font-display text-xl">Empty soil, endless potential</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a syllabus and Athena will plant your first tree.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((s) => {
            const p = subjectProgress(s);
            return (
              <div key={s.id} className="rounded-3xl glass-card p-4">
                <Link to="/subject/$subjectId" params={{ subjectId: s.id }} className="block">
                  <SubjectTree mastery={p.percent} seed={s.id} size={150} className="mx-auto" />
                  <p className="mt-2 truncate font-display text-lg">{s.name}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.stageLabel} • {p.done}/{p.total} topics • {p.percent}%
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-muted-foreground"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(s.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Remove
                </Button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
