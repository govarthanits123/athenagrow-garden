import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { askAthenaClient } from "@/lib/athena-api";
import { AthenaAvatar } from "@/components/garden/AthenaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AthenaContext = {
  learner?: string | undefined;
  subject?: string | undefined;
  topic?: string | undefined;
  roadmap?: string | undefined;
  material?: string | undefined;
  progress?: string | undefined;
};

type Msg = { role: "user" | "assistant"; content: string };

const QUICK: { label: string; prompt: string }[] = [
  { label: "Explain", prompt: "Explain this topic in simple terms with an example." },
  { label: "Summarize", prompt: "Summarize my uploaded material for this topic in bullet points." },
  { label: "Generate Quiz", prompt: "Give me a 5 question quiz about this topic with answers." },
  { label: "Flashcards", prompt: "Create 8 flashcards (Q -> A) for this topic." },
  { label: "Voice Mode", prompt: "Read this topic out to me as a short spoken-style lesson." },
  { label: "Ask Athena", prompt: "" },
];

export function AthenaConversation({
  context,
  className,
  compact,
}: {
  context: AthenaContext;
  className?: string;
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSent = useRef<Msg[] | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function run(history: Msg[]) {
    setPending(true);
    setError(null);
    lastSent.current = history;
    try {
      const res = await askAthenaClient({ messages: history, context });
      setMessages([...history, { role: "assistant", content: res.answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Athena could not respond.");
    } finally {
      setPending(false);
    }
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(history);
    setInput("");
    void run(history);
  }

  const voiceRequested = (text: string) => /read this topic out/i.test(text);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text.replace(/[#*`>]/g, "").slice(0, 1200));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  useEffect(() => {
    if (lastAssistant && lastUser && voiceRequested(lastUser.content)) speak(lastAssistant.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAssistant?.content]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap gap-2 border-b border-border/60 px-3 py-2">
        {QUICK.map((q) => (
          <Button
            key={q.label}
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-full text-xs"
            disabled={pending}
            onClick={() => (q.prompt ? send(q.prompt) : document.getElementById("athena-input")?.focus())}
          >
            {q.label}
          </Button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className={cn("flex-1 space-y-3 overflow-y-auto px-3 py-3", compact ? "max-h-72" : "")}
      >
        {messages.length === 0 && !pending && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <AthenaAvatar size={56} />
            <p className="text-sm text-muted-foreground">
              Ask me anything about {context.topic ?? context.subject ?? "your studies"}.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "animate-grow-in max-w-[92%] rounded-2xl px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {m.role === "assistant" ? (
              <div className="prose prose-sm max-w-none prose-headings:font-display prose-p:my-1.5 prose-li:my-0.5 dark:prose-invert">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ) : (
              m.content
            )}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Athena is thinking...
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => lastSent.current && void run(lastSent.current)}
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Retry
            </Button>
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border/60 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          id="athena-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Athena..."
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={pending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export function FloatingAthena({ context }: { context: AthenaContext }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-24 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl glass-card animate-grow-in sm:left-auto sm:right-6 sm:w-96">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="flex items-center gap-2 font-display text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Athena
            </span>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AthenaConversation context={context} className="min-h-0 flex-1" compact />
        </div>
      )}
      <button
        type="button"
        aria-label="Open Athena"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border transition-transform hover:scale-105"
      >
        <AthenaAvatar size={40} animate={!open} />
      </button>
    </>
  );
}
