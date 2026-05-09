import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { loadRun, patchRun } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, FileCode2, AlertTriangle, CheckCircle2, Cpu, Loader2, Wand2, GitCommit, ShieldAlert, Bot, Zap } from "lucide-react";
import { toast } from "sonner";

const Section = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
  <div className="glass rounded-2xl p-6">
    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">{Icon && <Icon className="w-4 h-4 text-primary-glow" />}{title}</h3>
    {children}
  </div>
);

const Meter = ({ value, low = "Low", high = "High", invert = false }: { value: number; low?: string; high?: string; invert?: boolean }) => (
  <div>
    <div className="flex justify-between text-xs text-muted-foreground mb-2"><span>{low}</span><span>{high}</span></div>
    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
        className={`h-full ${invert ? "bg-gradient-to-r from-accent via-yellow-400 to-destructive" : "bg-gradient-to-r from-destructive via-yellow-400 to-accent"}`} />
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
      const { data, error } = await supabase.functions.invoke("hivex-ai", { body: { action: "generate_questions", payload: { analysis: a } } });
      if (error) throw error;
      const qs = data?.data?.questions ?? [];
      patchRun({ questions: qs, qa: [] });
      nav("/interview");
    } catch (e: any) { toast.error(e.message ?? "Failed"); } finally { setGenerating(false); }
  };

  return (
    <HiveLayout>
      <section className="container py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs text-muted-foreground">Step 2 of 3 · AI Analysis</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">{isSoftware ? a.purpose : a.project_type}</h1>
          {a.domain_tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.domain_tags.map((t: string) => <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent">#{t}</span>)}
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {isSoftware ? (
              <>
                <Section title="Tech stack">
                  <div className="flex flex-wrap gap-2">
                    {a.tech_stack?.map((t: string) => <span key={t} className="text-xs font-mono px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary-glow">{t}</span>)}
                  </div>
                </Section>
                <Section title="Key features" icon={CheckCircle2}>
                  <ul className="space-y-2">
                    {a.features?.map((f: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{f}</li>
                    ))}
                  </ul>
                </Section>
                <Section title="Code X-Ray" icon={FileCode2}>
                  <div className="space-y-2">
                    {a.code_xray?.map((c: any, i: number) => {
                      const tone = c.quality === "strong" ? "accent" : c.quality === "template" ? "destructive" : "secondary";
                      const text = tone === "accent" ? "text-accent" : tone === "destructive" ? "text-destructive" : "text-secondary";
                      const bg = tone === "accent" ? "bg-accent/15" : tone === "destructive" ? "bg-destructive/15" : "bg-secondary/15";
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-white/5">
                          <FileCode2 className={`w-4 h-4 mt-0.5 ${text}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs text-foreground/90 truncate">{c.file}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{c.note}</div>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${bg} ${text}`}>{c.quality}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
                {a.commit_pattern && (
                  <Section title="Commit pattern" icon={GitCommit}>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.commit_pattern}</p>
                    {a._meta?.commits?.length > 0 && (
                      <div className="mt-3 flex gap-1 h-8 items-end">
                        {a._meta.commits.slice(0, 30).reverse().map((_: any, i: number) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-primary/40 to-accent/40 rounded-sm" style={{ height: `${20 + Math.random() * 80}%` }} />
                        ))}
                      </div>
                    )}
                  </Section>
                )}
                {a.dependency_risks?.length > 0 && (
                  <Section title="Dependency risks" icon={ShieldAlert}>
                    <ul className="space-y-2">
                      {a.dependency_risks.map((d: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-yellow-400/90"><ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />{d}</li>
                      ))}
                    </ul>
                  </Section>
                )}
              </>
            ) : (
              <>
                {(run.input.images?.length || run.input.imageBase64) && (
                  <div className="glass rounded-2xl p-3 grid grid-cols-2 gap-2">
                    {(run.input.images ?? [run.input.imageBase64!]).slice(0, 4).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
                    ))}
                  </div>
                )}
                <Section title="Detected components" icon={Cpu}>
                  <div className="grid grid-cols-2 gap-2">
                    {a.components?.map((c: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-white/5 text-sm">
                        <Cpu className="w-4 h-4 text-secondary" /> {c}
                      </div>
                    ))}
                  </div>
                </Section>
                {a.bom?.length > 0 && (
                  <Section title="Bill of Materials">
                    <div className="overflow-hidden rounded-lg border border-white/5">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr><th className="text-left px-3 py-2">Part</th><th className="text-right px-3 py-2">Qty</th><th className="text-right px-3 py-2">Est. $</th><th className="text-left px-3 py-2">Notes</th></tr>
                        </thead>
                        <tbody>
                          {a.bom.map((b: any, i: number) => (
                            <tr key={i} className="border-t border-white/5">
                              <td className="px-3 py-2 font-mono text-xs">{b.part}</td>
                              <td className="px-3 py-2 text-right">{b.qty}</td>
                              <td className="px-3 py-2 text-right text-accent">${b.est_cost_usd?.toFixed(2)}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{b.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-muted-foreground">Total estimated cost</span>
                      <span className="font-mono text-accent">${a.bom.reduce((s: number, b: any) => s + (b.est_cost_usd || 0) * (b.qty || 1), 0).toFixed(2)}</span>
                    </div>
                  </Section>
                )}
                <Section title="Build explanation">
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.build_explanation}</p>
                </Section>
                <Section title="Reality Meter" icon={Zap}>
                  <Meter value={a.realism_check ?? 50} low="Fake / Template" high="Real Build" />
                </Section>
                {typeof a.copy_paste_likelihood === "number" && (
                  <Section title="Copy-paste likelihood" icon={ShieldAlert}>
                    <Meter value={a.copy_paste_likelihood} low="Original" high="Copied tutorial" invert />
                  </Section>
                )}
              </>
            )}

            {a.weaknesses?.length > 0 && (
              <Section title="Possible weaknesses" icon={AlertTriangle}>
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
            {isSoftware && typeof a.ast_complexity_score === "number" && (
              <div className="glass rounded-2xl p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">AST complexity</div>
                <Meter value={a.ast_complexity_score} low="Simple" high="Complex" />
              </div>
            )}
            {isSoftware && typeof a.ai_generated_likelihood === "number" && (
              <div className="glass rounded-2xl p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> AI-generated likelihood</div>
                <Meter value={a.ai_generated_likelihood} low="Human" high="AI" invert />
              </div>
            )}
            {isSoftware && a.originality_signal && (
              <div className="glass rounded-2xl p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Originality</div>
                <span className={`inline-block text-xs px-2.5 py-1 rounded-md border ${
                  a.originality_signal === "original" ? "bg-accent/10 border-accent/30 text-accent" :
                  a.originality_signal === "template" ? "bg-destructive/10 border-destructive/30 text-destructive" :
                  "bg-secondary/10 border-secondary/30 text-secondary"
                }`}>{a.originality_signal}</span>
              </div>
            )}
            {!isSoftware && typeof a.power_budget_watts === "number" && (
              <div className="glass rounded-2xl p-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Power budget</div>
                <div className="font-display text-2xl font-bold text-gradient">{a.power_budget_watts} W</div>
              </div>
            )}
            <Button onClick={startInterview} disabled={generating}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold glow-purple">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Start AI Interview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </HiveLayout>
  );
}
