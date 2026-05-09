import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { loadRun } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { Trophy, Crown, ArrowRightLeft, Check, ShieldCheck, ShieldAlert, ShieldX, Download, EyeOff, Eye, FileDown, Brain, Loader2 } from "lucide-react";
import { TrustRadar } from "@/components/hive/TrustRadar";
import { toast } from "sonner";

const SEED = [
  { name: "Aanya R.", project: "Edge-AI Drone Path Planner", score: 92, conf: 95, depth: "Deep", trust: "verified", radar: { depth: 92, originality: 88, communication: 86, execution: 91, innovation: 89 } },
  { name: "Karan M.", project: "ESP32 Smart Greenhouse", score: 88, conf: 91, depth: "Deep", trust: "verified", radar: { depth: 88, originality: 80, communication: 85, execution: 87, innovation: 79 } },
  { name: "Liam T.", project: "Realtime Chat w/ CRDT", score: 81, conf: 84, depth: "Intermediate", trust: "verified", radar: { depth: 80, originality: 78, communication: 82, execution: 80, innovation: 76 } },
  { name: "Sara K.", project: "Stripe Clone Dashboard", score: 64, conf: 58, depth: "Surface", trust: "review", radar: { depth: 60, originality: 50, communication: 70, execution: 65, innovation: 55 } },
  { name: "Devon P.", project: "AI Resume Builder", score: 41, conf: 32, depth: "Surface", trust: "suspicious", radar: { depth: 38, originality: 25, communication: 55, execution: 42, innovation: 40 } },
];

