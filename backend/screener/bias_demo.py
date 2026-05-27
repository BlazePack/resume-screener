"""
Bias demonstration: identical resumes with only a name or phrase changed.

Shows how embedding-based scorers can treat superficial text differently — a key ethics topic.
"""
from backend.config import BIAS_RESUME_FILES
from backend.screener.ingest import load_job_description, load_text
from backend.screener.ranker import run_screening, score_resume
from backend.screener.schemas import BiasPair, BiasResponse, MethodCompareRow


def _pair(
    path_a,
    path_b,
    label_a: str,
    label_b: str,
    note: str,
) -> BiasPair:
    _, job_text = load_job_description()
    score_a = score_resume(job_text, load_text(path_a))
    score_b = score_resume(job_text, load_text(path_b))
    delta = round(score_b["final_score"] - score_a["final_score"], 4)
    return {
        "variant_a": {"label": label_a, "final_score": score_a["final_score"]},
        "variant_b": {"label": label_b, "final_score": score_b["final_score"]},
        "delta": delta,
        "note": note,
    }


def run_bias_demo() -> BiasResponse:
    files = BIAS_RESUME_FILES
    name_swap = _pair(
        files["name_a"],
        files["name_b"],
        "Alex Chen",
        "Jamala Washington",
        "Same resume, different name. The score should stay the same.",
    )
    phrase_swap = _pair(
        files["phrase_without"],
        files["phrase_with"],
        "Activities: Coding Club",
        "Activities: Women's Coding Club",
        "One phrase changed. If the score moves, the tool is reacting to wording, not just skills.",
    )

    screening = run_screening()
    method_compare: list[MethodCompareRow] = [
        {
            "name": c["name"],
            "semantic": int(round(c["semantic_score"] * 100)),
            "tfidf": int(round(c["tfidf_score"] * 100)),
        }
        for c in screening["candidates"][:6]
    ]

    return {
        "name_swap": name_swap,
        "phrase_swap": phrase_swap,
        "method_compare": method_compare,
    }
