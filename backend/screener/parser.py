"""
Parse and normalize raw resume text before NLP scoring.

Real ATS tools clean PDFs/HTML; here we work with plain .txt files.
"""
import re


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_resume(text: str) -> dict[str, str | list[str]]:
    """
    Split resume into coarse sections using simple header detection.
    Returns normalized full text plus optional section chunks for debugging.
    """
    cleaned = normalize_whitespace(text)
    sections: dict[str, list[str]] = {}
    current = "header"
    sections[current] = []

    section_headers = {
        "education",
        "experience",
        "work experience",
        "projects",
        "skills",
        "activities",
        "summary",
        "technical skills",
    }

    for line in cleaned.splitlines():
        key = line.strip().lower().rstrip(":")
        if key in section_headers:
            current = key.replace(" ", "_")
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)

    flat_sections = {k: "\n".join(v).strip() for k, v in sections.items() if v}
    return {
        "full_text": cleaned,
        "sections": flat_sections,
        # Scoring uses experience + skills + projects when present
        "scoring_text": _scoring_text(flat_sections, cleaned),
    }


def _scoring_text(sections: dict[str, str], fallback: str) -> str:
    parts = []
    for key in ("experience", "work_experience", "projects", "skills", "technical_skills", "education", "activities"):
        if sections.get(key):
            parts.append(sections[key])
    return "\n".join(parts) if parts else fallback


def guess_display_name(text: str) -> str:
    """First line of resume is treated as the candidate name in our samples."""
    for line in text.splitlines():
        line = line.strip()
        if line:
            return line
    return "Unknown Candidate"
