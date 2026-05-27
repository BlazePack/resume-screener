/** Types and fetch helpers for the Python screening API. */

export type ExtractedEntities = {
  skills: string[];
  organizations: string[];
  dates: string[];
};

export type Candidate = {
  id: string;
  name: string;
  semantic_score: number;
  skill_match: number;
  tfidf_score?: number;
  final_score: number;
  decision: "human_review" | "rejected";
  explanation: string;
  extracted: ExtractedEntities;
};

export type ScreeningResult = {
  job_title: string;
  job_description: string;
  scoring_mode?: string;
  candidates: Candidate[];
};

export type BiasVariant = { label: string; final_score: number };

export type BiasPair = {
  variant_a: BiasVariant;
  variant_b: BiasVariant;
  delta: number;
  note: string;
};

export type MethodCompareRow = {
  name: string;
  semantic: number;
  tfidf: number;
};

export type BiasResult = {
  name_swap: BiasPair;
  phrase_swap: BiasPair;
  method_compare: MethodCompareRow[];
};

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const FETCH_TIMEOUT_MS = 90_000;

async function getJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text.startsWith("<!DOCTYPE") ? "API returned an HTML error page — is Render running?" : text || `Request failed (${res.status})`);
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error("API returned non-JSON. Check VITE_API_URL and that Render is Live.");
    }
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out. Render free tier may be waking up — wait 30s and try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchScreening(job = "se-intern") {
  return getJson<ScreeningResult>(`/api/screen?job=${encodeURIComponent(job)}`);
}

export function fetchBiasDemo() {
  return getJson<BiasResult>("/api/bias");
}

export function fetchHealth() {
  return getJson<{
    status: string;
    embedding_ready: boolean;
    spacy_ready: boolean;
    errors: { embedding: string | null; spacy: string | null };
  }>("/api/health");
}
