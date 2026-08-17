import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { extractFile } from "@/lib/pdf";
import { Button } from "@/components/ui/button";

export type LoadedFile = { name: string; text: string };

export function MaterialUploader({
  label,
  description,
  multiple,
  files,
  onFilesChange,
  pasted,
  onPastedChange,
  pasteLabel,
}: {
  label: string;
  description?: string;
  multiple?: boolean;
  files: LoadedFile[];
  onFilesChange: (files: LoadedFile[]) => void;
  pasted: string;
  onPastedChange: (text: string) => void;
  pasteLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    const loaded: LoadedFile[] = [];
    const problems: string[] = [];
    for (const file of Array.from(list)) {
      try {
        loaded.push(await extractFile(file));
      } catch (e) {
        problems.push(e instanceof Error ? e.message : `Could not read ${file.name}`);
      }
    }
    if (loaded.length) {
      onFilesChange(multiple ? [...files, ...loaded] : loaded);
      setSuccess(
        loaded.some((l) => l.name.toLowerCase().endsWith(".pdf"))
          ? `PDF processed successfully — ${loaded.reduce((n, l) => n + l.text.length, 0).toLocaleString()} characters read`
          : `${loaded.length} file${loaded.length === 1 ? "" : "s"} read successfully`,
      );
    }
    if (problems.length) setError(problems.join(" "));
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-3xl glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">{label}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
          Upload
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain"
        multiple={multiple}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-2xl bg-secondary/70 px-3 py-2 text-sm"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(f.text.length / 100) / 10}k chars
              </span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {success && (
        <p className="mt-3 flex items-center gap-1 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <textarea
        value={pasted}
        onChange={(e) => onPastedChange(e.target.value)}
        rows={5}
        placeholder={pasteLabel}
        className="mt-3 w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
