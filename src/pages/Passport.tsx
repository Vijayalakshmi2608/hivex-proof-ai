import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { loadRun } from "@/lib/store";
import { Award, Sparkles, TrendingUp, Hexagon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const growth = [
  { w: "W1", s: 42 }, { w: "W2", s: 51 }, { w: "W3", s: 58 },
  { w: "W4", s: 67 }, { w: "W5", s: 74 }, { w: "W6", s: 81 },
];

export default function Passport() {
  const run = loadRun();
  const score = run?.result?.final_score ?? 81;
  const depth = run?.result?.depth_level ?? "Intermediate";
  const trust = run?.result?.trust ?? "verified";
  const projects = [
    run?.analysis ? { name: run.mode === "software" ? run.analysis.purpose : run.analysis.project_type, score, depth } : null,
    { name: "Smart Plant Monitor (ESP32)", score: 78, depth: "Deep" },
    { name: "Realtime Drawing App", score: 71, depth: "Intermediate" },
  ].filter(Boolean) as { name: string; score: number; depth: string }[];

  return (
    <HiveLayout>
      <section className="container py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-purple">
              <Hexagon className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Skill Passport</div>
              <div className="font-display text-3xl font-bold mt-1">Your HiveX profile</div>
              <div className="text-sm text-muted-foreground">Shareable proof of what you actually built.</div>
            </div>
            <div className="text-right">
              <div className="font-display text-6xl font-bold text-gradient">{score}</div>
              <div className="text-xs text-muted-foreground">{depth} · {trust}</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-lg">Skill growth</h3>
              <span className="inline-flex items-center gap-1 text-xs text-accent"><TrendingUp className="w-3.5 h-3.5" /> +14 this month</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={growth}>
                  <XAxis dataKey="w" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="s" stroke="hsl(var(--primary-glow))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-sm text-muted-foreground flex gap-2">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              At current pace, you'll reach <span className="text-foreground">Advanced</span> in ~2 months.
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-lg mb-3">Badges</h3>
            <div className="grid grid-cols-3 gap-3">
              {["Verified", "Deep Diver", "Original", "Hardware Hacker", "Logic Master", "Streak 6"].map((b) => (
                <div key={b} className="aspect-square rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 border border-white/10 flex flex-col items-center justify-center text-center p-2">
                  <Award className="w-6 h-6 text-primary-glow mb-1" />
                  <div className="text-[10px] font-medium">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mt-6">
          <h3 className="font-display font-semibold text-lg mb-4">Verified projects</h3>
          <div className="space-y-2">
            {projects.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.depth}</div>
                </div>
                <div className="font-display text-2xl font-bold text-gradient">{p.score}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </HiveLayout>
  );
}