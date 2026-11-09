"""Reproduce data generation, training, evaluation, figures, and tests on CPU."""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent


def run(command: list[str]) -> None:
    print("\n>", " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, check=True)


def main() -> None:
    python = sys.executable
    for script in [
        "src/generate_data.py",
        "src/generate_challenge.py",
        "src/validate_data.py",
        "src/train_models.py",
        "src/train_duplicates.py",
        "src/evaluate_challenge.py",
        "src/evaluate_duplicate_ablation.py",
        "src/make_figures.py",
    ]:
        run([python, script])
    run([python, "-m", "unittest", "discover", "-s", "tests", "-v"])
    print("\nPipeline completed. See results/ and docs/EVALUATION_REPORT.md.")


if __name__ == "__main__":
    main()
