import { useState } from "react";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { loadRun, SAMPLE_RUN } from "@/lib/store";
import { Brain, Loader2, Target, BookOpen, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Insights() {
  const run = loadRun() ?? SAMPLE_RUN;
  const [jd, setJd] = useState("");
  const [gap, setGap] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loadingG, setLoadingG] = useState(false);
  const [loadingR, setLoadingR] = useState(false);

  const profile = {
    final_score: run.result?.final_score, depth_level: run.result?.depth_level,
    radar: run.result?.radar, tech_stack: run.analysis?.tech_stack,
    domain_tags: run.analysis?.domain_tags ?? run.result?.domain_tags,
    project: run.analysis?.purpose ?? run.analysis?.project_type,
  };

  const analyzeGap = async () => {
    if (!jd.trim()) return toast.error("Paste a JD first");
    setLoadingG(true);
    try {
      const { data } = await supabase.functions.invoke("hivex-ai", { body: { action: "skill_gap", payload: { profile, jd } } });
      setGap(data?.data ?? null);
    } catch { toast.error("Failed"); } finally { setLoadingG(false); }
  };
  const buildRoadmap = async () => {
    setLoadingR(true);
    try {
      const { data } = await supabase.functions.invoke("hivex-ai", { body: { action: "roadmap", payload: { profile } } });
      setRoadmap(data?.data ?? null);
    } catch { toast.error("Failed"); } finally { setLoadingR(false); }
  };

  return (
    <HiveLayout>
      <section className="container py-12 max-w-5xl">
        <div className="mb-8">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">AI Insights</div>
          <h1 className="font-display text-4xl font-bold mt-1">What should you <span className="text-gradient">learn next</span>?</h1>
          <p className="text-muted-foreground mt-2 text-sm">Personalized to your verified profile.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary-glow" />Skill gap vs job description</h3>
            <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste a job description here…" className="bg-input/60 border-white/10 min-h-[120px]" />
            <Button onClick={analyzeGap} disabled={loadingG} className="w-full mt-3 bg-gradient-to-r from-primary to-secondary">
              {loadingG ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}Analyze gap
            </Button>
            {gap && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Match</span>
                  <span className="font-display text-3xl font-bold text-gradient">{gap.match_percent}%</span>
                </div>
                <p className="text-sm italic text-muted-foreground">"{gap.verdict}"</p>
                <div>
                  <div className="text-xs text-accent mb-1.5">Matched</div>
                  <div className="flex flex-wrap gap-1.5">{gap.matched?.map((s: string) => <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{s}</span>)}</div>
                </div>
                <div>
                  <div className="text-xs text-destructive mb-1.5">Missing</div>
                  <div className="flex flex-wrap gap-1.5">{gap.missing?.map((s: string) => <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-destructive/10 border border-destructive/30 text-destructive inline-flex items-center gap-1"><XCircle className="w-3 h-3" />{s}</span>)}</div>
                </div>
                {gap.recommended_projects?.length > 0 && (
                  <div>
                    <div className="text-xs text-secondary mb-1.5">Build these to close the gap</div>
                    <ul className="space-y-1 text-sm">{gap.recommended_projects.map((p: string, i: number) => <li key={i}>→ {p}</li>)}</ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="space-y-5">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" />Personal roadmap</h3>
              <Button onClick={buildRoadmap} disabled={loadingR} className="w-full bg-gradient-to-r from-primary to-secondary">
                {loadingR ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}Generate my roadmap
              </Button>
              {roadmap && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Next skill</div>
                    <div className="text-lg font-display font-semibold text-gradient">{roadmap.next_skill}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Target role: <span className="text-foreground">{roadmap.target_role}</span></div>
                  <div className="space-y-2">
                    {roadmap.steps?.map((s: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 border border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{i + 1}. {s.title}</div>
                          <span className="text-[10px] text-accent font-mono">{s.weeks}w</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{s.why}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-glow" />Industry benchmarks</h3>
              <ul className="text-sm space-y-2">
                <li>📈 Your <span className="text-accent">Robotics</span> score is top <span className="font-mono">12%</span> of HiveX users.</li>
                <li>📊 Rust verifications grew <span className="text-accent">+34%</span> this month.</li>
                <li>🔥 Edge-AI projects are the fastest-rising domain.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </HiveLayout>
  );
}
