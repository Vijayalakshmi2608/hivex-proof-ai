import { useState } from "react";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

const tiers = [
  { name: "Builder", price: 0, yearly: 0, desc: "For solo builders proving themselves.", features: ["3 verifications / month","Public Skill Passport","Trust radar","Verified badge"] },
  { name: "Pro", price: 19, yearly: 190, desc: "Serious about your portfolio.", features: ["Unlimited verifications","AI viva follow-ups","PDF export","Skill gap analysis","Personal roadmap"], featured: true },
  { name: "Enterprise", price: 0, yearly: 0, desc: "For recruiters & hackathons.", features: ["Judge command center","Custom rubrics","Blind review","Batch CSV export","Hackathon mode","Priority AI"] },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <HiveLayout>
      <section className="container py-16 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Pricing</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Pay for <span className="text-gradient">trust</span>, not seats.</h1>
          <div className="mt-6 inline-flex items-center gap-3 glass px-4 py-2 rounded-full">
            <Label htmlFor="y" className="text-xs cursor-pointer">Monthly</Label>
            <Switch id="y" checked={yearly} onCheckedChange={setYearly} />
            <Label htmlFor="y" className="text-xs cursor-pointer">Yearly <span className="text-accent ml-1">−16%</span></Label>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`glass rounded-2xl p-6 flex flex-col ${t.featured ? "neon-border glow-purple" : ""}`}>
              {t.featured && <div className="text-[10px] uppercase tracking-widest text-primary-glow mb-2">Most popular</div>}
              <div className="font-display text-2xl font-bold">{t.name}</div>
              <div className="text-sm text-muted-foreground mb-4">{t.desc}</div>
              <div className="font-display text-5xl font-bold text-gradient">
                {t.name === "Enterprise" ? "Talk to us" : `$${yearly ? Math.round(t.yearly / 12) : t.price}`}
              </div>
              {t.name !== "Enterprise" && <div className="text-xs text-muted-foreground mb-6">/month{yearly && ", billed yearly"}</div>}
              <ul className="space-y-2 text-sm flex-1">
                {t.features.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />{f}</li>)}
              </ul>
              <Button className={`mt-6 w-full ${t.featured ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "glass border-white/10"}`} variant={t.featured ? "default" : "outline"}>
                {t.name === "Enterprise" ? "Contact sales" : "Get started"}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>
    </HiveLayout>
  );
}
