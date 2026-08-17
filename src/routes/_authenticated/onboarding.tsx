import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AthenaAvatar } from "@/components/garden/AthenaAvatar";
import { GardenSky } from "@/components/garden/GardenSky";
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/lib/athena";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Plant Your Garden — AthenaGrow" },
      {
        name: "description",
        content: "Tell Athena your name and what you're studying so your learning garden fits you.",
      },
      { property: "og:title", content: "Plant Your Garden — AthenaGrow" },
      {
        property: "og:description",
        content: "A two-step start: your name, your field of study, then your garden grows.",
      },
    ],
  }),
  component: Onboarding,
});

const CATEGORIES = [
  "School",
  "College / University",
  "Competitive Exam",
  "Professional Skill",
  "Self Learning",
];

function Onboarding() {
  const navigate = useNavigate();
  const profile = useProfile();
  const update = useUpdateProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.data?.display_name ?? "");
  const [category, setCategory] = useState(profile.data?.category ?? "");
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setError(null);
    if (!name.trim()) {
      setStep(0);
      setError("Athena would love to know your name.");
      return;
    }
    try {
      await update.mutateAsync({ display_name: name.trim(), category: category || "Self Learning" });
      navigate({ to: "/create" });
    } catch {
      setError("Could not save your details. Please try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <GardenSky className="min-h-[240px] px-5 pb-10 pt-12">
        <div className="mx-auto max-w-md text-center">
          <AthenaAvatar size={80} className="mx-auto" />
          <h1 className="mt-3 font-display text-3xl">Let's plant your garden</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Two quick questions and Athena starts growing with you.
          </p>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-8 max-w-md px-5 pb-16">
        <div className="rounded-3xl glass-card p-6 animate-grow-in">
          {step === 0 ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium">What should Athena call you?</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                className="h-12 w-full rounded-2xl"
                onClick={() => (name.trim() ? setStep(1) : setError("Please enter your name."))}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium">What are you learning for?</label>
              <div className="grid gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                      category === c
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-input hover:bg-secondary",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="h-12 flex-1 rounded-2xl" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  className="h-12 flex-1 rounded-2xl"
                  disabled={update.isPending}
                  onClick={() => void finish()}
                >
                  {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start growing
                </Button>
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </main>
    </div>
  );
}
