export type Mode = "software" | "hardware";

export interface RunState {
  mode: Mode;
  input: { repoUrl?: string; description?: string; imageBase64?: string; images?: string[] };
  analysis?: any;
  questions?: { q: string; probes?: string }[];
  qa?: { question: string; answer: string }[];
  result?: any;
  username?: string;
}

const KEY = "hivex_run";
export function saveRun(r: RunState) { sessionStorage.setItem(KEY, JSON.stringify(r)); }
export function loadRun(): RunState | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function patchRun(p: Partial<RunState>) {
  const r = loadRun() ?? ({ mode: "software", input: {} } as RunState);
  const next = { ...r, ...p }; saveRun(next); return next;
}

// Sample preloaded project for instant demo
export const SAMPLE_RUN: RunState = {
  mode: "software",
  input: { repoUrl: "https://github.com/sample/edge-ai-drone" },
  analysis: {
    purpose: "Edge-AI Drone Path Planner with onboard obstacle avoidance",
    tech_stack: ["Python", "TensorFlow Lite", "ROS2", "C++", "MAVLink"],
    features: ["Realtime LiDAR fusion", "Onboard inference < 80ms", "Failsafe RTH", "Live telemetry stream"],
    complexity: "Advanced",
    weaknesses: ["No unit tests for path planner", "Hardcoded waypoint format"],
    code_xray: [
      { file: "planner/astar_3d.py", note: "Custom 3D A* implementation, non-trivial heuristics", quality: "strong" },
      { file: "perception/yolo_tflite.py", note: "Standard YOLO wrapper, lightly modified", quality: "average" },
      { file: "ros/talker.py", note: "Boilerplate ROS publisher", quality: "template" },
      { file: "control/mavlink_bridge.cpp", note: "Solid MAVLink command translation layer", quality: "strong" },
    ],
    originality_signal: "original",
    ai_generated_likelihood: 18,
    commit_pattern: "92 commits over 4 months, mostly evening cadence, single primary author + 2 collaborators on perception",
    ast_complexity_score: 78,
    dependency_risks: ["pillow<9.0 has known CVE", "tensorflow 2.8 outdated"],
    domain_tags: ["Robotics", "Computer Vision", "Embedded", "Realtime Systems"],
  },
  questions: [
    { q: "Walk me through how your A* heuristic handles dynamic obstacles." },
    { q: "Why TFLite over ONNX runtime on your platform?" },
    { q: "What happens when MAVLink heartbeat is lost mid-flight?" },
    { q: "Where is your perception pipeline most likely to fail?" },
  ],
  qa: [
    { question: "Walk me through how your A* heuristic handles dynamic obstacles.", answer: "I inflate obstacle costs by predicted velocity vector each tick. The heuristic stays admissible because I cap inflation at sensor range." },
    { question: "Why TFLite over ONNX runtime on your platform?", answer: "Jetson Nano had better sustained throughput on TFLite quantized models, ~28 fps vs 19 fps in my benchmarks." },
    { question: "What happens when MAVLink heartbeat is lost mid-flight?", answer: "Failsafe state machine triggers RTH after 1.5s, with altitude hold fallback if GPS quality drops below threshold." },
    { question: "Where is your perception pipeline most likely to fail?", answer: "Glare on sensor or rapid scene changes — confidence smoothing helps but I haven't fully solved fast strobe lighting." },
  ],
  result: {
    final_score: 89,
    confidence_score: 92,
    depth_level: "Deep",
    trust: "verified",
    trust_reason: "Technical answers consistent with stated implementation. Original A* logic + measured benchmarks indicate hands-on work.",
    skill_breakdown: { logic: 92, backend: 78, hardware: 88, problem_solving: 91 },
    radar: { depth: 91, originality: 86, communication: 84, execution: 89, innovation: 82 },
    red_flags: [],
    percentile: 94,
    strengths: ["Concrete benchmarks recall", "Failure mode awareness", "Original heuristic design"],
    weaknesses: ["Test coverage thin", "Strobe lighting edge case unresolved"],
    contradictions: [],
    reality_check: "Honest answer about unsolved edge case is a strong positive trust signal.",
    future_prediction: "Strong trajectory — likely top 10% of robotics builders within 6 months.",
    domain_tags: ["Robotics", "Computer Vision", "Embedded"],
  },
  username: "demo-builder",
};

export function loadSampleRun() { saveRun(SAMPLE_RUN); }
