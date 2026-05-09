import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { loadRun } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Wand2, FileText, ArrowRight, Loader2, Download, AlertOctagon } from "lucide-react";
import { TrustRadar } from "@/components/hive/TrustRadar";
import { VerifiedBadge, downloadBadgeSvg } from "@/components/hive/VerifiedBadge";

const Score = ({ value }: { value: number }) => {
  const r = 80; const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let s = 0;
    const id = setInterval(() => { s += 1; if (s >= value) { setAnimated(value); clearInterval(id); } else setAnimated(s); }, 18);
    return () => clearInterval(id);
  }, [value]);
  const offset = c - (animated / 100) * c;
  return (
    <div className="relative w-56 h-56">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--neon-purple))" />
            <stop offset="50%" stopColor="hsl(var(--neon-blue))" />
            <stop offset="100%" stopColor="hsl(var(--neon-cyan))" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#g)" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-6xl font-bold text-gradient">{animated}</div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">HiveX Score</div>
      </div>
    </div>
  );
};

const TrustBadge = ({ trust, reason }: { trust: string; reason: string }) => {
  const map: Record<string, { dot: string; label: string }> = {
    verified: { dot: "🟢", label: "Verified Builder" },
    review: { dot: "🟡", label: "Needs Review" },
    suspicious: { dot: "🔴", label: "Suspicious Submission" },
  };
  const cfg = map[trust] ?? map.review;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-sm font-semibold flex items-center gap-2"><span>{cfg.dot}</span>{cfg.label}</div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{reason}</p>
    </div>
  );
};

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">{label}</span><span className="font-mono">{value}/100</span></div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-primary via-secondary to-accent" />
    </div>
  </div>
);

const sevColor = (s: string) => s === "high" ? "text-destructive border-destructive/30 bg-destructive/10" : s === "medium" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" : "text-muted-foreground border-white/10 bg-white/5";

