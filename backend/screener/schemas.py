"""Typed shapes returned by the API (matches the React frontend)."""
from typing import Literal, TypedDict


class ExtractedEntities(TypedDict):
    skills: list[str]
    organizations: list[str]
    dates: list[str]


class CandidateResult(TypedDict):
    id: str
    name: str
    semantic_score: float
    skill_match: float
    tfidf_score: float
    final_score: float
    decision: Literal["human_review", "rejected"]
    explanation: str
    extracted: ExtractedEntities


class ScreeningResponse(TypedDict):
    job_title: str
    job_description: str
    scoring_mode: str
    candidates: list[CandidateResult]


class BiasVariant(TypedDict):
    label: str
    final_score: float


class BiasPair(TypedDict):
    variant_a: BiasVariant
    variant_b: BiasVariant
    delta: float
    note: str


class MethodCompareRow(TypedDict):
    name: str
    semantic: int
    tfidf: int


class BiasResponse(TypedDict):
    name_swap: BiasPair
    phrase_swap: BiasPair
    method_compare: list[MethodCompareRow]
