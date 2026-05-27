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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
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
