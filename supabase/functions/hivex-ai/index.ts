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
  | "demo_script";

async function callAI(body: Record<string, unknown>) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", ...body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Response(JSON.stringify({ error: text, status: res.status }), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return res.json();
}

function extractToolArgs(data: any) {
  const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (tc?.function?.arguments) {
    try { return JSON.parse(tc.function.arguments); } catch { /* */ }
  }
  const content = data?.choices?.[0]?.message?.content;
  if (content) {
    try { return JSON.parse(content); } catch { /* */ }
  }
  return null;
}

const schemas: Record<string, any> = {
  software_analysis: {
    name: "software_analysis",
    description: "Analysis of a software project",
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
      },
      required: ["purpose", "tech_stack", "features", "complexity", "weaknesses", "code_xray", "originality_signal"],
    },
  },
  hardware_analysis: {
    name: "hardware_analysis",
    parameters: {
      type: "object",
      properties: {
        project_type: { type: "string" },
        components: { type: "array", items: { type: "string" } },
        build_explanation: { type: "string" },
        complexity: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
        realism_check: { type: "number", description: "0=fake, 100=real" },
        weaknesses: { type: "array", items: { type: "string" } },
      },
      required: ["project_type", "components", "build_explanation", "complexity", "realism_check", "weaknesses"],
    },
  },
  questions: {
    name: "interview_questions",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              q: { type: "string" },
              probes: { type: "string" },
            },
            required: ["q"],
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
        depth_level: { type: "string", enum: ["Surface", "Intermediate", "Deep"] },
        trust: { type: "string", enum: ["verified", "review", "suspicious"] },
        trust_reason: { type: "string" },
        skill_breakdown: {
          type: "object",
          properties: {
            logic: { type: "number" },
            backend: { type: "number" },
            hardware: { type: "number" },
            problem_solving: { type: "number" },
          },
          required: ["logic", "backend", "hardware", "problem_solving"],
        },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        contradictions: { type: "array", items: { type: "string" } },
        reality_check: { type: "string" },
        future_prediction: { type: "string" },
      },
      required: ["final_score", "confidence_score", "depth_level", "trust", "trust_reason", "skill_breakdown", "strengths", "weaknesses", "contradictions", "reality_check", "future_prediction"],
    },
  },
  improve: {
    name: "improvements",
    parameters: {
      type: "object",
      properties: {
        suggestions: { type: "array", items: { type: "string" } },
      },
      required: ["suggestions"],
    },
  },
  demo: {
    name: "demo_script",
    parameters: {
      type: "object",
      properties: {
        pitch: { type: "string" },
        talking_points: { type: "array", items: { type: "string" } },
      },
      required: ["pitch", "talking_points"],
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
      const rd = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
        headers: { Accept: "application/vnd.github.raw" },
      });
      if (rd.ok) readme = (await rd.text()).slice(0, 6000);
    } catch { /* */ }
    return {
      owner, repo: cleanRepo,
      description: j.description,
      language: j.language,
      stars: j.stargazers_count,
      topics: j.topics,
      readme,
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
        const sys = "You are HiveX AI, a strict engineering reviewer. Analyze GitHub project for authenticity, originality and complexity. Return structured analysis.";
        const user = `Repo URL: ${payload.repoUrl}\n\nGitHub metadata:\n${JSON.stringify(meta, null, 2)}\n\nProvide deep technical analysis. In code_xray, list 4-6 likely important files based on tech stack with quality assessment.`;
        result = await structured([{ role: "system", content: sys }, { role: "user", content: user }], "software_analysis");
        result._meta = meta;
        break;
      }
      case "analyze_hardware": {
        const sys = "You are HiveX AI hardware reviewer. Identify components from images and assess realism vs template builds.";
        const content: any[] = [
          { type: "text", text: `Description: ${payload.description}\n\nIdentify the hardware project, list components, assess realism (0-100, 100=clearly real custom build), and flag weaknesses.` },
        ];
        if (payload.imageBase64) {
          content.push({ type: "image_url", image_url: { url: payload.imageBase64 } });
        }
        result = await structured([{ role: "system", content: sys }, { role: "user", content }], "hardware_analysis");
        break;
      }
      case "generate_questions": {
        const sys = "You are HiveX AI interviewer. Generate 4 deep questions probing real understanding (logic, edge cases, decisions). Avoid surface trivia.";
        const user = `Project context:\n${JSON.stringify(payload.analysis, null, 2)}\n\nGenerate 4 progressively deeper questions.`;
        result = await structured([{ role: "system", content: sys }, { role: "user", content: user }], "questions");
        break;
      }
      case "interview_followup": {
        const sys = "You are HiveX AI conducting a live viva. Respond in 1-2 sentences acknowledging the answer, then ask the next question or a probing follow-up. Be sharp, conversational.";
        const data = await callAI({
          messages: [{ role: "system", content: sys }, ...payload.messages],
        });
        result = { reply: data?.choices?.[0]?.message?.content ?? "" };
        break;
      }
      case "evaluate": {
        const sys = "You are HiveX AI scoring engine. Evaluate the candidate's understanding based on project + Q&A. Detect contradictions across answers. Assess if project is template vs original. Score honestly.";
        const user = `Project analysis:\n${JSON.stringify(payload.analysis, null, 2)}\n\nQ&A transcript:\n${JSON.stringify(payload.qa, null, 2)}\n\nProduce final scoring.`;
        result = await structured([{ role: "system", content: sys }, { role: "user", content: user }], "evaluation");
        break;
      }
      case "improve": {
        const sys = "You are HiveX AI mentor. Suggest 5 concrete improvements for this project.";
        result = await structured(
          [{ role: "system", content: sys }, { role: "user", content: JSON.stringify(payload.analysis) }],
          "improve",
        );
        break;
      }
      case "demo_script": {
        const sys = "You are HiveX AI pitch coach. Write a 30-second demo pitch and 4 key talking points.";
        result = await structured(
          [{ role: "system", content: sys }, { role: "user", content: JSON.stringify(payload.analysis) }],
          "demo",
        );
        break;
      }
      default:
        throw new Error("Unknown action");
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});