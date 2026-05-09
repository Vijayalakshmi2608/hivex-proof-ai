import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Action =
  | "analyze_software"
  | "analyze_hardware"
  | "generate_questions"
  | "evaluate"
  | "interview_followup"
  | "improve"
  | "demo_script"
  | "skill_gap"
  | "roadmap"
  | "judge_summary";

async function callAI(body: Record<string, unknown>) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", ...body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Response(JSON.stringify({ error: text, status: res.status }), {
      status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return res.json();
}

function extractToolArgs(data: any) {
  const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (tc?.function?.arguments) { try { return JSON.parse(tc.function.arguments); } catch {} }
  const content = data?.choices?.[0]?.message?.content;
  if (content) { try { return JSON.parse(content); } catch {} }
  return null;
}

const schemas: Record<string, any> = {
  software_analysis: {
    name: "software_analysis",
    parameters: {
      type: "object",
      properties: {
        purpose: { type: "string" },
        tech_stack: { type: "array", items: { type: "string" } },
        features: { type: "array", items: { type: "string" } },
        complexity: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
        weaknesses: { type: "array", items: { type: "string" } },
        code_xray: {
          type: "array",
          items: {
            type: "object",
            properties: {
              file: { type: "string" },
              note: { type: "string" },
              quality: { type: "string", enum: ["strong", "average", "template"] },
            },
            required: ["file", "note", "quality"],
          },
        },
        originality_signal: { type: "string", enum: ["original", "mixed", "template"] },
        ai_generated_likelihood: { type: "number", description: "0-100, likelihood code is AI-generated" },
        commit_pattern: { type: "string", description: "Short description of commit cadence + collaboration pattern" },
        ast_complexity_score: { type: "number", description: "0-100 estimated cyclomatic complexity score" },
        dependency_risks: { type: "array", items: { type: "string" } },
        domain_tags: { type: "array", items: { type: "string" } },
      },
      required: ["purpose","tech_stack","features","complexity","weaknesses","code_xray","originality_signal","ai_generated_likelihood","commit_pattern","ast_complexity_score","dependency_risks","domain_tags"],
    },
  },
  hardware_analysis: {
    name: "hardware_analysis",
    parameters: {
      type: "object",
      properties: {
        project_type: { type: "string" },
        components: { type: "array", items: { type: "string" } },
        bom: {
          type: "array",
          items: {
            type: "object",
            properties: {
              part: { type: "string" },
              qty: { type: "number" },
              est_cost_usd: { type: "number" },
              notes: { type: "string" },
            },
            required: ["part","qty","est_cost_usd","notes"],
          },
        },
        power_budget_watts: { type: "number" },
        build_explanation: { type: "string" },
        complexity: { type: "string", enum: ["Beginner","Intermediate","Advanced","Expert"] },
        realism_check: { type: "number" },
        weaknesses: { type: "array", items: { type: "string" } },
        copy_paste_likelihood: { type: "number", description: "0-100 likelihood it's a copied tutorial build" },
        domain_tags: { type: "array", items: { type: "string" } },
      },
      required: ["project_type","components","bom","power_budget_watts","build_explanation","complexity","realism_check","weaknesses","copy_paste_likelihood","domain_tags"],
    },
  },
  questions: {
    name: "questions",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: { q: { type: "string" }, probes: { type: "string" } },
            required: ["q","probes"],
          },
        },
      },
      required: ["questions"],
    },
  },
  evaluation: {
    name: "evaluation",
    parameters: {
      type: "object",
      properties: {
        final_score: { type: "number" },
        confidence_score: { type: "number" },
        depth_level: { type: "string", enum: ["Surface","Intermediate","Deep","Expert"] },
        trust: { type: "string", enum: ["verified","review","suspicious"] },
        trust_reason: { type: "string" },
        skill_breakdown: {
          type: "object",
          properties: {
            logic: { type: "number" }, backend: { type: "number" },
            hardware: { type: "number" }, problem_solving: { type: "number" },
          },
          required: ["logic","backend","hardware","problem_solving"],
        },
        radar: {
          type: "object",
          description: "Five-dimensional trust radar 0-100",
          properties: {
            depth: { type: "number" },
            originality: { type: "number" },
            communication: { type: "number" },
            execution: { type: "number" },
            innovation: { type: "number" },
          },
          required: ["depth","originality","communication","execution","innovation"],
        },
        red_flags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["plagiarism","ai_generated","shallow","contradiction","template"] },
              severity: { type: "string", enum: ["low","medium","high"] },
              detail: { type: "string" },
            },
            required: ["kind","severity","detail"],
          },
        },
        percentile: { type: "number", description: "estimated global percentile 0-100" },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        contradictions: { type: "array", items: { type: "string" } },
        reality_check: { type: "string" },
        future_prediction: { type: "string" },
        domain_tags: { type: "array", items: { type: "string" } },
      },
      required: ["final_score","confidence_score","depth_level","trust","trust_reason","skill_breakdown","radar","red_flags","percentile","strengths","weaknesses","contradictions","reality_check","future_prediction","domain_tags"],
    },
  },
  improve: {
    name: "improvements",
    parameters: { type: "object", properties: { suggestions: { type: "array", items: { type: "string" } } }, required: ["suggestions"] },
  },
  demo: {
    name: "demo_script",
    parameters: {
      type: "object",
      properties: { pitch: { type: "string" }, talking_points: { type: "array", items: { type: "string" } } },
      required: ["pitch","talking_points"],
    },
  },
  skill_gap: {
    name: "skill_gap",
    parameters: {
      type: "object",
      properties: {
        match_percent: { type: "number" },
        matched: { type: "array", items: { type: "string" } },
        missing: { type: "array", items: { type: "string" } },
        recommended_projects: { type: "array", items: { type: "string" } },
        verdict: { type: "string" },
      },
      required: ["match_percent","matched","missing","recommended_projects","verdict"],
    },
  },
  roadmap: {
    name: "roadmap",
    parameters: {
      type: "object",
      properties: {
        next_skill: { type: "string" },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: { title: { type: "string" }, why: { type: "string" }, weeks: { type: "number" } },
            required: ["title","why","weeks"],
          },
        },
        target_role: { type: "string" },
      },
      required: ["next_skill","steps","target_role"],
    },
  },
  judge_summary: {
    name: "judge_summary",
    parameters: {
      type: "object",
      properties: {
        verdict: { type: "string" },
        winner: { type: "string" },
        rationale: { type: "string" },
        risk_notes: { type: "array", items: { type: "string" } },
      },
      required: ["verdict","winner","rationale","risk_notes"],
    },
  },
};

