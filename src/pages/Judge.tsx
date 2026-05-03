import { useState } from "react";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { loadRun } from "@/lib/store";
import { Trophy, Crown, ArrowRightLeft, Check, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const SEED = [
  { name: "Aanya R.", project: "Edge-AI Drone Path Planner", score: 92, conf: 95, depth: "Deep", trust: "verified" },
  { name: "Karan M.", project: "ESP32 Smart Greenhouse", score: 88, conf: 91, depth: "Deep", trust: "verified" },
  { name: "Liam T.", project: "Realtime Chat w/ CRDT", score: 81, conf: 84, depth: "Intermediate", trust: "verified" },
  { name: "Sara K.", project: "Stripe Clone Dashboard", score: 64, conf: 58, depth: "Surface", trust: "review" },
  { name: "Devon P.", project: "AI Resume Builder", score: 41, conf: 32, depth: "Surface", trust: "suspicious" },
];

const trustStyle = (t: string) => {
  if (t === "verified") return { Icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10 border-accent/30", label: "Verified" };
  if (t === "review") return { Icon: ShieldAlert, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", label: "Review" };
  return { Icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", label: "Suspicious" };
};

export default function Judge() {
  const run = loadRun();
  const list = [
    ...(run?.result ? [{
      name: "You",
      project: run.mode === "software" ? run.analysis?.purpose ?? "Your project" : run.analysis?.project_type ?? "Your build",
      score: run.result.final_score,
      conf: run.result.confidence_score,
      depth: run.result.depth_level,
      trust: run.result.trust,
    }] : []),
    ...SEED,
  ].sort((a, b) => b.score - a.score);

  const [pickA, setPickA] = useState<number | null>(null);
  const [pickB, setPickB] = useState<number | null>(null);
  const a = pickA != null ? list[pickA] : null;
  const b = pickB != null ? list[pickB] : null;

  return (
    <HiveLayout>
      <section className="container py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Judge Mode</div>
            <h1 className="font-display text-4xl font-bold mt-1">Rank by <span className="text-gradient">depth</span>, not buzzwords.</h1>
          </div>
          <div className="glass rounded-xl px-4 py-3 text-sm max-w-md">
            <span className="text-muted-foreground">AI summary:</span> Top 3 candidates show genuine depth across logic and originality. Bottom entries flagged for templated patterns and shallow answers.
          </div>
        </motion.div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-white/5">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Builder</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-2">Confidence</div>
            <div className="col-span-2">Trust</div>
            <div className="col-span-1 text-right">Pick</div>
          </div>
          {list.map((row, i) => {
            const ts = trustStyle(row.trust);
            return (
              <motion.div
                key={row.name + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-12 items-center px-5 py-4 border-b border-white/5 hover:bg-white/[0.02]"
              >
                <div className="col-span-1">
                  {i === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> :
                   i < 3 ? <Trophy className="w-4 h-4 text-secondary" /> :
                   <span className="text-muted-foreground font-mono">{i + 1}</span>}
                </div>
                <div className="col-span-4">
                  <div className="font-semibold">{row.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{row.project}</div>
                </div>
                <div className="col-span-2 font-display text-2xl font-bold text-gradient">{row.score}</div>
                <div className="col-span-2 font-mono text-sm">{row.conf}%</div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${ts.bg} ${ts.color}`}>
                    <ts.Icon className="w-3 h-3" /> {ts.label}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <Button size="sm" variant={pickA === i ? "default" : "outline"} className="h-7 px-2 text-xs glass border-white/10"
                    onClick={() => setPickA(i)}>A</Button>
                  <Button size="sm" variant={pickB === i ? "default" : "outline"} className="h-7 px-2 text-xs glass border-white/10"
                    onClick={() => setPickB(i)}>B</Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {a && b && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <ArrowRightLeft className="w-4 h-4" /> Comparison
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {[a, b].map((x, idx) => (
                <div key={idx} className={idx === 1 ? "md:order-3" : ""}>
                  <div className="text-sm text-muted-foreground">{idx === 0 ? "Candidate A" : "Candidate B"}</div>
                  <div className="font-display text-2xl font-bold mt-1">{x.name}</div>
                  <div className="text-xs text-muted-foreground">{x.project}</div>
                  <div className="font-display text-5xl font-bold text-gradient mt-3">{x.score}</div>
                  <div className="text-xs">Confidence {x.conf}% · {x.depth}</div>
                </div>
              ))}
              <div className="md:order-2 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Verdict</div>
                <div className="font-display text-xl mt-2 flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-accent" />
                  {a.score >= b.score ? a.name : b.name} edges ahead
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Stronger depth, fewer contradictions, more original implementation patterns.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </HiveLayout>
  );
}