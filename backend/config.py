"""
Configuration for the resume screener pipeline.
Adjust thresholds here for live demos during your presentation.
"""
import os
from pathlib import Path

# Set USE_EMBEDDINGS=false on Render free tier (512MB cannot load PyTorch models).
USE_EMBEDDINGS = os.getenv("USE_EMBEDDINGS", "true").lower() not in ("0", "false", "no")

# Project root (parent of backend/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
JOB_DESCRIPTIONS_DIR = DATA_DIR / "job_descriptions"
RESUMES_DIR = DATA_DIR / "resumes"

# Default job slug used by the web UI
DEFAULT_JOB_SLUG = "se-intern"
DEFAULT_JOB_FILE = JOB_DESCRIPTIONS_DIR / "software_engineer_intern.txt"

# Sentence-transformers model (downloads on first run)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# spaCy English model
SPACY_MODEL = "en_core_web_sm"

# Final score = weighted sum of these signals (must sum to 1.0)
WEIGHT_SEMANTIC = 0.60
WEIGHT_SKILL_MATCH = 0.30
WEIGHT_ENTITY_SIGNAL = 0.10

# Candidates at or above this score are "sent to human review"
PASS_THRESHOLD = 0.50
PASS_THRESHOLD_LIGHTWEIGHT = 0.28


def active_pass_threshold() -> float:
    return PASS_THRESHOLD if USE_EMBEDDINGS else PASS_THRESHOLD_LIGHTWEIGHT

# Skills we look for in resumes (matched case-insensitively)
SKILL_LEXICON = [
    "python",
    "javascript",
    "java",
    "react",
    "html",
    "css",
    "sql",
    "git",
    "github",
    "web development",
    "web dev",
    "machine learning",
    "artificial intelligence",
    "ai",
    "ml",
    "tensorflow",
    "pytorch",
    "figma",
    "excel",
    "microsoft office",
    "teamwork",
    "hackathon",
    "robotics",
    "programming",
    "software",
    "debugging",
    "version control",
]

# Resume files included in the main screening demo (sorted by filename)
SCREENING_RESUME_GLOB = "[0-9][0-9]_*.txt"

# Bias demo filenames (not included in main ranking)
BIAS_RESUME_FILES = {
    "name_a": RESUMES_DIR / "bias_name_alex.txt",
    "name_b": RESUMES_DIR / "bias_name_jamala.txt",
    "phrase_with": RESUMES_DIR / "bias_phrase_with_wcc.txt",
    "phrase_without": RESUMES_DIR / "bias_phrase_without_wcc.txt",
}