export default function Results() {
  const nav = useNavigate();
  const run = loadRun();
  const [improvements, setImprovements] = useState<string[] | null>(null);
  const [demo, setDemo] = useState<{ pitch: string; talking_points: string[] } | null>(null);
  const [loadingI, setLoadingI] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const badgeRef = useRef<SVGSVGElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!run?.result) { nav("/dashboard"); return; }
    if (!fired.current && (run.result.final_score ?? 0) >= 70) {
      fired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 }, colors: ["#a855f7", "#06b6d4", "#22d3ee", "#fbbf24"] });
      }, 600);
    }
  }, [run, nav]);
  if (!run?.result) return null;
  const r = run.result;
  const radar = r.radar ?? { depth: r.skill_breakdown?.logic ?? 60, originality: r.skill_breakdown?.problem_solving ?? 60, communication: r.confidence_score ?? 60, execution: r.skill_breakdown?.backend ?? 60, innovation: r.skill_breakdown?.hardware ?? 60 };

  const improve = async () => {
    setLoadingI(true);
    const { data } = await supabase.functions.invoke("hivex-ai", { body: { action: "improve", payload: { analysis: run.analysis } } });
    setImprovements(data?.data?.suggestions ?? []); setLoadingI(false);
  };
  const genDemo = async () => {
    setLoadingD(true);
    const { data } = await supabase.functions.invoke("hivex-ai", { body: { action: "demo_script", payload: { analysis: run.analysis } } });
    setDemo(data?.data ?? null); setLoadingD(false);
  };

  const projectName = run.mode === "software" ? run.analysis?.purpose : run.analysis?.project_type;

  return (
    <HiveLayout>
      <section className="container py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[auto,1fr] gap-10 items-center mb-10">
          <div className="flex justify-center"><Score value={r.final_score ?? 0} /></div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Verification complete</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
              You're <span className="text-gradient">{r.depth_level}</span> on this build.
            </h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="glass px-4 py-2 rounded-lg text-sm"><span className="text-muted-foreground">Confidence</span> <span className="font-mono text-accent">{r.confidence_score}%</span></div>
              <div className="glass px-4 py-2 rounded-lg text-sm"><span className="text-muted-foreground">Depth</span> <span className="text-secondary">{r.depth_level}</span></div>
              {typeof r.percentile === "number" && (
                <div className="glass px-4 py-2 rounded-lg text-sm"><span className="text-muted-foreground">Percentile</span> <span className="text-primary-glow">Top {Math.max(1, 100 - r.percentile)}%</span></div>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground italic">"{r.reality_check}"</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-2">Trust radar</h3>
              <p className="text-xs text-muted-foreground mb-3">Five-dimensional assessment from analysis + viva</p>
              <TrustRadar data={radar} />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Skill breakdown</h3>
              <div className="space-y-4">
                <Bar label="Logic" value={r.skill_breakdown?.logic ?? 0} />
                <Bar label="Backend" value={r.skill_breakdown?.backend ?? 0} />
                <Bar label="Hardware" value={r.skill_breakdown?.hardware ?? 0} />
                <Bar label="Problem Solving" value={r.skill_breakdown?.problem_solving ?? 0} />
              </div>
            </div>

            {r.red_flags?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-destructive/30">
                <h4 className="font-semibold mb-3 text-destructive flex items-center gap-2"><AlertOctagon className="w-4 h-4" />Red flags</h4>
                <div className="space-y-2">
                  {r.red_flags.map((f: any, i: number) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${sevColor(f.severity)}`}>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-background/40">{f.kind.replace("_", " ")}</span>
                      <span className="text-xs flex-1">{f.detail}</span>
                      <span className="text-[10px] uppercase">{f.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div className="glass rounded-2xl p-6">
                <h4 className="font-semibold mb-3 text-accent">Strengths</h4>
                <ul className="space-y-2 text-sm">{r.strengths?.map((s: string, i: number) => <li key={i}>✓ {s}</li>)}</ul>
              </div>
              <div className="glass rounded-2xl p-6">
                <h4 className="font-semibold mb-3 text-yellow-400">Weaknesses</h4>
                <ul className="space-y-2 text-sm">{r.weaknesses?.map((s: string, i: number) => <li key={i}>! {s}</li>)}</ul>
              </div>
            </div>

            {r.contradictions?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-destructive/30">
                <h4 className="font-semibold mb-3 text-destructive">Contradiction detection</h4>
                <ul className="space-y-2 text-sm">{r.contradictions.map((c: string, i: number) => <li key={i}>⚠ {c}</li>)}</ul>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              <div className="glass rounded-2xl p-6">
                <h4 className="font-semibold flex items-center gap-2 mb-3"><Wand2 className="w-4 h-4 text-primary-glow" />Improve my project</h4>
                {!improvements ? (
                  <Button onClick={improve} disabled={loadingI} variant="outline" className="w-full glass border-white/10">
                    {loadingI && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Generate suggestions
                  </Button>
                ) : <ul className="space-y-2 text-sm">{improvements.map((s, i) => <li key={i}>→ {s}</li>)}</ul>}
              </div>
              <div className="glass rounded-2xl p-6">
                <h4 className="font-semibold flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-accent" />Auto demo script</h4>
                {!demo ? (
                  <Button onClick={genDemo} disabled={loadingD} variant="outline" className="w-full glass border-white/10">
                    {loadingD && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Generate 30-sec pitch
                  </Button>
                ) : (
                  <div className="text-sm space-y-3">
                    <p className="italic text-muted-foreground">"{demo.pitch}"</p>
                    <ul className="space-y-1">{demo.talking_points.map((t, i) => <li key={i}>• {t}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <TrustBadge trust={r.trust} reason={r.trust_reason} />
            <div className="glass rounded-2xl p-2">
              <VerifiedBadge name={projectName?.slice(0, 24) ?? "Builder"} score={r.final_score} depth={r.depth_level} trust={r.trust} />
            </div>
            <Button onClick={() => { const svg = document.querySelector(".glass svg") as SVGSVGElement | null; if (svg) downloadBadgeSvg(svg, "hivex-badge.svg"); }}
              variant="outline" className="w-full glass border-white/10">
              <Download className="w-4 h-4 mr-2" />Download verified badge (SVG)
            </Button>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Future prediction</div>
              <div className="text-sm flex gap-2"><Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />{r.future_prediction}</div>
            </div>
            <Button asChild className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold">
              <Link to="/passport">View Skill Passport <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" className="w-full glass border-white/10">
              <Link to="/judge">Switch to Judge Mode</Link>
            </Button>
          </div>
        </div>
      </section>
    </HiveLayout>
  );
}
