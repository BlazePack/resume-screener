"""
Simulate how much training data affects bias in hiring models.

Small / skewed datasets (low_data): the scorer leans on shortcuts like names and
gendered club names, similar to real tools trained on limited biased history.

Large / diverse datasets (heavy_data): name is ignored and wording is normalized
before scoring, similar to debiased production pipelines.
"""
from __future__ import annotations

import re
from typing import Literal

TrainingMode = Literal["low_data", "heavy_data"]

# Simulated name penalties when the model only saw a narrow slice of past hires.
# Educational simulation only, not real demographic inference.
_LOW_DATA_NAME_ADJUSTMENTS: dict[str, float] = {
    "Alex Chen": 0.05,
    "Emily O'Brien": 0.03,
    "Marcus Johnson": 0.02,
    "Jamala Washington": -0.08,
    "Priya Patel": -0.06,
    "Aisha Okonkwo": -0.07,
    "Maria Santos": -0.05,
    "Diego Morales": -0.04,
    "Kenji Nakamura": -0.03,
    "Sofia Rodriguez": -0.04,
    "Taylor Brooks": -0.02,
    "Chris Nguyen": -0.03,
}

_PHRASE_PENALTIES: list[tuple[str, float]] = [
    ("women's coding club", -0.07),
    ("girls who code", -0.05),
    ("women in stem", -0.05),
    ("black student union", -0.04),
]


def normalize_mode(mode: str | None) -> TrainingMode:
    if mode and mode.lower() in ("heavy_data", "heavy", "large"):
        return "heavy_data"
    return "low_data"


def regime_label(mode: TrainingMode) -> str:
    return "Small training set" if mode == "low_data" else "Large diverse training set"


def regime_blurb(mode: TrainingMode) -> str:
    if mode == "low_data":
        return (
            "Trained on a small, skewed sample of past hires. The model leans on shortcuts "
            "(names, club wording) instead of skills alone."
        )
    return (
        "Trained on a large, diverse dataset with debiasing steps. Names are stripped and "
        "wording is normalized before scoring."
    )


def applicant_name_for_scoring(name: str, mode: TrainingMode) -> str | None:
    """Only small-data models get the applicant name in the embedding input."""
    return name if mode == "low_data" else None


def text_for_scoring(resume_text: str, mode: TrainingMode) -> str:
    if mode == "heavy_data":
        return _neutralize_biased_phrases(resume_text)
    return resume_text


def apply_regime_adjustment(
    final_score: float,
    *,
    applicant_name: str,
    resume_text: str,
    mode: TrainingMode,
) -> float:
    if mode == "heavy_data":
        return final_score

    adjusted = final_score
    adjusted += _LOW_DATA_NAME_ADJUSTMENTS.get(applicant_name, -0.02)
    lowered = resume_text.lower()
    for phrase, penalty in _PHRASE_PENALTIES:
        if phrase in lowered:
            adjusted += penalty
    return max(0.0, min(1.0, adjusted))


def _neutralize_biased_phrases(text: str) -> str:
    replacements = [
        (r"women's coding club", "coding club"),
        (r"girls who code", "coding club"),
        (r"women in stem", "stem club"),
    ]
    out = text
    for pattern, repl in replacements:
        out = re.sub(pattern, repl, out, flags=re.IGNORECASE)
    return out
