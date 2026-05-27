# Deploy for everyone to use

This project is **two parts**:

| Part | Host on | Why |
|------|---------|-----|
| **Website** (React) | [Netlify](https://netlify.com) | Official TanStack Start partner |
| **AI API** (Python + ML) | [Render](https://render.com) | Netlify cannot run spaCy + sentence-transformers |

**Render free tier (512MB):** the API runs in **lightweight mode** — TF-IDF + spaCy + skill matching (no PyTorch embeddings). Still real NLP; just not the heavy embedding model.

## 1. Push to GitHub

Already in your repo after setup — connect Netlify to that repository.

## 2. Deploy the Python API (Render)

1. Go to [render.com](https://render.com) → **New** → **Blueprint** (or Web Service).
2. Connect your GitHub repo.
3. Render reads `render.yaml` at the repo root.
4. Wait for the build (10–15 min first time: downloads spaCy + embedding model).
5. Copy your service URL, e.g. `https://resume-screener-api.onrender.com`.
6. Test: `https://YOUR-API.onrender.com/api/health` → JSON with `"status":"ok"`.

Free tier sleeps when idle; first request after sleep can take ~30–60 seconds.

## 3. Deploy the website (Netlify)

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
2. Select your repository.
3. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist/client`
4. **Site settings → Environment variables** → add:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com` (no trailing slash)
5. **Deploy site** → trigger **Clear cache and deploy** if you change `VITE_API_URL`.

Open your `*.netlify.app` URL → Screening → **Score & Rank** should call the live API.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Huge HTML “404” error on Score & Rank | `VITE_API_URL` missing or wrong; API not running |
| CORS error in browser console | Set `ALLOWED_ORIGINS=*` on Render (already in `render.yaml`) |
| API health never loads | Render service still building or asleep — wait and retry |

## Local vs production

- **Local:** `uvicorn` on :8000 + `npm run dev` on :3000 (Vite proxies `/api`).
- **Production:** browser calls `VITE_API_URL + /api/screen` directly.
