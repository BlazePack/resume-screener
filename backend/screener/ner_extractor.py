"""
Named Entity Recognition (NER) with spaCy plus a curated skills lexicon.

Real hiring tools combine NER with custom skill ontologies — we mirror that pattern.
"""
from __future__ import annotations

import re
from functools import lru_cache

from backend.config import SKILL_LEXICON, SPACY_MODEL
from backend.screener.schemas import ExtractedEntities

_nlp = None
_nlp_load_error: str | None = None


def _load_spacy():
    global _nlp, _nlp_load_error
    if _nlp is not None or _nlp_load_error is not None:
        return
    try:
        import spacy

        _nlp = spacy.load(SPACY_MODEL)
    except Exception as exc:  # noqa: BLE001 — surface install hint to API
        _nlp_load_error = str(exc)
        _nlp = None


def spacy_status() -> dict[str, bool | str]:
    _load_spacy()
    return {
        "available": _nlp is not None,
        "error": _nlp_load_error or "",
    }


_DISPLAY_NAMES = {
    "python": "Python",
    "javascript": "JavaScript",
    "java": "Java",
    "react": "React",
    "html": "HTML",
    "css": "CSS",
    "sql": "SQL",
    "git": "Git",
    "github": "GitHub",
    "ai": "AI",
    "ml": "ML",
    "figma": "Figma",
    "machine learning": "Machine Learning",
    "artificial intelligence": "Artificial Intelligence",
    "microsoft office": "Microsoft Office",
    "web development": "Web Development",
    "web dev": "Web Dev",
    "version control": "Version Control",
}


def extract_skills(text: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    # Longer phrases first so "machine learning" wins over "learning"
    for skill in sorted(SKILL_LEXICON, key=len, reverse=True):
        if re.search(rf"\b{re.escape(skill)}\b", text, re.IGNORECASE):
            display = _DISPLAY_NAMES.get(skill, skill.title())
            if display not in seen:
                seen.add(display)
                found.append(display)
    return found


def extract_entities(text: str) -> ExtractedEntities:
    _load_spacy()
    organizations: list[str] = []
    dates: list[str] = []

    if _nlp is not None:
        doc = _nlp(text[:100_000])  # guard very long inputs
        for ent in doc.ents:
            if ent.label_ == "ORG" and ent.text.strip():
                org = ent.text.strip()
                if org not in organizations and len(org) > 2:
                    organizations.append(org)
            elif ent.label_ == "DATE" and ent.text.strip():
                d = ent.text.strip()
                if d not in dates:
                    dates.append(d)

    # Fallback: year ranges like 2023 – 2025
    if not dates:
        for match in re.finditer(r"\b(20\d{2})\s*[–\-]\s*(20\d{2}|Present)\b", text, re.IGNORECASE):
            span = match.group(0)
            if span not in dates:
                dates.append(span)

    skills = extract_skills(text)
    return {
        "skills": skills,
        "organizations": organizations[:8],
        "dates": dates[:6],
    }


def entity_signal_score(extracted: ExtractedEntities) -> float:
    """0–1 proxy for 'has structured work/education signals'."""
    score = 0.0
    if extracted["organizations"]:
        score += 0.5
    if extracted["dates"]:
        score += 0.5
    return min(1.0, score)
