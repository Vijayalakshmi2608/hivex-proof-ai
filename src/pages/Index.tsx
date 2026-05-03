import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Cpu, Code2, Sparkles, Eye, Brain, Trophy } from "lucide-react";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";

const stats = [
  { v: "98%", l: "Fraud caught" },
  { v: "<60s", l: "To verify" },
  { v: "12k+", l: "Projects ranked" },
  { v: "0", l: "Resumes needed" },
];

const features = [
  { icon: Code2, title: "Software X-Ray", desc: "Goes file by file. Spots templates vs original logic." },
  { icon: Cpu, title: "Hardware Reality Meter", desc: "From photos: real builds or borrowed renders?" },
  { icon: Brain, title: "AI Viva Mode", desc: "Live interview that probes real understanding." },
  { icon: ShieldCheck, title: "Trust Verdict", desc: "Verified · Review · Suspicious — with reasoning." },
  { icon: Eye, title: "Contradiction Engine", desc: "Catches inconsistent answers across the session." },
  { icon: Trophy, title: "Judge Mode", desc: "Rank candidates by depth, not by buzzwords." },
];

const Index = () => {
  return (
    <HiveLayout>
      <section className="container pt-24 pb-32 relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">The trust layer for engineering talent</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Don't just build.
            <br />
            <span className="text-gradient">Prove it.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            HiveX verifies, ranks and predicts engineering talent by analyzing real software and hardware projects — and then asking the questions a senior engineer would.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary via-primary-glow to-secondary text-primary-foreground font-semibold h-12 px-7 glow-purple hover:opacity-90">
              <Link to="/dashboard">
                Start verification <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 glass border-white/10 hover:bg-white/5">
              <Link to="/judge">See Judge Mode</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 md:p-8 neon-border relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3 font-mono text-xs">
                <div className="text-muted-foreground">$ hivex analyze github.com/dev/iot-tracker</div>
                <div className="text-accent">› Cloning + parsing repo…</div>
                <div className="text-accent">› 47 files scanned · 6 flagged</div>
                <div className="text-secondary">› “Strong logic in mqtt_handler.py”</div>
                <div className="text-yellow-400">› “routes/auth.js looks like template code”</div>
                <div className="text-primary">› Asking 4 verification questions…</div>
                <div className="text-foreground/80">› <span className="animate-blink">▍</span></div>
              </div>
              <div className="flex flex-col items-center justify-center glass-strong rounded-xl p-6">
                <div className="text-xs text-muted-foreground mb-2">HiveX Score</div>
                <div className="text-6xl font-display font-bold text-gradient">87</div>
                <div className="mt-2 text-xs px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30">
                  🟢 Verified Builder
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-6 text-center"
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-32">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Hiring tools showcase resumes.
            <br />
            <span className="text-gradient">HiveX showcases truth.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:border-primary/40 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-primary-glow" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        ⚡ HiveX AI · Built for builders who can prove it.
      </footer>
    </HiveLayout>
  );
};

export default Index;
