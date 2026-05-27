"""
Entry point for the API server and command-line demo.

API:  uvicorn backend.main:app --reload --port 8000
CLI:  python -m backend.main --screen
      python -m backend.main --bias
"""
from __future__ import annotations

import argparse
import sys


def _print_screening() -> None:
    from backend.screener.ranker import run_screening

    result = run_screening()
    print(f"\nJob: {result['job_title']}\n{'-' * 60}")
    for i, c in enumerate(result["candidates"], 1):
        status = "→ HUMAN REVIEW" if c["decision"] == "human_review" else "✗ REJECTED"
        print(
            f"{i:>2}  {c['name']:<22}  sem={c['semantic_score']:.2f}  "
            f"skills={c['skill_match']:.2f}  final={c['final_score']:.2f}  {status}"
        )
    rejected = [c["name"] for c in result["candidates"] if c["decision"] == "rejected"]
    if rejected:
        print(f"\nFiltered out: {', '.join(rejected)}")


def _print_bias() -> None:
    from backend.screener.bias_demo import run_bias_demo

    data = run_bias_demo()
    for label, pair in [("NAME SWAP", data["name_swap"]), ("PHRASE SWAP", data["phrase_swap"])]:
        print(f"\n--- {label} ---")
        print(f"  {pair['variant_a']['label']}: {pair['variant_a']['final_score']:.2f}")
        print(f"  {pair['variant_b']['label']}: {pair['variant_b']['final_score']:.2f}")
        print(f"  Δ = {pair['delta']:+.2f}")
        print(f"  {pair['note']}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="AI Resume Screener (educational demo)")
    parser.add_argument("--screen", action="store_true", help="Run screening in the terminal")
    parser.add_argument("--bias", action="store_true", help="Run bias demonstration in the terminal")
    parser.add_argument("--serve", action="store_true", help="Start the API server on port 8000")
    args = parser.parse_args(argv)

    if args.serve:
        import uvicorn

        uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
        return 0

    if args.bias:
        _print_bias()
        return 0

    if args.screen or len(sys.argv) == 1:
        _print_screening()
        return 0

    parser.print_help()
    return 1


# Uvicorn imports `app` from this module
from backend.screener.api import app  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
