import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Github, Cpu, Upload, Loader2, Sparkles, X, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveRun, loadSampleRun } from "@/lib/store";
import { toast } from "sonner";

export default function Dashboard() {
  const nav = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 4 - images.length).forEach((f) => {
      const r = new FileReader();
      r.onload = () => setImages((prev) => [...prev, r.result as string]);
      r.readAsDataURL(f);
    });
  };

  const analyze = async (mode: "software" | "hardware") => {
    if (mode === "software" && !repoUrl.trim()) return toast.error("Paste a GitHub repo URL");
    if (mode === "hardware" && !desc.trim()) return toast.error("Describe your build");
    setLoading(true);
    setProgress(mode === "software" ? "Cloning + parsing repo…" : "Analyzing components…");
    try {
      const action = mode === "software" ? "analyze_software" : "analyze_hardware";
      const payload = mode === "software" ? { repoUrl } : { description: desc, images };
      const { data, error } = await supabase.functions.invoke("hivex-ai", { body: { action, payload } });
      if (error) throw error;
      if (!data?.data) throw new Error("No analysis returned");
      saveRun({ mode, input: { repoUrl, description: desc, images, imageBase64: images[0] }, analysis: data.data });
      nav("/analysis");
    } catch (e: any) {
      toast.error(e.message ?? "Analysis failed");
    } finally { setLoading(false); setProgress(""); }
  };

  return (
    <HiveLayout>
      <section className="container py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full glass mb-4">
            <Sparkles className="w-3 h-3 text-accent" /> Step 1 of 3
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Submit your project for <span className="text-gradient">verification</span>
          </h1>
          <p className="text-muted-foreground mt-3">HiveX will inspect, then interview, then score.</p>
          <button onClick={() => { loadSampleRun(); nav("/results"); }}
            className="mt-3 text-xs text-accent inline-flex items-center gap-1 hover:underline">
            <Wand2 className="w-3 h-3" /> Or load a sample verified project for instant demo
          </button>
        </motion.div>

        <div className="mt-8 glass rounded-2xl p-6 md:p-8">
          <Tabs defaultValue="software">
            <TabsList className="grid grid-cols-2 mb-6 bg-muted/30">
              <TabsTrigger value="software"><Github className="w-4 h-4 mr-2" />Software</TabsTrigger>
              <TabsTrigger value="hardware"><Cpu className="w-4 h-4 mr-2" />Hardware</TabsTrigger>
            </TabsList>
            <TabsContent value="software" className="space-y-4">
              <label className="text-sm text-muted-foreground">GitHub repository URL</label>
              <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/project" className="bg-input/60 border-white/10 h-12" />
              <Button onClick={() => analyze("software")} disabled={loading} className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold glow-purple">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{progress}</> : "Analyze with HiveX AI"}
              </Button>
            </TabsContent>
            <TabsContent value="hardware" className="space-y-4">
              <label className="text-sm text-muted-foreground">Describe your build</label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="ESP32 greenhouse monitor with soil moisture, DHT22, OLED, MQTT to home server…" className="bg-input/60 border-white/10 min-h-[110px]" />
              <label className="text-sm text-muted-foreground">Upload up to 4 photos (board, schematic, build)</label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                  </label>
                )}
              </div>
              <Button onClick={() => analyze("hardware")} disabled={loading} className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold glow-purple">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{progress}</> : "Analyze with HiveX AI"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </HiveLayout>
  );
}
