"""
SmartBuy — Customer Segmentation via K-Means
Clusters customers based on RFM features.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from app.ml.utils import save_clusters


def run_kmeans(rfm_df: pd.DataFrame, k: int = 4) -> dict:
    """
    Run K-Means clustering on RFM features.

    Steps:
      1. Scale RFM features using StandardScaler
      2. Apply KMeans with k clusters
      3. Assign cluster label to each customer
      4. Save clusters to the database (customers collection)

    Args:
        rfm_df: DataFrame with columns: customerId, recency, frequency, monetary
        k: Number of clusters (default 4)

    Returns:
        Dict with cluster_count and summary statistics per cluster.
    """
    if rfm_df.empty:
        return {"cluster_count": 0, "summary": []}

    # ── Step 1: Scale features ────────────────────────────────────
    features = rfm_df[["recency", "frequency", "monetary"]].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # ── Step 2: Apply K-Means ─────────────────────────────────────
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    rfm_df = rfm_df.copy()
    rfm_df["cluster"] = kmeans.fit_predict(features_scaled)

    # ── Step 3: Save to database ──────────────────────────────────
    save_clusters(rfm_df)

    # ── Step 4: Build summary statistics ──────────────────────────
    summary = rfm_df.groupby("cluster").agg(
        count=("customerId", "count"),
        avg_recency=("recency", "mean"),
        avg_frequency=("frequency", "mean"),
        avg_monetary=("monetary", "mean"),
    ).reset_index()

    summary_list = [
        {
            "cluster": int(row["cluster"]),
            "count": int(row["count"]),
            "avg_recency": round(float(row["avg_recency"]), 2),
            "avg_frequency": round(float(row["avg_frequency"]), 2),
            "avg_monetary": round(float(row["avg_monetary"]), 2),
        }
        for _, row in summary.iterrows()
    ]

    return {
        "cluster_count": k,
        "customers_segmented": len(rfm_df),
        "summary": summary_list,
    }
