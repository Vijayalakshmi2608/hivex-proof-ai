import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadRun, patchRun } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Bot, User, Loader2, Send, Maximize2, Minimize2, Timer } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "ai" | "user"; text: string };

export default function Interview() {
  const nav = useNavigate();
  const run = loadRun();
  const [idx, setIdx] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!run?.questions?.length) { nav("/dashboard"); return; }
    typeAi(run.questions[0].q);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const typeAi = async (text: string) => {
    setTyping(true);
    setMsgs((m) => [...m, { role: "ai", text: "" }]);
    for (let i = 1; i <= text.length; i++) {
      await new Promise((r) => setTimeout(r, 12));
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "ai", text: text.slice(0, i) };
        return copy;
      });
    }
    setTyping(false);
  };

  const send = async () => {
    if (!input.trim() || busy || !run) return;
    const ans = input.trim();
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: ans }]);
    const qa = [...(run.qa ?? []), { question: run.questions![idx].q, answer: ans }];
    patchRun({ qa });
    setBusy(true);
    const next = idx + 1;
    if (next < run.questions!.length) {
      // brief AI ack + ask next
      const { data } = await supabase.functions.invoke("hivex-ai", {
        body: {
          action: "interview_followup",
          payload: {
            messages: [
              { role: "user", content: `Project context: ${JSON.stringify(run.analysis).slice(0, 1500)}` },
              ...qa.flatMap((x) => [
                { role: "assistant", content: x.question },
                { role: "user", content: x.answer },
              ]),
              { role: "user", content: `Now ask this next: "${run.questions![next].q}". One short ack then the question.` },
            ],
          },
        },
      });
      const reply = data?.data?.reply ?? run.questions![next].q;
      await typeAi(reply);
      setIdx(next);
      setBusy(false);
    } else {
      // evaluate
      await typeAi("Great. Sealing your evaluation now…");
      const { data, error } = await supabase.functions.invoke("hivex-ai", {
        body: { action: "evaluate", payload: { analysis: run.analysis, qa } },
      });
      if (error || !data?.data) {
        toast.error("Evaluation failed");
        setBusy(false);
        return;
      }
      patchRun({ result: data.data });
      nav("/results");
    }
  };

  const total = run?.questions?.length ?? 0;
  const progress = total ? Math.min(100, (idx / total) * 100) : 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const Inner = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 px-2 mb-4">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">
            Question {Math.min(idx + 1, total)} of {total}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md glass">
          <Timer className="w-3 h-3 text-accent" /> {mm}:{ss}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setFullscreen((f) => !f)}>
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "ai" ? "glass" : "bg-primary/20 border border-primary/30"
              }`}>
                {m.text}
                {typing && i === msgs.length - 1 && m.role === "ai" && <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-blink align-middle" />}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type your answer…"
          disabled={busy || typing}
          className="bg-input/60 border-white/10 min-h-[60px] resize-none"
        />
        <Button
          onClick={send}
          disabled={busy || typing || !input.trim()}
          className="bg-gradient-to-br from-primary to-secondary text-primary-foreground self-stretch px-5"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background grid-bg p-6 md:p-10">
        <div className="max-w-4xl mx-auto h-full glass rounded-2xl p-6">{Inner}</div>
      </div>
    );
  }

  return (
    <HiveLayout>
      <section className="container py-10 max-w-3xl">
        <div className="text-xs text-muted-foreground mb-2">Step 3 of 3 · AI Viva Mode</div>
        <div className="glass rounded-2xl p-6 h-[70vh]">{Inner}</div>
      </section>
    </HiveLayout>
  );
}