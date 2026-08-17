import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { AthenaConversation } from "@/components/AthenaPanel";
import { Button } from "@/components/ui/button";
import { useCompleteTopic, useMaterials, useProfile, useSubjects } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/topic/$topicId")({
  head: () => ({
    meta: [
      { title: "Topic Workspace — AthenaGrow" },
      {
        name: "description",
        content: "Learn a topic with Athena, quiz yourself, and mark it grown to bloom your tree.",
      },
      { property: "og:title", content: "Topic Workspace — AthenaGrow" },
      {
        property: "og:description",
        content: "Explain, summarize, quiz and revise — all grounded in your own material.",
      },
    ],
  }),
  component: TopicPage,
});

function TopicPage() {
  const { topicId } = Route.useParams();
  const navigate = useNavigate();
  const subjects = useSubjects();
  const profile = useProfile();
  const complete = useCompleteTopic();

  const found = (subjects.data ?? [])
    .flatMap((s) => s.topics.map((t) => ({ subject: s, topic: t })))
    .find((x) => x.topic.id === topicId);
  const materials = useMaterials(found?.subject.id);

  if (subjects.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!found) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-2xl">Topic not found</h1>
        <Link to="/garden" className="mt-3 inline-block text-primary">
          Back to garden
        </Link>
      </div>
    );
  }

  const { subject, topic } = found;

  return (
    <div>
      <GardenSky className="min-h-[200px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/subject/$subjectId"
            params={{ subjectId: subject.id }}
            className="text-sm text-foreground/70"
          >
            ← {subject.name}
          </Link>
          <h1 className="mt-1 font-display text-3xl">{topic.title}</h1>
          <p className="mt-1 text-sm text-foreground/70">
            {topic.kind} • {topic.difficulty} • {topic.est_minutes} min
          </p>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-5 pb-10">
        <div className="overflow-hidden rounded-3xl glass-card">
          <AthenaConversation
            context={{
              learner: profile.data?.display_name ?? undefined,
              subject: subject.name,
              topic: topic.title,
              roadmap: subject.topics.map((t) => t.title).join(", ").slice(0, 3000),
              material: materials.data?.map((m) => m.content).join("\n\n").slice(0, 12000),
            }}
          />
        </div>

        <Button
          className="h-14 w-full rounded-2xl text-base"
          disabled={topic.completed || complete.isPending}
          onClick={() =>
            complete.mutate(topic, {
              onSuccess: () => navigate({ to: "/subject/$subjectId", params: { subjectId: subject.id } }),
            })
          }
        >
          {complete.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-5 w-5" />
          )}
          {topic.completed ? "Already grown" : "Mark as grown (+25 XP)"}
        </Button>
      </main>
    </div>
  );
}
