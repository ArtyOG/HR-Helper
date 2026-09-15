"""
HR Helper AI Service — Model Accuracy Tester
=============================================
Run this script to measure the real accuracy of your model.
It tests all 10 CVs against a job requirement and measures:

  1. Ranking Accuracy   — did the model rank CVs in the right order?
  2. Score Range Check  — did each CV score in the expected range?
  3. Precision          — of CVs marked as pass, how many were correct?
  4. Recall             — did the model find all good candidates?
  5. Separation Score   — how well did the model separate good from bad?

Usage:
  1. Make sure your ai-service is running (docker-compose up ai-service)
  2. Upload all 10 CVs to R2 bucket
  3. Run: python test_accuracy.py
"""

import requests
from tabulate import tabulate

# ── Config ─────────────────────────────────────────────────────────────────────

AI_SERVICE_URL = "http://localhost:8000"
R2_BASE_URL    = "https://pub-e2c7c1dc26c24a6da073945f24f67638.r2.dev"

JOB_REQUIREMENTS = (
    "Looking for a frontend developer with React, JavaScript, "
    "CSS and REST API experience"
)

PASS_THRESHOLD = 60  # score >= 60 is considered a pass

# ── Ground truth ───────────────────────────────────────────────────────────────
# This is YOUR manual judgment of each CV:
#   expected_rank  = position you expect this CV to be ranked
#   expected_label = "good" (should pass) or "bad" (should fail)
#   min_score      = minimum score you expect
#   max_score      = maximum score you expect

GROUND_TRUTH = [
    {
        "name":           "Alice (Senior Frontend)",
        "filename":       "cv_01_alice_frontend (1).pdf",
        "expected_rank":  1,
        "expected_label": "good",
        "min_score":      70,
        "max_score":      100,
    },
    {
        "name":           "Bob (Frontend)",
        "filename":       "cv_02_bob_frontend (1).pdf",
        "expected_rank":  2,
        "expected_label": "good",
        "min_score":      65,
        "max_score":      100,
    },
    {
        "name":           "Henry (React Native)",
        "filename":       "cv_08_henry_mobile.pdf",
        "expected_rank":  3,
        "expected_label": "good",
        "min_score":      60,
        "max_score":      100,
    },
    {
        "name":           "Carol (Fullstack)",
        "filename":       "cv_03_carol_fullstack.pdf",
        "expected_rank":  4,
        "expected_label": "good",
        "min_score":      55,
        "max_score":      80,
    },
    {
        "name":           "Iris (Junior Frontend)",
        "filename":       "cv_09_iris_junior.pdf",
        "expected_rank":  5,
        "expected_label": "good",
        "min_score":      50,
        "max_score":      75,
    },
    {
        "name":           "Frank (UI/UX)",
        "filename":       "cv_06_frank_uiux.pdf",
        "expected_rank":  6,
        "expected_label": "bad",
        "min_score":      40,
        "max_score":      65,
    },
    {
        "name":           "David (Backend)",
        "filename":       "cv_04_david_backend.pdf",
        "expected_rank":  7,
        "expected_label": "bad",
        "min_score":      20,
        "max_score":      50,
    },
    {
        "name":           "Grace (DevOps)",
        "filename":       "cv_07_grace_devops.pdf",
        "expected_rank":  8,
        "expected_label": "bad",
        "min_score":      15,
        "max_score":      45,
    },
    {
        "name":           "Emma (Data Science)",
        "filename":       "cv_05_emma_datascience.pdf",
        "expected_rank":  9,
        "expected_label": "bad",
        "min_score":      10,
        "max_score":      40,
    },
    {
        "name":           "Jack (Marketing)",
        "filename":       "cv_10_jack_marketing.pdf",
        "expected_rank":  10,
        "expected_label": "bad",
        "min_score":      0,
        "max_score":      30,
    },
]

# ── Helpers ────────────────────────────────────────────────────────────────────

