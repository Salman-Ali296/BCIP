"""Create report figures from saved metrics; never recomputes or selects models."""
from pathlib import Path
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    challenge = pd.read_csv(ROOT / "results" / "challenge_metrics.csv").set_index("task")
    tasks = ["category", "sentiment", "priority"]
    saved = json.loads((ROOT / "results" / "classification_summary.json").read_text())
    in_distribution = [saved["tasks"][t]["test"]["macro_f1"] for t in tasks]
    challenge_scores = [challenge.loc[t, "macro_f1"] for t in tasks]
    ablation = pd.read_csv(ROOT / "results" / "duplicate_ablation.csv")

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    x = range(len(tasks))
    width = 0.36
    axes[0].bar([i - width / 2 for i in x], in_distribution, width, label="Incident-held-out test")
    axes[0].bar([i + width / 2 for i in x], challenge_scores, width, label="Template-held-out challenge")
    axes[0].set_xticks(list(x), tasks)
    axes[0].set_ylim(0, 1.08)
    axes[0].set_ylabel("Macro F1")
    axes[0].set_title("Classification: in-distribution vs wording shift")
    axes[0].legend(fontsize=8)
    axes[0].grid(axis="y", alpha=0.2)

    labels = ["Original", "References\nmasked", "References + numbers\nmasked"]
    axes[1].bar(labels, ablation.f1, color=["#3568b8", "#e29a35", "#b84a4a"])
    axes[1].set_ylim(0, 1.08)
    axes[1].set_ylabel("F1")
    axes[1].set_title("Duplicate detector: cue-ablation stress test")
    axes[1].grid(axis="y", alpha=0.2)
    for ax in axes:
        for container in ax.containers:
            ax.bar_label(container, fmt="%.3f", fontsize=8, padding=2)
    fig.suptitle("Business Complaint Intelligence Platform — baseline evaluation")
    fig.tight_layout()
    fig.savefig(ROOT / "results" / "performance_overview.png", dpi=180)
    plt.close(fig)


if __name__ == "__main__":
    main()
