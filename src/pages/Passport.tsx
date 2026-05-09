import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { loadRun, SAMPLE_RUN } from "@/lib/store";
import { Award, Sparkles, TrendingUp, Hexagon, Copy, Eye, EyeOff, Share2, Check } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { TrustRadar } from "@/components/hive/TrustRadar";
import { VerifiedBadge } from "@/components/hive/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const growth = [
  { w: "W1", s: 42 }, { w: "W2", s: 51 }, { w: "W3", s: 58 },
  { w: "W4", s: 67 }, { w: "W5", s: 74 }, { w: "W6", s: 81 },
];

export default function Passport() {
  const { username } = useParams();
  // Public passport route falls back to sample. Authenticated user passport uses session run.
  const run = username ? SAMPLE_RUN : (loadRun() ?? SAMPLE_RUN);
  const score = run?.result?.final_score ?? 81;
  const depth = run?.result?.depth_level ?? "Intermediate";
  const trust = run?.result?.trust ?? "verified";
  const radar = run?.result?.radar ?? { depth: 80, originality: 70, communication: 75, execution: 78, innovation: 72 };
  const handle = username ?? run.username ?? "demo-builder";
  const [recruiterView, setRecruiterView] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/passport/${handle}`;
  const embed = `<iframe src="${url}?embed=1" width="320" height="420" style="border:0;border-radius:16px"></iframe>`;

  const projects = [
    run?.analysis ? { name: run.mode === "software" ? run.analysis.purpose : run.analysis.project_type, score, depth } : null,
    { name: "Smart Plant Monitor (ESP32)", score: 78, depth: "Deep" },
    { name: "Realtime Drawing App", score: 71, depth: "Intermediate" },
  ].filter(Boolean) as { name: string; score: number; depth: string }[];

  const tags: string[] = run?.analysis?.domain_tags ?? run?.result?.domain_tags ?? ["Robotics","Computer Vision","Embedded"];

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text); setCopied(true); toast.success(`${label} copied`); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <HiveLayout>
      <section className="container py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="text-xs text-muted-foreground font-mono">hivex.ai/passport/{handle}</div>
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
            {recruiterView ? <EyeOff className="w-4 h-4 text-accent" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            <Label htmlFor="rv" className="text-xs cursor-pointer">Recruiter view</Label>
            <Switch id="rv" checked={recruiterView} onCheckedChange={setRecruiterView} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-purple">
              <Hexagon className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Skill Passport</div>
              <div className="font-display text-3xl font-bold mt-1">@{handle}</div>
              <div className="text-sm text-muted-foreground">Shareable proof of what you actually built.</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent">#{t}</span>)}
              </div>
            </div>
            {!recruiterView ? (
              <div className="text-right">
                <div className="font-display text-6xl font-bold text-gradient">{score}</div>
                <div className="text-xs text-muted-foreground">{depth} · {trust}</div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Status</div>
                <div className="text-2xl font-display font-bold text-accent">🟢 Verified</div>
                <div className="text-xs text-muted-foreground">Trust indicators only</div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5 mt-6">
          <div className="lg:col-span-2 space-y-5">
            {!recruiterView && (
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
            )}

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3">Trust radar</h3>
              <TrustRadar data={radar} />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3">Verified projects</h3>
              <div className="space-y-2">
                {projects.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.depth}</div>
                    </div>
                    {!recruiterView ? (
                      <div className="font-display text-2xl font-bold text-gradient">{p.score}</div>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-accent/10 border border-accent/30 text-accent">Verified</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3">Badges</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {["Verified","Deep Diver","Original","HW Hacker","Logic Master","Streak 6"].map((b) => (
                  <div key={b} className="aspect-square rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 border border-white/10 flex flex-col items-center justify-center text-center p-2">
                    <Award className="w-6 h-6 text-primary-glow mb-1" />
                    <div className="text-[10px] font-medium">{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass rounded-2xl p-2">
              <VerifiedBadge name={`@${handle}`} score={score} depth={depth} trust={trust} id={handle} />
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Scan to verify</div>
              <div className="bg-white p-3 rounded-lg inline-block">
                <QRCodeSVG value={url} size={140} />
              </div>
            </div>
            <div className="glass rounded-2xl p-5 space-y-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Share</div>
              <Button variant="outline" className="w-full glass border-white/10 justify-between" onClick={() => copy(url, "Link")}>
                <span className="truncate text-xs font-mono">{url}</span>
                {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" className="w-full glass border-white/10 justify-between" onClick={() => copy(embed, "Embed code")}>
                <span className="text-xs">Embed widget</span>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full glass border-white/10" onClick={() => toast.success("Verification request sent")}>
                Request new verification
              </Button>
            </div>
          </div>
        </div>
      </section>
    </HiveLayout>
  );
}
