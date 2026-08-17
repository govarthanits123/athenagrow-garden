import { createFileRoute } from "@tanstack/react-router";
import { GardenSky } from "@/components/garden/GardenSky";
import { AthenaConversation } from "@/components/AthenaPanel";
import { useMaterials, useProfile, useSubjects } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/athena")({
  head: () => ({
    meta: [
      { title: "Ask Athena — AthenaGrow" },
      {
        name: "description",
        content: "Chat with Athena about any subject in your garden, grounded in your own material.",
      },
      { property: "og:title", content: "Ask Athena — AthenaGrow" },
      { property: "og:description", content: "Your study companion, always in the garden." },
    ],
  }),
  component: AthenaPage,
});

function AthenaPage() {
  const profile = useProfile();
  const subjects = useSubjects();
  const materials = useMaterials();

  return (
    <div>
      <GardenSky className="min-h-[180px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl">Ask Athena</h1>
          <p className="mt-1 text-sm text-foreground/70">She knows everything in your garden.</p>
        </div>
      </GardenSky>
      <main className="mx-auto -mt-6 max-w-2xl px-5 pb-10">
        <div className="overflow-hidden rounded-3xl glass-card">
          <AthenaConversation
            context={{
              learner: profile.data?.display_name ?? undefined,
              subject: (subjects.data ?? []).map((s) => s.name).join(", ").slice(0, 120),
              material: materials.data?.map((m) => m.content).join("\n\n").slice(0, 12000),
            }}
          />
        </div>
      </main>
    </div>
  );
}
