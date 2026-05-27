"""
Combine NLP signals into a final score and hiring decision.

Mirrors the filtering stage in commercial ATS tools: rank everyone, then cut a line.
"""
from pathlib import Path

from backend.config import (
    USE_EMBEDDINGS,
    WEIGHT_ENTITY_SIGNAL,
    WEIGHT_SEMANTIC,
    WEIGHT_SEMANTIC_LIGHT,
    WEIGHT_SKILL_MATCH,
    WEIGHT_SKILL_LIGHT,
    active_pass_threshold,
)
from backend.screener.explanations import build_explanation
from backend.screener.ingest import load_job_description, list_screening_resumes, load_text, resume_id_from_path
from backend.screener.ner_extractor import entity_signal_score, extract_entities, extract_skills
from backend.screener.parser import guess_display_name, parse_resume
from backend.screener.schemas import CandidateResult, ScreeningResponse
from backend.screener.semantic_scorer import embeddings_enabled, scoring_mode, semantic_similarity
from backend.screener.tfidf_baseline import tfidf_scores
from backend.screener.training_regime import (
    TrainingMode,
    applicant_name_for_scoring,
    apply_regime_adjustment,
    normalize_mode,
    regime_label,
    text_for_scoring,
)


def _weights() -> tuple[float, float, float]:
    if USE_EMBEDDINGS:
        return WEIGHT_SEMANTIC, WEIGHT_SKILL_MATCH, WEIGHT_ENTITY_SIGNAL
    return WEIGHT_SEMANTIC_LIGHT, WEIGHT_SKILL_LIGHT, WEIGHT_ENTITY_SIGNAL


def _skill_match_ratio(job_text: str, resume_text: str) -> float:
    job_skills = extract_skills(job_text)
    resume_skills = set(extract_skills(resume_text))
    if not job_skills:
        return 0.0
    hits = sum(1 for s in job_skills if s in resume_skills)
    if "Web Development" in job_skills and {"HTML", "CSS"}.issubset(resume_skills):
        hits += 1
    return min(1.0, hits / len(job_skills))


def _similarity_score(
    job_text: str,
    resume_text: str,
    *,
    applicant_name: str | None,
    tfidf: float | None,
) -> float:
    if embeddings_enabled():
        try:
            return semantic_similarity(job_text, resume_text, applicant_name=applicant_name)
        except RuntimeError:
            pass
    if tfidf is not None:
        return tfidf
    return tfidf_scores(job_text, [resume_text])[0]


def score_resume(
    job_text: str,
    raw_resume: str,
    *,
    tfidf: float | None = None,
    training: TrainingMode | str = "heavy_data",
) -> CandidateResult:
    mode = normalize_mode(training if isinstance(training, str) else training)
    parsed = parse_resume(raw_resume)
    full_text = str(parsed["full_text"])
    name = guess_display_name(full_text)
    scoring_text = text_for_scoring(full_text, mode)
    embed_name = applicant_name_for_scoring(name, mode)

    extracted = extract_entities(full_text)
    if tfidf is None:
        tfidf = tfidf_scores(job_text, [scoring_text])[0]

    w_sem, w_skill, w_ent = _weights()
    semantic = _similarity_score(job_text, scoring_text, applicant_name=embed_name, tfidf=tfidf)
    skills = _skill_match_ratio(job_text, scoring_text)
    entity_sig = entity_signal_score(extracted)

    final = w_sem * semantic + w_skill * skills + w_ent * entity_sig

    # Strong skill lists usually correlate with stronger intern fit (demo tuning).
    skill_count = len(extracted["skills"])
    if skill_count >= 10:
        final += 0.20
    elif skill_count >= 8:
        final += 0.14
    elif skill_count >= 6:
        final += 0.08
    elif skill_count <= 2:
        final -= 0.12

    final = apply_regime_adjustment(
        final,
        applicant_name=name,
        resume_text=full_text,
        mode=mode,
    )
    final = round(max(0.0, min(1.0, final)), 4)
    decision = "human_review" if final >= active_pass_threshold() else "rejected"

    return {
        "id": "00",
        "name": name,
        "semantic_score": round(semantic, 4),
        "skill_match": round(skills, 4),
        "tfidf_score": round(tfidf, 4),
        "final_score": final,
        "decision": decision,
        "explanation": build_explanation(
            extracted=extracted,
            semantic_score=semantic,
            skill_match=skills,
            decision=decision,
        ),
        "extracted": extracted,
    }


def run_screening(job_slug: str = "se-intern", training: TrainingMode | str = "heavy_data") -> ScreeningResponse:
    mode = normalize_mode(training if isinstance(training, str) else training)
    job_title, job_text = load_job_description(job_slug)
    resume_paths = list_screening_resumes()
    if not resume_paths:
        raise FileNotFoundError("No sample resumes found in data/resumes/")

    raw_texts = [load_text(p) for p in resume_paths]
    scoring_texts = [text_for_scoring(str(parse_resume(t)["full_text"]), mode) for t in raw_texts]
    tfidf_list = tfidf_scores(job_text, scoring_texts)

    candidates: list[CandidateResult] = []
    for path, raw, tfidf in zip(resume_paths, raw_texts, tfidf_list):
        result = score_resume(job_text, raw, tfidf=tfidf, training=mode)
        result["id"] = resume_id_from_path(path)
        candidates.append(result)

    candidates.sort(key=lambda c: c["final_score"], reverse=True)
    return {
        "job_title": job_title,
        "job_description": job_text,
        "scoring_mode": scoring_mode(),
        "training_mode": mode,
        "training_label": regime_label(mode),
        "candidates": candidates,
    }


def score_file(path: Path, job_text: str, *, training: TrainingMode = "heavy_data") -> CandidateResult:
    raw = load_text(path)
    return score_resume(job_text, raw, training=training)
