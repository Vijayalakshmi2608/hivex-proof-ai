import { useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Crown, Calendar, Users, Award, Plus } from "lucide-react";

const CATEGORIES = ["All","Software","Hardware","AI","Embedded","Full-Stack"];

const SEED_COMPS = [
  { name: "BuildWithAI Hackathon 2025", deadline: "2025-06-12", entries: 248, sponsor: "Anthropic", prize: "$25,000", category: "AI" },
  { name: "EmbeddedCon Sprint", deadline: "2025-05-28", entries: 86, sponsor: "Espressif", prize: "$8,000", category: "Embedded" },
  { name: "FullStack Open Cup", deadline: "2025-06-30", entries: 412, sponsor: "Vercel", prize: "$15,000", category: "Full-Stack" },
];

const SEED_LEADER = [
  { name: "Aanya R.", project: "Edge-AI Drone Path Planner", score: 92, category: "AI" },
  { name: "Karan M.", project: "ESP32 Smart Greenhouse", score: 88, category: "Embedded" },
  { name: "Liam T.", project: "Realtime Chat w/ CRDT", score: 81, category: "Full-Stack" },
  { name: "Maya O.", project: "Solar IoT Logger", score: 79, category: "Hardware" },
  { name: "Sara K.", project: "Stripe Clone Dashboard", score: 64, category: "Software" },
];

export default function Competitions() {
  const [cat, setCat] = useState("All");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = cat === "All" ? SEED_LEADER : SEED_LEADER.filter((l) => l.category === cat);

  const certificate = (winner: { name: string; project: string; score: number }, comp: string) => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFillColor(15, 10, 35); doc.rect(0, 0, 297, 210, "F");
    doc.setDrawColor(168, 85, 247); doc.setLineWidth(2); doc.rect(10, 10, 277, 190);
    doc.setTextColor(168, 85, 247); doc.setFontSize(14); doc.text("HIVEX VERIFIED CERTIFICATE", 148, 30, { align: "center" });
    doc.setTextColor(255); doc.setFontSize(36); doc.text("Certificate of Achievement", 148, 70, { align: "center" });
    doc.setFontSize(14); doc.setTextColor(180); doc.text("This is to certify that", 148, 90, { align: "center" });
    doc.setTextColor(255); doc.setFontSize(28); doc.text(winner.name, 148, 110, { align: "center" });
    doc.setFontSize(13); doc.setTextColor(180); doc.text(`won ${comp} with the project`, 148, 125, { align: "center" });
    doc.setTextColor(34, 211, 238); doc.setFontSize(18); doc.text(`"${winner.project}"`, 148, 140, { align: "center" });
    doc.setTextColor(255); doc.setFontSize(48); doc.text(String(winner.score), 148, 170, { align: "center" });
    doc.setFontSize(10); doc.setTextColor(120); doc.text("HiveX Trust Score", 148, 178, { align: "center" });
    doc.text(`Issued ${new Date().toLocaleDateString()} · ⚡ hivex.ai`, 148, 195, { align: "center" });
    doc.save(`hivex-certificate-${winner.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  return (
    <HiveLayout>
      <section className="container py-12 max-w-6xl">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Hackathon Mode</div>
            <h1 className="font-display text-4xl font-bold mt-1">Compete. <span className="text-gradient">Get verified.</span></h1>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Create competition
          </Button>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6 grid md:grid-cols-3 gap-3">
            <Input placeholder="Competition name" className="bg-input/60 border-white/10" />
            <Input type="date" className="bg-input/60 border-white/10" />
            <Input placeholder="Prize pool" className="bg-input/60 border-white/10" />
            <Button onClick={() => setShowCreate(false)} className="md:col-span-3 bg-gradient-to-r from-primary to-secondary">Launch competition</Button>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {SEED_COMPS.map((c) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass rounded-2xl p-5 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="text-[10px] uppercase tracking-widest text-accent mb-1">{c.category}</div>
              <div className="font-display font-semibold text-lg">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 flex gap-3"><span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{c.deadline}</span><span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{c.entries}</span></div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-gradient">{c.prize}</span>
                <span className="text-[10px] text-muted-foreground">by {c.sponsor}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${cat === c ? "bg-primary/20 border-primary/40 text-primary-glow" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground flex justify-between">
            <span>Live leaderboard</span><span>Auto-ranked by HiveX Trust Score</span>
          </div>
          {filtered.map((row, i) => (
            <div key={row.name} className="grid grid-cols-12 items-center px-5 py-4 border-b border-white/5">
              <div className="col-span-1">{i === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> : <span className="font-mono text-muted-foreground">{i + 1}</span>}</div>
              <div className="col-span-6">
                <div className="font-semibold">{row.name}</div>
                <div className="text-xs text-muted-foreground">{row.project}</div>
              </div>
              <div className="col-span-2"><span className="text-[10px] px-2 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary">{row.category}</span></div>
              <div className="col-span-2 font-display text-2xl font-bold text-gradient">{row.score}</div>
              <div className="col-span-1 text-right">
                {i === 0 && <Button size="sm" variant="outline" className="glass border-white/10 h-7 text-xs" onClick={() => certificate(row, "BuildWithAI Hackathon 2025")}><Award className="w-3 h-3 mr-1" />Cert</Button>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </HiveLayout>
  );
}
