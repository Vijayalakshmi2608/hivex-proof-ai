import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Cpu, Code2, Sparkles, Eye, Brain, Trophy, Quote } from "lucide-react";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/hive/Particles";
import { Counter } from "@/components/hive/Counter";
import { loadSampleRun } from "@/lib/store";

const stats = [
  { v: 12400, suf: "+", l: "Projects verified" },
  { v: 3200, suf: "+", l: "Builders ranked" },
  { v: 94, suf: "%", l: "Recruiter satisfaction" },
  { v: 60, pre: "<", suf: "s", l: "To verify" },
];

const features = [
  { icon: Code2, title: "Software X-Ray", desc: "Walks code file by file. Spots templates, AI-generated patterns, and original logic." },
  { icon: Cpu, title: "Hardware Reality Meter", desc: "Photos → BOM, power budget, copy-paste detection." },
  { icon: Brain, title: "AI Viva Mode", desc: "Live interview that probes real understanding, not buzzword fluency." },
  { icon: ShieldCheck, title: "Trust Verdict", desc: "Verified · Review · Suspicious — multi-dimensional radar with reasoning." },
  { icon: Eye, title: "Contradiction Engine", desc: "Catches inconsistent answers across the session in realtime." },
  { icon: Trophy, title: "Judge & Hackathon", desc: "Rank, compare, blind review, certificate generation." },
];

const testimonials = [
  { q: "We screened 400 hackathon submissions in a weekend instead of 3 weeks.", a: "Priya N.", r: "Lead, TechStars India" },
  { q: "Caught two AI-generated portfolios in our first batch. Saved us a bad hire.", a: "Marcus L.", r: "Recruiting, Anthropic-stage startup" },
  { q: "The radar chart finally lets builders prove the depth resumes can't show.", a: "Devon K.", r: "Senior Eng, Cloudflare" },
];

const steps = [
  { n: "01", t: "Drop a project", d: "GitHub URL or hardware photo + description." },
  { n: "02", t: "AI X-Rays it", d: "Tech stack, code quality, originality, AI-gen detection." },
  { n: "03", t: "Sit a 4-question viva", d: "Live AI interview adapts to your depth." },
  { n: "04", t: "Get a Trust Verdict", d: "Score, radar, badge — shareable, recruiter-ready." },
];

const Index = () => {
  return (
    <HiveLayout>
      <section className="container pt-20 pb-32 relative">
        <div className="absolute inset-0 -z-10"><Particles /></div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">The trust layer for engineering talent</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Don't just build.<br /><span className="text-gradient">Prove it.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            HiveX verifies, ranks and predicts engineering talent by analyzing real software and hardware projects — and asking the questions a senior engineer would.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary via-primary-glow to-secondary text-primary-foreground font-semibold h-12 px-7 glow-purple hover:opacity-90">
              <Link to="/dashboard">Start verification <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button onClick={() => { loadSampleRun(); window.location.href = "/results"; }} size="lg" variant="outline" className="h-12 px-7 glass border-white/10 hover:bg-white/5">
              See sample verified project
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-20 max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-6 md:p-8 neon-border relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3 font-mono text-xs">
                <div className="text-muted-foreground">$ hivex analyze github.com/dev/iot-tracker</div>
                <div className="text-accent">› Cloning + parsing repo…</div>
                <div className="text-accent">› 47 files scanned · 6 flagged</div>
                <div className="text-secondary">› "Strong logic in mqtt_handler.py"</div>
                <div className="text-yellow-400">› "routes/auth.js looks like template code"</div>
                <div className="text-destructive">› AI-gen likelihood: 14% — looks human</div>
                <div className="text-primary">› Asking 4 verification questions…</div>
                <div className="text-foreground/80">› <span className="animate-blink">▍</span></div>
              </div>
              <div className="flex flex-col items-center justify-center glass-strong rounded-xl p-6">
                <div className="text-xs text-muted-foreground mb-2">HiveX Score</div>
                <div className="text-6xl font-display font-bold text-gradient">87</div>
                <div className="mt-2 text-xs px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30">🟢 Verified Builder</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                <Counter to={s.v} prefix={s.pre} suffix={s.suf} />
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-32">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            How it works.<br /><span className="text-gradient">Sixty seconds. Zero buzzwords.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 relative">
              <div className="font-mono text-xs text-accent mb-3">{s.n}</div>
              <div className="font-display font-semibold text-lg mb-1">{s.t}</div>
              <div className="text-sm text-muted-foreground">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-32">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Hiring tools showcase resumes.<br /><span className="text-gradient">HiveX showcases truth.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:border-primary/40 transition-all group hover:-translate-y-1 duration-300">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-primary-glow" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-32">
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6">
              <Quote className="w-6 h-6 text-primary-glow mb-3 opacity-50" />
              <p className="text-sm leading-relaxed mb-4">"{t.q}"</p>
              <div className="text-xs">
                <div className="font-semibold">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="glass rounded-3xl p-10 md:p-16 text-center neon-border relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
          <h2 className="relative font-display text-4xl md:text-5xl font-bold tracking-tight">
            Ready to <span className="text-gradient">prove it</span>?
          </h2>
          <p className="relative text-muted-foreground mt-3 max-w-xl mx-auto">Get a HiveX Trust Verdict on your real project in under a minute.</p>
          <Button asChild size="lg" className="relative mt-8 bg-gradient-to-r from-primary via-primary-glow to-secondary text-primary-foreground font-semibold h-12 px-8 glow-purple">
            <Link to="/dashboard">Verify my project <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        ⚡ HiveX AI · Built for builders who can prove it.
      </footer>
    </HiveLayout>
  );
};

export default Index;