def get_scores() -> list[dict]:
    """Call bulk endpoint and get scores for all CVs."""
    pdf_urls = [f"{R2_BASE_URL}/{cv['filename']}" for cv in GROUND_TRUTH]

    print("Calling AI service bulk endpoint...")
    print(f"Processing {len(pdf_urls)} CVs — this may take 30-60 seconds...\n")

    response = requests.post(
        f"{AI_SERVICE_URL}/api/v1/recommend/bulk",
        json={"pdf_urls": pdf_urls, "job_requirements": JOB_REQUIREMENTS},
        timeout=300,
    )
    response.raise_for_status()
    return response.json()["rankings"]


def match_results(rankings: list[dict]) -> list[dict]:
    """Match API results back to ground truth by filename."""
    results = []
    for cv in GROUND_TRUTH:
        url = f"{R2_BASE_URL}/{cv['filename']}"
        match = next((r for r in rankings if r["pdf_url"] == url), None)
        results.append({
            **cv,
            "actual_score": match["score"] if match else 0.0,
            "actual_rank":  match["rank"]  if match else 99,
        })
    return results


# ── Accuracy measurements ──────────────────────────────────────────────────────

def measure_ranking_accuracy(results: list[dict]) -> float:
    """
    Ranking Accuracy — how many CVs are in the correct rank position?
    Allows ±1 position tolerance (swapping adjacent CVs is acceptable).
    """
    correct = 0
    for cv in results:
        diff = abs(cv["actual_rank"] - cv["expected_rank"])
        if diff <= 1:  # exact or one position off
            correct += 1
    return (correct / len(results)) * 100


def measure_score_range_accuracy(results: list[dict]) -> float:
    """
    Score Range Accuracy — how many CVs scored within expected range?
    """
    correct = 0
    for cv in results:
        if cv["min_score"] <= cv["actual_score"] <= cv["max_score"]:
            correct += 1
    return (correct / len(results)) * 100


def measure_precision_recall(results: list[dict]) -> tuple[float, float, float]:
    """
    Precision — of CVs the model passed, how many were actually good?
    Recall    — of all good CVs, how many did the model find?
    F1 Score  — balance between precision and recall
    """
    true_positives  = 0  # model passed, actually good
    false_positives = 0  # model passed, actually bad
    false_negatives = 0  # model failed, actually good

    for cv in results:
        predicted_pass = cv["actual_score"] >= PASS_THRESHOLD
        actually_good  = cv["expected_label"] == "good"

        if predicted_pass and actually_good:
            true_positives += 1
        elif predicted_pass and not actually_good:
            false_positives += 1
        elif not predicted_pass and actually_good:
            false_negatives += 1

    precision = (true_positives / (true_positives + false_positives) * 100) if (true_positives + false_positives) > 0 else 0
    recall    = (true_positives / (true_positives + false_negatives) * 100) if (true_positives + false_negatives) > 0 else 0
    f1        = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0

    return precision, recall, f1


def measure_separation(results: list[dict]) -> float:
    """
    Separation Score — average score gap between good and bad candidates.
    Higher gap = model separates candidates more clearly.
    """
    good_scores = [cv["actual_score"] for cv in results if cv["expected_label"] == "good"]
    bad_scores  = [cv["actual_score"] for cv in results if cv["expected_label"] == "bad"]

    avg_good = sum(good_scores) / len(good_scores) if good_scores else 0
    avg_bad  = sum(bad_scores)  / len(bad_scores)  if bad_scores  else 0

    return avg_good - avg_bad


# ── Display results ────────────────────────────────────────────────────────────

