"""
Semantic similarity via sentence-transformers (embedding cosine similarity).

This is the same family of technique used in modern matching systems:
text → vectors → cosine similarity.
"""
from __future__ import annotations

from functools import lru_cache

from backend.config import EMBEDDING_MODEL

_model = None
_model_error: str | None = None


def _load_model():
    global _model, _model_error
    if _model is not None or _model_error is not None:
        return
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
    }


def _resume_for_embedding(resume_text: str, applicant_name: str | None) -> str:
    """
    Some real systems concatenate applicant metadata into the text they embed.
    Including the name here lets the bias lab show small score shifts from proxy signals.
    """
    if applicant_name:
        return f"Applicant name: {applicant_name}\n\n{resume_text.strip()}"
    return resume_text.strip()


@lru_cache(maxsize=128)
def _encode_pair(job_text: str, resume_text: str, applicant_name: str | None) -> float:
    _load_model()
    if _model is None:
        raise RuntimeError(
            _model_error or "Embedding model not loaded. Run: pip install sentence-transformers"
        )

    import numpy as np

    resume_blob = _resume_for_embedding(resume_text, applicant_name)
    vectors = _model.encode([job_text.strip(), resume_blob], normalize_embeddings=True)
    similarity = float(np.dot(vectors[0], vectors[1]))
    return max(0.0, min(1.0, similarity))


def semantic_similarity(job_text: str, resume_text: str, *, applicant_name: str | None = None) -> float:
    if not job_text.strip() or not resume_text.strip():
        return 0.0
    return _encode_pair(job_text.strip(), resume_text.strip(), applicant_name)
