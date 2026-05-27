"""
TF-IDF + cosine similarity baseline (keyword-style matching).

Included so you can contrast "meaning-based" vs "word overlap" rankings in the UI.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def tfidf_scores(job_text: str, resume_texts: list[str]) -> list[float]:
    if not resume_texts:
        return []
    corpus = [job_text] + resume_texts
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    matrix = vectorizer.fit_transform(corpus)
    job_vec = matrix[0:1]
    resume_vecs = matrix[1:]
    sims = cosine_similarity(job_vec, resume_vecs)[0]
    return [max(0.0, min(1.0, float(s))) for s in sims]
