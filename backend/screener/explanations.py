"""Short blurbs shown under each candidate score."""
from backend.screener.schemas import ExtractedEntities


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
            return "Not much programming on the resume. Mostly other work."
        if any(s in skills for s in ("Figma", "HTML", "CSS")) and "Python" not in skills:
            return "Design skills show up, but not much coding for this job."
        return "Overall score was below the cutoff."

    if skill_match >= 0.85:
        return "Skills line up well with the job posting."
    if semantic_score >= 0.78:
        return "Good match to the job description overall."
    if "Python" in skills:
        return "Has Python and some tools, but not as strong as the top applicants."
    return "Some overlap with the job, but weaker than the leaders."
