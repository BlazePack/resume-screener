"""Load job descriptions and resume text files from disk."""
from pathlib import Path

from backend.config import DEFAULT_JOB_FILE, JOB_DESCRIPTIONS_DIR, RESUMES_DIR, SCREENING_RESUME_GLOB


def load_text(path: Path) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"Missing file: {path}")
    return path.read_text(encoding="utf-8").strip()


def load_job_description(slug: str = "se-intern") -> tuple[str, str]:
    """
    Returns (job_title, full_text).
    Currently only the software engineer intern role is bundled.
    """
    if slug != "se-intern":
        raise ValueError(f"Unknown job slug: {slug}")

    text = load_text(DEFAULT_JOB_FILE)
    # First non-empty line is the display title
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    title = lines[0] if lines else "Job Opening"
    return title, text


def list_screening_resumes() -> list[Path]:
    """Numbered demo resumes (01_*.txt … 08_*.txt), excluding bias_* files."""
    paths = sorted(RESUMES_DIR.glob(SCREENING_RESUME_GLOB))
    return [p for p in paths if not p.name.startswith("bias_")]


def resume_id_from_path(path: Path) -> str:
    """e.g. 01_alex_chen.txt -> 01"""
    return path.name.split("_", 1)[0]
