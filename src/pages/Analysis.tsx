import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { loadRun, patchRun } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, FileCode2, AlertTriangle, CheckCircle2, Cpu, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

const Badge = ({ children, color = "primary" }: { children: React.ReactNode; color?: string }) => (
  <span className={`inline-block text-xs px-2.5 py-1 rounded-md border bg-${color}/10 border-${color}/30 text-${color === "primary" ? "primary-glow" : color}`}>
    {children}
  </span>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl p-6">
    <h3 className="font-display font-semibold text-lg mb-4">{title}</h3>
    {children}
  </div>
);

const RealityMeter = ({ value }: { value: number }) => (
  <div>
    <div className="flex justify-between text-xs text-muted-foreground mb-2">
      <span>Fake / Template</span>
      <span>Real Build</span>
    </div>
    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-destructive via-yellow-400 to-accent"
      />
    </div>
    <div className="text-right text-sm mt-2 font-mono text-accent">{value}/100</div>
  </div>
);

export default function Analysis() {
  const nav = useNavigate();
  const [run, setRun] = useState(loadRun());
  const [generating, setGenerating] = useState(false);

  useEffect(() => { if (!run?.analysis) nav("/dashboard"); }, [run, nav]);
  if (!run?.analysis) return null;
  const a = run.analysis;
  const isSoftware = run.mode === "software";

  const startInterview = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("hivex-ai", {
        body: { action: "generate_questions", payload: { analysis: a } },
      });
      if (error) throw error;
      const qs = data?.data?.questions ?? [];
      patchRun({ questions: qs, qa: [] });
      nav("/interview");
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <HiveLayout>
      <section className="container py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs text-muted-foreground">Step 2 of 3 · AI Analysis</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">
            {isSoftware ? a.purpose : a.project_type}
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {isSoftware ? (
              <>
                <Section title="Tech stack">
                  <div className="flex flex-wrap gap-2">
                    {a.tech_stack?.map((t: string) => (
                      <span key={t} className="text-xs font-mono px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary-glow">{t}</span>
                    ))}
                  </div>
                </Section>
                <Section title="Key features">
                  <ul className="space-y-2">
                    {a.features?.map((f: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{f}</li>
                    ))}
                  </ul>
                </Section>
                <Section title="🔍 Code X-Ray">
                  <div className="space-y-2">
                    {a.code_xray?.map((c: any, i: number) => {
                      const tone = c.quality === "strong" ? "accent" : c.quality === "template" ? "destructive" : "secondary";
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-white/5">
                          <FileCode2 className={`w-4 h-4 mt-0.5 text-${tone}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs text-foreground/90 truncate">{c.file}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{c.note}</div>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-${tone}/15 text-${tone === "accent" ? "accent" : tone === "destructive" ? "destructive" : "secondary"}`}>
                            {c.quality}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </>
            ) : (
              <>
                {run.input.imageBase64 && (
                  <div className="glass rounded-2xl p-3">
                    <img src={run.input.imageBase64} alt="" className="w-full max-h-80 object-contain rounded-xl" />
                  </div>
                )}
                <Section title="Detected components">
                  <div className="grid grid-cols-2 gap-2">
                    {a.components?.map((c: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-white/5 text-sm">
                        <Cpu className="w-4 h-4 text-secondary" /> {c}
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Build explanation">
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.build_explanation}</p>
                </Section>
                <Section title="🎯 Reality Meter">
                  <RealityMeter value={a.realism_check ?? 50} />
                </Section>
              </>
            )}

            {a.weaknesses?.length > 0 && (
              <Section title="Possible weaknesses">
                <ul className="space-y-2">
                  {a.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground"><AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />{w}</li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <div className="space-y-5">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Complexity</div>
              <div className="font-display text-2xl font-bold text-gradient">{a.complexity}</div>
            </div>
            {isSoftware && a.originality_signal && (
              <div className="glass rounded-2xl p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Originality signal</div>
                <Badge color={a.originality_signal === "original" ? "accent" : a.originality_signal === "template" ? "destructive" : "secondary"}>
                  {a.originality_signal}
                </Badge>
              </div>
            )}
            <Button
              onClick={startInterview}
              disabled={generating}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold glow-purple"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Start AI Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </HiveLayout>
  );
}