import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiveLayout } from "@/components/HiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Github, Cpu, Upload, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveRun } from "@/lib/store";
import { toast } from "sonner";

export default function Dashboard() {
  const nav = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [imgB64, setImgB64] = useState<string>("");
  const [imgPreview, setImgPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      setImgB64(s);
      setImgPreview(s);
    };
    r.readAsDataURL(f);
  };

  const analyze = async (mode: "software" | "hardware") => {
    if (mode === "software" && !repoUrl.trim()) return toast.error("Paste a GitHub repo URL");
    if (mode === "hardware" && !desc.trim()) return toast.error("Describe your build");
    setLoading(true);
    try {
      const action = mode === "software" ? "analyze_software" : "analyze_hardware";
      const payload = mode === "software"
        ? { repoUrl }
        : { description: desc, imageBase64: imgB64 };
      const { data, error } = await supabase.functions.invoke("hivex-ai", {
        body: { action, payload },
      });
      if (error) throw error;
      if (!data?.data) throw new Error("No analysis");
      saveRun({
        mode,
        input: { repoUrl, description: desc, imageBase64: imgB64 },
        analysis: data.data,
      });
      nav("/analysis");
    } catch (e: any) {
      toast.error(e.message ?? "Analysis failed");
    } finally {
      setLoading(false);
    }
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
        </motion.div>

        <div className="mt-10 glass rounded-2xl p-6 md:p-8">
          <Tabs defaultValue="software">
            <TabsList className="grid grid-cols-2 mb-6 bg-muted/30">
              <TabsTrigger value="software" className="data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">
                <Github className="w-4 h-4 mr-2" /> Software
              </TabsTrigger>
              <TabsTrigger value="hardware" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-foreground">
                <Cpu className="w-4 h-4 mr-2" /> Hardware
              </TabsTrigger>
            </TabsList>

            <TabsContent value="software" className="space-y-4">
              <label className="text-sm font-medium">GitHub repository URL</label>
              <Input
                placeholder="https://github.com/your-name/your-project"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="bg-input/60 border-white/10 h-12 font-mono text-sm"
              />
              <Button
                onClick={() => analyze("software")}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold glow-purple"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Analyze project
              </Button>
            </TabsContent>

            <TabsContent value="hardware" className="space-y-4">
              <label className="text-sm font-medium">Describe what you built</label>
              <Textarea
                placeholder="e.g. ESP32-based plant moisture sensor with OLED + Wi-Fi alerts…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="bg-input/60 border-white/10 min-h-[120px]"
              />
              <label className="text-sm font-medium block">Photo of your build (optional)</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-primary/40 transition cursor-pointer">
                <input
                  id="hwfile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
                <label htmlFor="hwfile" className="cursor-pointer flex flex-col items-center gap-2">
                  {imgPreview ? (
                    <img src={imgPreview} className="max-h-48 rounded-lg" alt="preview" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Click to upload an image</div>
                    </>
                  )}
                </label>
              </div>
              <Button
                onClick={() => analyze("hardware")}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-secondary to-accent text-secondary-foreground font-semibold glow-cyan"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Analyze build
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </HiveLayout>
  );
}