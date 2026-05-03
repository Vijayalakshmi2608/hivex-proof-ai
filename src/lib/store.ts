// Lightweight in-memory store + sessionStorage for the current run
export type Mode = "software" | "hardware";

export interface RunState {
  mode: Mode;
  input: { repoUrl?: string; description?: string; imageBase64?: string };
  analysis?: any;
  questions?: { q: string; probes?: string }[];
  qa?: { question: string; answer: string }[];
  result?: any;
}

const KEY = "hivex_run";

export function saveRun(r: RunState) {
  sessionStorage.setItem(KEY, JSON.stringify(r));
}
export function loadRun(): RunState | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function patchRun(p: Partial<RunState>) {
  const r = loadRun() ?? ({ mode: "software", input: {} } as RunState);
  const next = { ...r, ...p };
  saveRun(next);
  return next;
}