const trustStyle = (t: string) => {
  if (t === "verified") return { Icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10 border-accent/30", label: "Verified" };
  if (t === "review") return { Icon: ShieldAlert, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", label: "Review" };
  return { Icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", label: "Suspicious" };
};

const initialWeights = { depth: 25, originality: 20, communication: 15, execution: 25, innovation: 15 };

export default function Judge() {
  const run = loadRun();
  const base = useMemo(() => [
    ...(run?.result ? [{
      name: "You", project: run.mode === "software" ? run.analysis?.purpose ?? "Your project" : run.analysis?.project_type ?? "Your build",
      score: run.result.final_score, conf: run.result.confidence_score, depth: run.result.depth_level, trust: run.result.trust,
      radar: run.result.radar ?? { depth: 70, originality: 70, communication: 70, execution: 70, innovation: 70 },
    }] : []),
    ...SEED,
  ], [run]);

  const [weights, setWeights] = useState(initialWeights);
  const [blind, setBlind] = useState(false);
  const [pickA, setPickA] = useState<number | null>(null);
  const [pickB, setPickB] = useState<number | null>(null);
  const [shortlist, setShortlist] = useState<Set<number>>(new Set());
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const totalW = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const list = [...base].map((c, i) => ({
    ...c, idx: i,
    customScore: Math.round(((c.radar.depth * weights.depth + c.radar.originality * weights.originality + c.radar.communication * weights.communication + c.radar.execution * weights.execution + c.radar.innovation * weights.innovation) / totalW)),
  })).sort((a, b) => b.customScore - a.customScore);

  const a = pickA != null ? list.find((x) => x.idx === pickA) : null;
  const b = pickB != null ? list.find((x) => x.idx === pickB) : null;

  const toggleShortlist = (i: number) => {
    setShortlist((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const exportCsv = () => {
    const rows = [["Rank","Name","Project","HiveX","Custom","Confidence","Trust","Depth"], ...list.map((c, i) => [
      i + 1, blind ? `Anon-${c.idx + 1}` : c.name, blind ? "—" : c.project, c.score, c.customScore, c.conf + "%", c.trust, c.depth,
    ])];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const lnk = document.createElement("a"); lnk.href = url; lnk.download = "hivex-leaderboard.csv"; lnk.click();
  };

  const exportPdf = (c: typeof list[0]) => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("HiveX AI · Candidate Report", 14, 20);
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text(new Date().toLocaleString(), 14, 28);
    doc.setTextColor(0); doc.setFontSize(14);
    doc.text(blind ? `Candidate: Anon-${c.idx + 1}` : c.name, 14, 44);
    doc.setFontSize(11); doc.text(blind ? "Project: hidden (blind mode)" : `Project: ${c.project}`, 14, 52);
    doc.setFontSize(28); doc.text(`HiveX Score: ${c.score}`, 14, 70);
    doc.setFontSize(20); doc.text(`Custom Score: ${c.customScore}`, 14, 84);
    doc.setFontSize(11);
    doc.text(`Confidence: ${c.conf}%`, 14, 96);
    doc.text(`Depth: ${c.depth}`, 14, 104);
    doc.text(`Trust: ${c.trust}`, 14, 112);
    doc.text("Radar (0-100):", 14, 128);
    let y = 138;
    Object.entries(c.radar).forEach(([k, v]) => { doc.text(`  ${k}: ${v}`, 14, y); y += 8; });
    doc.text("Weights applied:", 14, y + 4); y += 14;
    Object.entries(weights).forEach(([k, v]) => { doc.text(`  ${k}: ${v}%`, 14, y); y += 8; });
    doc.setTextColor(150);
    doc.text("⚡ Generated by HiveX AI · hivex.ai", 14, 285);
    doc.save(`hivex-${(blind ? `anon-${c.idx + 1}` : c.name).replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const summarize = async () => {
    setLoadingSummary(true);
    try {
      const { data } = await supabase.functions.invoke("hivex-ai", { body: { action: "judge_summary", payload: { candidates: list.map(({ idx, ...c }) => c) } } });
      setAiSummary(data?.data ?? null);
    } catch { toast.error("Summary failed"); } finally { setLoadingSummary(false); }
  };

  return (
    <HiveLayout>
      <section className="container py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-6 mb-6 flex-wrap">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Judge / Recruiter Command Center</div>
            <h1 className="font-display text-4xl font-bold mt-1">Rank by <span className="text-gradient">depth</span>, not buzzwords.</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
              {blind ? <EyeOff className="w-4 h-4 text-accent" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              <Label htmlFor="blind" className="text-xs cursor-pointer">Blind review</Label>
              <Switch id="blind" checked={blind} onCheckedChange={setBlind} />
            </div>
            <Button onClick={exportCsv} variant="outline" className="glass border-white/10"><Download className="w-4 h-4 mr-2" />CSV</Button>
            <Button onClick={summarize} disabled={loadingSummary} variant="outline" className="glass border-white/10">
              {loadingSummary ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}AI Summary
            </Button>
          </div>
        </motion.div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-display font-semibold text-lg mb-1">Custom rubric</h3>
          <p className="text-xs text-muted-foreground mb-4">Adjust weights — leaderboard re-ranks live.</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(Object.keys(weights) as (keyof typeof weights)[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between text-xs mb-2"><span className="capitalize text-muted-foreground">{k}</span><span className="font-mono text-accent">{weights[k]}%</span></div>
                <Slider value={[weights[k]]} max={50} step={1} onValueChange={(v) => setWeights({ ...weights, [k]: v[0] })} />
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Total weight: {totalW}% · Custom score = weighted radar avg</div>
        </div>

        {aiSummary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 border border-primary/20">
            <div className="text-xs uppercase tracking-wider text-primary-glow mb-2">AI head judge summary</div>
            <div className="text-sm font-semibold mb-1">Winner: {aiSummary.winner}</div>
            <p className="text-sm text-muted-foreground">{aiSummary.rationale}</p>
            {aiSummary.risk_notes?.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-yellow-400/80">
                {aiSummary.risk_notes.map((n: string, i: number) => <li key={i}>⚠ {n}</li>)}
              </ul>
            )}
          </motion.div>
        )}

        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-white/5">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Builder</div>
            <div className="col-span-1 text-right">HiveX</div>
            <div className="col-span-2 text-right">Custom</div>
            <div className="col-span-1 text-right">Conf</div>
            <div className="col-span-1">Trust</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          {list.map((row, i) => {
            const ts = trustStyle(row.trust);
            return (
              <motion.div key={row.name + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`grid grid-cols-12 items-center px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] ${shortlist.has(row.idx) ? "bg-accent/5" : ""}`}>
                <div className="col-span-1">
                  {i === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> : i < 3 ? <Trophy className="w-4 h-4 text-secondary" /> : <span className="text-muted-foreground font-mono">{i + 1}</span>}
                </div>
                <div className="col-span-3">
                  <div className="font-semibold">{blind ? `Anon-${row.idx + 1}` : row.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{blind ? "—" : row.project}</div>
                </div>
                <div className="col-span-1 text-right font-mono text-sm">{row.score}</div>
                <div className="col-span-2 text-right font-display text-2xl font-bold text-gradient">{row.customScore}</div>
                <div className="col-span-1 text-right font-mono text-sm">{row.conf}%</div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border ${ts.bg} ${ts.color}`}>
                    <ts.Icon className="w-3 h-3" />{ts.label}
                  </span>
                </div>
                <div className="col-span-3 flex justify-end gap-1">
                  <Button size="sm" variant={pickA === row.idx ? "default" : "outline"} className="h-7 px-2 text-xs glass border-white/10" onClick={() => setPickA(row.idx)}>A</Button>
                  <Button size="sm" variant={pickB === row.idx ? "default" : "outline"} className="h-7 px-2 text-xs glass border-white/10" onClick={() => setPickB(row.idx)}>B</Button>
                  <Button size="sm" variant={shortlist.has(row.idx) ? "default" : "outline"} className="h-7 px-2 text-xs glass border-white/10" onClick={() => toggleShortlist(row.idx)}>★</Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs glass border-white/10" onClick={() => exportPdf(row)}><FileDown className="w-3 h-3" /></Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {a && b && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><ArrowRightLeft className="w-4 h-4" />Side-by-side comparison</div>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {[a, b].map((x, idx) => (
                <div key={idx} className={idx === 1 ? "md:order-3" : ""}>
                  <div className="text-sm text-muted-foreground">{idx === 0 ? "Candidate A" : "Candidate B"}</div>
                  <div className="font-display text-2xl font-bold mt-1">{blind ? `Anon-${x.idx + 1}` : x.name}</div>
                  <div className="text-xs text-muted-foreground">{blind ? "—" : x.project}</div>
                  <div className="font-display text-5xl font-bold text-gradient mt-3">{x.customScore}</div>
                  <div className="text-xs">HiveX {x.score} · Conf {x.conf}% · {x.depth}</div>
                  <div className="mt-3"><TrustRadar data={x.radar} size={200} /></div>
                </div>
              ))}
              <div className="md:order-2 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Verdict</div>
                <div className="font-display text-xl mt-2 flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-accent" />{a.customScore >= b.customScore ? (blind ? `Anon-${a.idx + 1}` : a.name) : (blind ? `Anon-${b.idx + 1}` : b.name)} edges ahead
                </div>
                <p className="text-xs text-muted-foreground mt-2">Δ {Math.abs(a.customScore - b.customScore)} pts on weighted radar.</p>
              </div>
            </div>
          </motion.div>
        )}

        {shortlist.size > 0 && (
          <div className="mt-6 glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-accent mb-2">Shortlist ({shortlist.size})</div>
            <div className="flex flex-wrap gap-2">
              {[...shortlist].map((i) => {
                const c = base[i];
                return <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent">{blind ? `Anon-${i + 1}` : c.name}</span>;
              })}
            </div>
          </div>
        )}
      </section>
    </HiveLayout>
  );
}
