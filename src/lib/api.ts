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
  training_mode?: string;
  training_label?: string;
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

export type BiasTrainingModeResult = {
  training_mode: string;
  label: string;
  description: string;
  name_swap: BiasPair;
  phrase_swap: BiasPair;
};

export type FullBiasResult = {
  low_data: BiasTrainingModeResult;
  heavy_data: BiasTrainingModeResult;
  method_compare: MethodCompareRow[];
};

export type BiasResult = BiasTrainingModeResult & {
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
      throw new Error(
        text.startsWith("<!DOCTYPE")
          ? "Got an HTML error page. Is the Render API up?"
          : text || `Request failed (${res.status})`,
      );
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error("API returned non-JSON. Check VITE_API_URL and that Render is Live.");
    }
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Timed out. Wait 30 seconds and try again (free server may be waking up).");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchScreening(job = "se-intern", training = "heavy_data") {
  return getJson<ScreeningResult>(
    `/api/screen?job=${encodeURIComponent(job)}&training=${encodeURIComponent(training)}`,
  );
}

export function fetchBiasDemoFull() {
  return getJson<FullBiasResult>("/api/bias");
}

export function fetchBiasDemo(training: "low_data" | "heavy_data") {
  return getJson<BiasResult>(`/api/bias?training=${encodeURIComponent(training)}`);
}

export function fetchHealth() {
  return getJson<{
    status: string;
    embedding_ready: boolean;
    spacy_ready: boolean;
    errors: { embedding: string | null; spacy: string | null };
  }>("/api/health");
}
