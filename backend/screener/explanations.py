"""Human-readable explanations for presentation demos."""
from backend.screener.schemas import CandidateResult, ExtractedEntities


def build_explanation(
    *,
    extracted: ExtractedEntities,
    semantic_score: float,
    skill_match: float,
    decision: str,
) -> str:
    skills = extracted["skills"]
    if decision == "rejected":
        if not skills or skills == ["Microsoft Office"] or skills == ["Excel"]:
            return "Limited programming keywords; resume emphasizes non-technical experience."
        if any(s in skills for s in ("Figma", "HTML", "CSS")) and "Python" not in skills:
            return "Strong design portfolio but few backend/engineering keywords."
        return "Overall match to the internship description is below the automated cutoff."

    if skill_match >= 0.85:
        return "Strong skill overlap with the job description; semantic match supports advancement."
    if semantic_score >= 0.78:
        return "Solid semantic alignment with the role; activity wording may slightly affect embedding score."
    if "Python" in skills:
        return "Python and related tooling present; fewer advanced dev tools listed than top candidates."
    return "Some overlap with the role; lighter on engineering tooling than leading applicants."
