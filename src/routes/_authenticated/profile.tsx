import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { AthenaAvatar } from "@/components/garden/AthenaAvatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useGoalMutations, useGoals, useProfile, useStats, useUpdateProfile } from "@/lib/athena";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Goals — AthenaGrow" },
      {
        name: "description",
        content: "Update your name, learning category and personal study goals in AthenaGrow.",
      },
      { property: "og:title", content: "Profile & Goals — AthenaGrow" },
      { property: "og:description", content: "Your gardener profile and goal list." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const stats = useStats();
  const update = useUpdateProfile();
  const goals = useGoals();
  const { add, toggle, remove } = useGoalMutations();
  const [name, setName] = useState(profile.data?.display_name ?? "");
  const [goalText, setGoalText] = useState("");

  return (
    <div>
      <GardenSky className="min-h-[200px] px-5 pb-8 pt-10">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <AthenaAvatar size={64} animate={false} />
          <div>
            <h1 className="font-display text-3xl">{profile.data?.display_name ?? "Gardener"}</h1>
            <p className="mt-1 text-sm text-foreground/70">
              {profile.data?.category ?? "Self Learning"} • {stats.data?.xp ?? 0} XP
            </p>
          </div>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-5 pb-10">
        <section className="rounded-3xl glass-card p-5">
          <h2 className="font-display text-xl">Display name</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              className="h-12 rounded-2xl"
              disabled={!name.trim() || update.isPending}
              onClick={() => update.mutate({ display_name: name.trim() })}
            >
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </section>

        <section className="rounded-3xl glass-card p-5">
          <h2 className="font-display text-xl">My goals</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!goalText.trim()) return;
              add.mutate(goalText.trim());
              setGoalText("");
            }}
          >
            <input
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. Finish Unit 2 this week"
              className="h-12 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" className="h-12 rounded-2xl" disabled={add.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <ul className="mt-3 space-y-2">
            {(goals.data ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">No goals yet — plant one above.</li>
            )}
            {(goals.data ?? []).map((g) => (
              <li key={g.id} className="flex items-center gap-2 rounded-2xl bg-secondary/70 px-3 py-2">
                <input
                  type="checkbox"
                  checked={g.done}
                  onChange={() => toggle.mutate({ id: g.id, done: !g.done })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className={g.done ? "flex-1 text-sm line-through opacity-60" : "flex-1 text-sm"}>
                  {g.text}
                </span>
                <button type="button" aria-label="Delete goal" onClick={() => remove.mutate(g.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Button
          variant="outline"
          className="h-12 w-full rounded-2xl"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </main>
    </div>
  );
}
