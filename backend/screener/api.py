"""FastAPI HTTP layer for the React demo frontend."""
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.screener.ner_extractor import spacy_status
from backend.screener.ranker import run_screening
from backend.screener.semantic_scorer import embedding_status, embeddings_enabled, scoring_mode

app = FastAPI(
    title="Resume Screener API",
    description="Educational NLP hiring pipeline demo (high school CS project).",
    version="1.0.0",
)

_cors_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
if _cors_origins == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
elif _cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _cors_origins.split(",") if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_origin_regex=r"https://.*\.netlify\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/health")
def health():
    sp = spacy_status()
    return {
        "status": "ok",
        "scoring_mode": scoring_mode(),
        "embeddings_enabled": embeddings_enabled(),
        "embedding_model": os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
        "embedding_ready": False,
        "spacy_ready": sp["available"],
        "errors": {
            "spacy": sp.get("error") or None,
        },
    }


@app.get("/api/readiness")
def readiness():
    emb = embedding_status()
    sp = spacy_status()
    ok = sp["available"] and (emb["available"] or not embeddings_enabled())
    return {
        "status": "ok" if ok else "degraded",
        "scoring_mode": scoring_mode(),
        "embedding_model": emb.get("model"),
        "embedding_ready": emb["available"],
        "spacy_ready": sp["available"],
        "errors": {
            "embedding": emb.get("error") or None,
            "spacy": sp.get("error") or None,
        },
    }


@app.get("/api/screen")
def screen(job: str = "se-intern", training: str = "heavy_data"):
    try:
        return run_screening(job, training=training)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/bias")
def bias(training: str | None = None):
    try:
        if training is None:
            from backend.screener.bias_demo import run_full_bias_demo

            return run_full_bias_demo()
        from backend.screener.bias_demo import run_bias_demo

        return run_bias_demo(training)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