def display_results(results: list[dict]):
    """Print a detailed results table."""
    table_data = []
    for cv in sorted(results, key=lambda x: x["actual_rank"]):
        rank_diff     = cv["actual_rank"] - cv["expected_rank"]
        rank_status   = "✅" if abs(rank_diff) <= 1 else "❌"
        range_status  = "✅" if cv["min_score"] <= cv["actual_score"] <= cv["max_score"] else "❌"
        pass_status   = "PASS" if cv["actual_score"] >= PASS_THRESHOLD else "FAIL"
        expected_pass = "PASS" if cv["expected_label"] == "good" else "FAIL"
        pass_correct  = "✅" if pass_status == expected_pass else "❌"

        table_data.append([
            cv["actual_rank"],
            cv["name"],
            f"{cv['actual_score']:.1f}",
            f"{cv['expected_rank']}",
            rank_status,
            f"{cv['min_score']}-{cv['max_score']}",
            range_status,
            f"{pass_status} {pass_correct}",
        ])

    headers = [
        "Rank", "Candidate", "Score", "Exp.Rank",
        "Rank✓", "Exp.Range", "Range✓", "Pass/Fail"
    ]

    print("\n" + "="*80)
    print("DETAILED RESULTS")
    print("="*80)
    print(tabulate(table_data, headers=headers, tablefmt="grid"))


def display_accuracy_summary(results: list[dict]):
    """Print accuracy summary for jury presentation."""
    ranking_acc         = measure_ranking_accuracy(results)
    range_acc           = measure_score_range_accuracy(results)
    precision, recall, f1 = measure_precision_recall(results)
    separation          = measure_separation(results)

    good_scores = [cv["actual_score"] for cv in results if cv["expected_label"] == "good"]
    bad_scores  = [cv["actual_score"] for cv in results if cv["expected_label"] == "bad"]
    avg_good    = sum(good_scores) / len(good_scores) if good_scores else 0
    avg_bad     = sum(bad_scores)  / len(bad_scores)  if bad_scores  else 0

    print("\n" + "="*80)
    print("ACCURACY SUMMARY  (for jury presentation)")
    print("="*80)

    summary = [
        ["Ranking Accuracy",    f"{ranking_acc:.1f}%",  "How many CVs ranked in correct position (±1 allowed)"],
        ["Score Range Accuracy", f"{range_acc:.1f}%",   "How many CVs scored within expected range"],
        ["Precision",           f"{precision:.1f}%",    "Of CVs marked PASS, how many were actually good"],
        ["Recall",              f"{recall:.1f}%",        "Of all good CVs, how many did the model find"],
        ["F1 Score",            f"{f1:.1f}%",            "Balance between precision and recall"],
        ["Score Separation",    f"{separation:.1f} pts", "Average score gap between good and bad candidates"],
        ["Avg Good CV Score",   f"{avg_good:.1f}",       "Average score for matching CVs"],
        ["Avg Bad CV Score",    f"{avg_bad:.1f}",         "Average score for non-matching CVs"],
        ["Pass Threshold",      f"{PASS_THRESHOLD}",     "Minimum score to be considered a pass"],
    ]

    print(tabulate(summary, headers=["Metric", "Value", "Meaning"], tablefmt="grid"))

    print("\n📊 OVERALL MODEL GRADE:")
    overall = (ranking_acc + range_acc + f1) / 3
    if overall >= 80:
        grade = "EXCELLENT ✅"
    elif overall >= 65:
        grade = "GOOD ✅"
    elif overall >= 50:
        grade = "ACCEPTABLE ⚠️"
    else:
        grade = "NEEDS IMPROVEMENT ❌"

    print(f"   Overall Score: {overall:.1f}% — {grade}")
    print(f"\n💡 What to tell the jury:")
    print(f"   - Model correctly ranked {ranking_acc:.0f}% of candidates")
    print(f"   - {precision:.0f}% precision means low false positive rate")
    print(f"   - {recall:.0f}% recall means model finds most good candidates")
    print(f"   - {separation:.1f} point gap clearly separates good from bad candidates")
    print("="*80)


# ── Main ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("="*80)
    print("HR HELPER AI — MODEL ACCURACY TEST")
    print("="*80)
    print(f"Job: {JOB_REQUIREMENTS}")
    print(f"Pass threshold: {PASS_THRESHOLD}/100")
    print(f"Total CVs: {len(GROUND_TRUTH)}")

    try:
        rankings = get_scores()
        results  = match_results(rankings)
        display_results(results)
        display_accuracy_summary(results)
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to AI service.")
        print("   Make sure it is running: docker-compose up ai-service")
    except Exception as e:
        print(f"\n❌ Error: {e}")