async function structured(messages: any[], schemaKey: string) {
  const schema = schemas[schemaKey];
  const data = await callAI({
    messages,
    tools: [{ type: "function", function: schema }],
    tool_choice: { type: "function", function: { name: schema.name } },
  });
  return extractToolArgs(data);
}

async function fetchGithubMeta(url: string) {
  try {
    const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!m) return null;
    const [, owner, repo] = m;
    const cleanRepo = repo.replace(/\.git$/, "");
    const r = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`);
    if (!r.ok) return { owner, repo: cleanRepo };
    const j = await r.json();
    let readme = "";
    try {
      const rd = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, { headers: { Accept: "application/vnd.github.raw" } });
      if (rd.ok) readme = (await rd.text()).slice(0, 6000);
    } catch {}
    let commits: any[] = [];
    try {
      const cr = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/commits?per_page=30`);
      if (cr.ok) {
        const arr = await cr.json();
        commits = arr.map((c: any) => ({ msg: c.commit?.message?.split("\n")[0], date: c.commit?.author?.date, author: c.commit?.author?.name }));
      }
    } catch {}
    let langs: any = {};
    try {
      const lr = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/languages`);
      if (lr.ok) langs = await lr.json();
    } catch {}
    return {
      owner, repo: cleanRepo,
      description: j.description, language: j.language,
      stars: j.stargazers_count, forks: j.forks_count,
      created_at: j.created_at, updated_at: j.updated_at,
      topics: j.topics, languages: langs, commits, readme,
    };
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const { action, payload } = (await req.json()) as { action: Action; payload: any };

    let result: any;
    switch (action) {
      case "analyze_software": {
        const meta = await fetchGithubMeta(payload.repoUrl);
        const sys = "You are HiveX AI, a brutally honest senior engineering reviewer. Score authenticity, originality, AST complexity, AI-generation likelihood, and commit patterns. Be specific.";
        const user = `Repo URL: ${payload.repoUrl}\n\nMetadata:\n${JSON.stringify(meta, null, 2)}\n\nProvide deep analysis. List 4-6 likely critical files with quality. Estimate AI-gen likelihood from code style hints in README/topics. Describe commit cadence pattern based on the commit list.`;
        result = await structured([{ role: "system", content: sys }, { role: "user", content: user }], "software_analysis");
        result._meta = meta;
        break;
      }
      case "analyze_hardware": {
        const sys = "You are HiveX AI hardware reviewer. Identify components from images, build a BOM with cost estimates, estimate power budget, and detect copied tutorial builds.";
        const content: any[] = [{ type: "text", text: `Description: ${payload.description}\n\nIdentify project, list components, build BOM (5-10 items with USD cost estimates), estimate total power in watts, flag if it looks like a known Instructables/Hackster project.` }];
        const imgs: string[] = payload.images ?? (payload.imageBase64 ? [payload.imageBase64] : []);
        for (const img of imgs.slice(0, 4)) content.push({ type: "image_url", image_url: { url: img } });
        result = await structured([{ role: "system", content: sys }, { role: "user", content }], "hardware_analysis");
        break;
      }
      case "generate_questions": {
        const sys = "You are HiveX AI interviewer. Generate 4 progressively deeper questions probing real understanding (logic, edge cases, decisions, tradeoffs). Avoid trivia.";
        result = await structured([{ role: "system", content: sys }, { role: "user", content: `Project context:\n${JSON.stringify(payload.analysis, null, 2)}` }], "questions");
        break;
      }
      case "interview_followup": {
        const sys = "You are HiveX AI conducting a live viva. Respond in 1-2 sentences acknowledging the answer, then ask the next question or a probing follow-up. Sharp, conversational.";
        const data = await callAI({ messages: [{ role: "system", content: sys }, ...payload.messages] });
        result = { reply: data?.choices?.[0]?.message?.content ?? "" };
        break;
      }
      case "evaluate": {
        const sys = "You are HiveX AI scoring engine. Score honestly across 5 radar dimensions (depth, originality, communication, execution, innovation). Detect contradictions, plagiarism, AI-generated patterns, shallow answers. Compute final_score 0-100 = 0.25*code_quality + 0.30*viva + 0.20*originality + 0.15*complexity + 0.10*docs. Estimate global percentile.";
        const user = `Project analysis:\n${JSON.stringify(payload.analysis, null, 2)}\n\nQ&A transcript:\n${JSON.stringify(payload.qa, null, 2)}\n\nProduce final scoring with red flags.`;
        result = await structured([{ role: "system", content: sys }, { role: "user", content: user }], "evaluation");
        break;
      }
      case "improve": {
        result = await structured([{ role: "system", content: "Suggest 5 concrete improvements." }, { role: "user", content: JSON.stringify(payload.analysis) }], "improve");
        break;
      }
      case "demo_script": {
        result = await structured([{ role: "system", content: "Write a 30-second demo pitch and 4 talking points." }, { role: "user", content: JSON.stringify(payload.analysis) }], "demo");
        break;
      }
      case "skill_gap": {
        const sys = "You are HiveX AI career analyst. Compare candidate's skill profile to a job description. Compute match %, list matched/missing skills, suggest projects.";
        const user = `Profile:\n${JSON.stringify(payload.profile)}\n\nJob description:\n${payload.jd}`;
        result = await structured([{ role: "system", content: sys }, { role: "user", content: user }], "skill_gap");
        break;
      }
      case "roadmap": {
        const sys = "You are HiveX AI mentor. Build a personalized 4-step learning roadmap for this builder.";
        result = await structured([{ role: "system", content: sys }, { role: "user", content: JSON.stringify(payload.profile) }], "roadmap");
        break;
      }
      case "judge_summary": {
        const sys = "You are HiveX AI head judge. Summarize a leaderboard, pick a winner, explain rationale, and list risk notes.";
        result = await structured([{ role: "system", content: sys }, { role: "user", content: JSON.stringify(payload.candidates) }], "judge_summary");
        break;
      }
      default: throw new Error("Unknown action");
    }

    return new Response(JSON.stringify({ data: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
