import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sprout } from "lucide-react";
import { GardenSky } from "@/components/garden/GardenSky";
import { MaterialUploader, type LoadedFile } from "@/components/MaterialUploader";
import { Button } from "@/components/ui/button";
import { createSubjectFromMaterial } from "@/lib/athena";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Grow a New Subject — AthenaGrow" },
      {
        name: "description",
        content:
          "Upload a syllabus PDF or paste your topics and Athena grows a personalized learning roadmap.",
      },
      { property: "og:title", content: "Grow a New Subject — AthenaGrow" },
      {
        property: "og:description",
        content: "Your syllabus becomes a living roadmap of lessons, quizzes and revision.",
      },
    ],
  }),
  component: CreateSubject,
});

function CreateSubject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [syllabusFiles, setSyllabusFiles] = useState<LoadedFile[]>([]);
  const [syllabusText, setSyllabusText] = useState("");
  const [noteFiles, setNoteFiles] = useState<LoadedFile[]>([]);
  const [noteText, setNoteText] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syllabus = [...syllabusFiles.map((f) => f.text), syllabusText].filter(Boolean).join("\n\n");
  const ready = syllabus.replace(/\s/g, "").length >= 20;

  async function grow() {
    setError(null);
    setStage("Preparing the soil...");
    try {
      const notes = [...noteFiles];
      if (noteText.trim()) notes.push({ name: "Pasted notes", text: noteText.trim() });
      const result = await createSubjectFromMaterial({
        name: name.trim() || undefined,
        syllabus,
        syllabusFileName: syllabusFiles[0]?.name,
        notes,
        onStage: setStage,
      });
      await qc.invalidateQueries();
      navigate({ to: "/subject/$subjectId", params: { subjectId: result.subjectId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while growing your subject.");
      setStage(null);
    }
  }

  return (
    <div>
      <GardenSky className="min-h-[200px] px-5 pb-8 pt-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl">Grow a new subject</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Athena reads your material and plants a full roadmap — no manual topic entry.
          </p>
        </div>
      </GardenSky>

      <main className="mx-auto -mt-6 max-w-2xl space-y-4 px-5 pb-10">
        <div className="rounded-3xl glass-card p-4">
          <label className="text-sm font-medium">Subject name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Athena will detect this if you leave it blank"
            className="mt-2 h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <MaterialUploader
          label="Syllabus"
          description="Upload a PDF or text syllabus, or paste your unit list."
          files={syllabusFiles}
          onFilesChange={setSyllabusFiles}
          pasted={syllabusText}
          onPastedChange={setSyllabusText}
          pasteLabel="Paste your syllabus, units or topic list here..."
        />

        <MaterialUploader
          label="Notes & study material (optional)"
          description="Athena grounds explanations and quizzes in these files."
          multiple
          files={noteFiles}
          onFilesChange={setNoteFiles}
          pasted={noteText}
          onPastedChange={setNoteText}
          pasteLabel="Paste extra notes here..."
        />

        {error && (
          <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}

        <Button
          className="h-14 w-full rounded-2xl text-base"
          disabled={!ready || stage !== null}
          onClick={() => void grow()}
        >
          {stage ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {stage}
            </>
          ) : (
            <>
              <Sprout className="mr-2 h-5 w-5" /> Grow My Garden
            </>
          )}
        </Button>
        {!ready && (
          <p className="text-center text-xs text-muted-foreground">
            Add a syllabus file or paste some topics to enable growing.
          </p>
        )}
      </main>
    </div>
  );
}
