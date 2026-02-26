"""
SmartBuy — Behaviour Drift Detection
Sliding time-window analysis to detect changing purchase patterns.
Data persistence uses Firebase Firestore.
"""
import pandas as pd
from datetime import datetime, timedelta
from collections import Counter
from app.firebase import db, firestore_to_dataframe, delete_collection, batch_add

# -------------------------------------------------------------------
# Window definitions — label → timedelta
# -------------------------------------------------------------------
WINDOWS = {
    "1h":  timedelta(hours=1),
    "24h": timedelta(hours=24),
    "7d":  timedelta(days=7),
}

# Threshold for percentage change to flag as trend_up or trend_down
TREND_THRESHOLD = 20  # percent


def _get_product_counts(df: pd.DataFrame, start: datetime, end: datetime) -> dict:
    """
    Count how many times each product was purchased in [start, end).
    Works on a pre-loaded DataFrame rather than hitting Firestore repeatedly.
    Returns a dict of {product_name: count}.
    """
    mask = (df["date_time"] >= start) & (df["date_time"] < end)
    subset = df.loc[mask]
    if subset.empty:
        return {}
    return dict(Counter(subset["product"]))


def detect_drift_for_window(window_key: str) -> list[dict]:
    """
    Compare product frequencies between the current window and the
    previous window of the same size.

    Example for '24h':
      current  = [now - 24h, now)
      previous = [now - 48h, now - 24h)

    Returns a list of dicts with trend classification per product.
    """
    delta = WINDOWS[window_key]

    # Load all transactions from Firestore into a DataFrame
    df = firestore_to_dataframe("transactions")
    if df.empty:
        return []

    # Parse date_time strings into datetime objects
    df["date_time"] = pd.to_datetime(df["date_time"], errors="coerce")
    df = df.dropna(subset=["date_time"])
    if df.empty:
        return []

    # Use the latest transaction date as "now" (works with historical data)
    now = df["date_time"].max()
    current_start = now - delta
    previous_start = current_start - delta

    current_counts = _get_product_counts(df, current_start, now)
    previous_counts = _get_product_counts(df, previous_start, current_start)

    # Build trend items
    all_products = set(current_counts.keys()) | set(previous_counts.keys())
    results = []

    for product in all_products:
        curr = current_counts.get(product, 0)
        prev = previous_counts.get(product, 0)

        # Classify trend
        if prev == 0 and curr > 0:
            trend = "new_trend"
            change_pct = 100.0
        elif prev == 0 and curr == 0:
            continue  # skip products with no activity
        else:
            change_pct = ((curr - prev) / prev) * 100
            if change_pct >= TREND_THRESHOLD:
                trend = "trend_up"
            elif change_pct <= -TREND_THRESHOLD:
                trend = "trend_down"
            else:
                trend = "stable"

        results.append({
            "product": product,
            "trend": trend,
            "current_count": curr,
            "previous_count": prev,
            "change_pct": round(change_pct, 2),
        })

    # Sort by absolute change (most significant drifts first)
    results.sort(key=lambda x: abs(x["change_pct"]), reverse=True)
    return results


def compute_drift_report() -> dict:
    """
    Run drift detection for ALL windows and cache results in the
    Firestore 'trends' collection. Called after each dataset upload.
    Returns the full report dict.
    """
    now = datetime.utcnow()

    # Clear old trend reports
    delete_collection("trends")

    report = {}
    for window_key in WINDOWS:
        items = detect_drift_for_window(window_key)

        # Cache each item in Firestore
        records = []
        for item in items:
            records.append({
                "window": window_key,
                "product": item["product"],
                "trend": item["trend"],
                "current_count": item["current_count"],
                "previous_count": item["previous_count"],
                "change_pct": item["change_pct"],
                "computed_at": now.isoformat(),
            })

        if records:
            batch_add("trends", records)

        report[window_key] = items

    return report
