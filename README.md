# AI Resume Screener (Educational Demo)

High school CS project demonstrating how automated hiring tools use **NLP → NER → semantic scoring → filtering**, plus a **bias lab** for presentation ethics discussion.

This is a **simulation only** — not used by any real employer.

## What's in the repo

| Part       | Tech                                                        | Role                                              |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `backend/` | Python, FastAPI, spaCy, sentence-transformers, scikit-learn | Parse resumes, extract entities, score, rank, API |
| `data/`    | `.txt` job description + 8 sample resumes                   | Demo inputs                                       |
| `src/`     | React, TanStack Start, Tailwind, Recharts                   | Presentation website                              |

## Deploy online (Netlify + Render)

See **[DEPLOY.md](./DEPLOY.md)** — the website goes on Netlify; the Python AI API goes on Render (Netlify cannot run the ML models).

## Quick start

### 1. Python API (required for live scores)

```bash
cd "/Users/roibrent/Resume Screener"
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m spacy download en_core_web_sm

# Terminal A — API (first run downloads the embedding model ~80MB)
uvicorn backend.main:app --reload --port 8000
```

CLI without the website:

```bash
python -m backend.main --screen   # ranked table in terminal
python -m backend.main --bias     # name / phrase bias demo
```

### 2. Web UI

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Vite proxies `/api` → `http://127.0.0.1:8000`.

**Important:** Use `npm run dev` for local demos, not only `npm run preview`. Preview also proxies `/api`, but the Python server must still be running. If `/api` is down, the UI shows a huge HTML blob — that is the site’s 404 page, not JSON.

## Presentation map (code → concept)

1. **Inputs** — `data/job_descriptions/`, `data/resumes/`
2. **Parse** — `backend/screener/parser.py`
3. **NER + skills** — `backend/screener/ner_extractor.py` (spaCy ORG/DATE + skill lexicon)
4. **Semantic match** — `backend/screener/semantic_scorer.py` (sentence-transformers embeddings)
5. **Baseline** — `backend/screener/tfidf_baseline.py` (TF-IDF cosine)
6. **Rank & filter** — `backend/screener/ranker.py` (`PASS_THRESHOLD` in `backend/config.py`)
7. **Bias** — `backend/screener/bias_demo.py` + `data/resumes/bias_*.txt`

## API endpoints

- `GET /api/health` — model readiness
- `GET /api/screen?job=se-intern` — full screening JSON for the dashboard
- `GET /api/bias` — name swap, phrase swap, method comparison chart data

## Scoring formula

```
final = 0.70 × semantic_similarity + 0.20 × skill_match + 0.10 × entity_signal
```

Candidates with `final >= 0.50` → **human review**; below → **rejected**.

Adjust weights and threshold in `backend/config.py` during your demo.

## License / ethics

Built for classroom presentation. Discuss Amazon's scrapped resume tool, transparency, and why identical resumes should not receive different scores.
