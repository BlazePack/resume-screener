"""
Semantic similarity via sentence-transformers (embedding cosine similarity).

When USE_EMBEDDINGS=false (Render free tier), callers fall back to TF-IDF instead.
"""
from __future__ import annotations

from functools import lru_cache

from backend.config import EMBEDDING_MODEL, USE_EMBEDDINGS

_model = None
_model_error: str | None = None
_load_attempted = False


def embeddings_enabled() -> bool:
    return USE_EMBEDDINGS


def scoring_mode() -> str:
    return "embeddings" if USE_EMBEDDINGS else "tfidf-fallback"


def _load_model() -> None:
    global _model, _model_error, _load_attempted
    if not USE_EMBEDDINGS:
        _load_attempted = True
        _model_error = "disabled (USE_EMBEDDINGS=false)"
        return
    if _load_attempted:
        return
    _load_attempted = True
    try:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(EMBEDDING_MODEL)
    except Exception as exc:  # noqa: BLE001
        _model_error = str(exc)
        _model = None


def embedding_status() -> dict[str, bool | str]:
    _load_model()
    return {
        "available": _model is not None,
        "model": EMBEDDING_MODEL,
        "error": _model_error or "",
        "mode": scoring_mode(),
    }


def _resume_for_embedding(resume_text: str, applicant_name: str | None) -> str:
    if applicant_name:
        return f"Applicant name: {applicant_name}\n\n{resume_text.strip()}"
    return resume_text.strip()


@lru_cache(maxsize=128)
def _encode_pair(job_text: str, resume_text: str, applicant_name: str | None) -> float:
    _load_model()
    if _model is None:
        raise RuntimeError(
            _model_error or "Embedding model not loaded. Set USE_EMBEDDINGS=false for lightweight mode."
        )

    import numpy as np

    resume_blob = _resume_for_embedding(resume_text, applicant_name)
    vectors = _model.encode([job_text.strip(), resume_blob], normalize_embeddings=True)
    similarity = float(np.dot(vectors[0], vectors[1]))
    return max(0.0, min(1.0, similarity))


def semantic_similarity(job_text: str, resume_text: str, *, applicant_name: str | None = None) -> float:
    if not USE_EMBEDDINGS:
        raise RuntimeError("Embeddings disabled; use TF-IDF fallback in ranker.")
    if not job_text.strip() or not resume_text.strip():
        return 0.0
    return _encode_pair(job_text.strip(), resume_text.strip(), applicant_name)
