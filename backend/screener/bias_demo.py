"""Bias lab: compare small vs large training data regimes."""
from backend.config import BIAS_RESUME_FILES
from backend.screener.ingest import load_job_description, load_text
from backend.screener.ranker import run_screening, score_resume
from backend.screener.schemas import BiasPair, BiasResponse, BiasTrainingModeResult, FullBiasResponse
from backend.screener.training_regime import TrainingMode, normalize_mode, regime_blurb, regime_label


def _pair(
    path_a,
    path_b,
    label_a: str,
    label_b: str,
    note: str,
    *,
    training: TrainingMode,
) -> BiasPair:
    _, job_text = load_job_description()
    score_a = score_resume(job_text, load_text(path_a), training=training)
    score_b = score_resume(job_text, load_text(path_b), training=training)
    delta = round(score_b["final_score"] - score_a["final_score"], 4)
    return {
        "variant_a": {"label": label_a, "final_score": score_a["final_score"]},
        "variant_b": {"label": label_b, "final_score": score_b["final_score"]},
        "delta": delta,
        "note": note,
    }


def _mode_result(training: TrainingMode) -> BiasTrainingModeResult:
    files = BIAS_RESUME_FILES
    return {
        "training_mode": training,
        "label": regime_label(training),
        "description": regime_blurb(training),
        "name_swap": _pair(
            files["name_a"],
            files["name_b"],
            "Alex Chen",
            "Jamala Washington",
            "Same resume, different name. Scores should match if training data was fair.",
            training=training,
        ),
        "phrase_swap": _pair(
            files["phrase_without"],
            files["phrase_with"],
            "Coding Club",
            "Women's Coding Club",
            "One activity line changed. Small datasets often overreact to gendered wording.",
            training=training,
        ),
    }


def run_bias_demo(training: str | None = None) -> BiasResponse:
    """Single-mode response (legacy query param)."""
    mode = normalize_mode(training)
    result = _mode_result(mode)
    screening = run_screening(training=mode)
    return {
        "training_mode": mode,
        "label": result["label"],
        "description": result["description"],
        "name_swap": result["name_swap"],
        "phrase_swap": result["phrase_swap"],
        "method_compare": [
            {
                "name": c["name"],
                "semantic": int(round(c["semantic_score"] * 100)),
                "tfidf": int(round(c["tfidf_score"] * 100)),
            }
            for c in screening["candidates"][:8]
        ],
    }


def run_full_bias_demo() -> FullBiasResponse:
    low = _mode_result("low_data")
    heavy = _mode_result("heavy_data")
    screening = run_screening(training="heavy_data")
    return {
        "low_data": low,
        "heavy_data": heavy,
        "method_compare": [
            {
                "name": c["name"],
                "semantic": int(round(c["semantic_score"] * 100)),
                "tfidf": int(round(c["tfidf_score"] * 100)),
            }
            for c in screening["candidates"][:8]
        ],
    }
