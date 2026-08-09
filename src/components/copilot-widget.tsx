import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type AskResponse = {
  success: boolean;
  data: { answer: string; configured: boolean };
};

const STARTER_PROMPTS = [
  "Which banks are at risk of running out this week?",
  "Summarize today's pending recommendations.",
  "What's the highest-confidence transfer right now?",
];

export function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Checked once the panel is opened (not on every page load) so the widget
  // stays cheap when collapsed — used purely to show a subtle "not
  // configured" hint rather than letting the person send a question first
  // and only then discover the copilot isn't set up on this deployment.
  const { data: statusData } = useQuery({
    queryKey: ["copilot-status"],
    queryFn: () => apiGet<{ success: boolean; data: { configured: boolean } }>("/api/copilot/status"),
    enabled: open,
    staleTime: 60_000,
  });
  const configured = statusData?.data.configured ?? true; // assume configured until we know otherwise, to avoid a flash of the warning

  const askMutation = useMutation({
    mutationFn: (question: string) => apiPost<AskResponse>("/api/copilot/ask", { question }),
    onSuccess: (res) => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", text: res.data.answer },
      ]);
    },
    onError: (error: unknown) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          text: error instanceof Error ? error.message : "Something went wrong reaching the copilot.",
        },
      ]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, askMutation.isPending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || askMutation.isPending) return;
    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", text: trimmed }]);
    setInput("");
    askMutation.mutate(trimmed);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Ask PulseLink — get a plain-language explanation"
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md hover:border-primary/40 hover:text-primary"
      >
        <Sparkles className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <div className="text-[13px] font-semibold text-foreground">Ask PulseLink</div>
            <div className="text-[10.5px] text-muted-foreground">
              {configured ? "Grounded in live network data" : "Not configured on this deployment"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-[12.5px] text-muted-foreground">
              Ask about network status, shortage risk, or why a transfer was recommended — answers are grounded in
              your current live data.
            </p>
            <div className="space-y-1.5">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-left text-[12px] text-foreground hover:bg-surface"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-[12.5px] leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto border border-border bg-background text-foreground"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
        {askMutation.isPending ? (
          <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking live network data…
          </div>
        ) : null}
      </div>

      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-[12.5px] outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={askMutation.isPending || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
