"""
Combine NLP signals into a final score and hiring decision.

Mirrors the filtering stage in commercial ATS tools: rank everyone, then cut a line.
"""
from pathlib import Path

from backend.config import (
    PASS_THRESHOLD,
    WEIGHT_ENTITY_SIGNAL,
    WEIGHT_SEMANTIC,
    WEIGHT_SKILL_MATCH,
)
from backend.screener.explanations import build_explanation
from backend.screener.ingest import load_job_description, list_screening_resumes, load_text, resume_id_from_path
from backend.screener.ner_extractor import entity_signal_score, extract_entities, extract_skills
from backend.screener.parser import guess_display_name, parse_resume
from backend.screener.schemas import CandidateResult, ScreeningResponse
from backend.screener.semantic_scorer import semantic_similarity
from backend.screener.tfidf_baseline import tfidf_scores


def _skill_match_ratio(job_text: str, resume_text: str) -> float:
    job_skills = extract_skills(job_text)
    resume_skills = set(extract_skills(resume_text))
    if not job_skills:
        return 0.0
    hits = sum(1 for s in job_skills if s in resume_skills)
    # HTML + CSS often appears instead of the phrase "web development" on student resumes
    if "Web Development" in job_skills and {"HTML", "CSS"}.issubset(resume_skills):
        hits += 1
    return min(1.0, hits / len(job_skills))


def score_resume(job_text: str, raw_resume: str, *, tfidf: float | None = None) -> CandidateResult:
    parsed = parse_resume(raw_resume)
    full_text = str(parsed["full_text"])
    name = guess_display_name(full_text)

    extracted = extract_entities(full_text)
    semantic = semantic_similarity(job_text, full_text, applicant_name=name)
    skills = _skill_match_ratio(job_text, full_text)
    entity_sig = entity_signal_score(extracted)

    final = (
        WEIGHT_SEMANTIC * semantic
        + WEIGHT_SKILL_MATCH * skills
        + WEIGHT_ENTITY_SIGNAL * entity_sig
    )
    final = round(max(0.0, min(1.0, final)), 4)
    decision = "human_review" if final >= PASS_THRESHOLD else "rejected"

    return {
        "id": "00",
        "name": name,
        "semantic_score": round(semantic, 4),
        "skill_match": round(skills, 4),
        "tfidf_score": round(tfidf or 0.0, 4),
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


def run_screening(job_slug: str = "se-intern") -> ScreeningResponse:
    job_title, job_text = load_job_description(job_slug)
    resume_paths = list_screening_resumes()
    if not resume_paths:
        raise FileNotFoundError("No sample resumes found in data/resumes/")

    raw_texts = [load_text(p) for p in resume_paths]
    tfidf_list = tfidf_scores(
        job_text,
        [str(parse_resume(t)["scoring_text"]) for t in raw_texts],
    )

    candidates: list[CandidateResult] = []
    for path, raw, tfidf in zip(resume_paths, raw_texts, tfidf_list):
        result = score_resume(job_text, raw, tfidf=tfidf)
        result["id"] = resume_id_from_path(path)
        candidates.append(result)

    candidates.sort(key=lambda c: c["final_score"], reverse=True)
    return {
        "job_title": job_title,
        "job_description": job_text,
        "candidates": candidates,
    }


def score_file(path: Path, job_text: str) -> CandidateResult:
    raw = load_text(path)
    return score_resume(job_text, raw)
