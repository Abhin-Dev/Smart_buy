"""
SmartBuy — Customer Segmentation (K-Means)
Clusters customers based on RFM features using K-Means algorithm.
Data persistence uses Firebase Firestore.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from app.firebase import db, delete_collection, batch_add

# -------------------------------------------------------------------
# Number of clusters — 4 segments provide a good balance of granularity
# Labels: 0 = At Risk, 1 = Loyal, 2 = Big Spenders, 3 = New Customers
# (exact meaning depends on actual data distribution)
# -------------------------------------------------------------------
N_CLUSTERS = 4

# Human-readable labels for each cluster (mapped after fitting)
CLUSTER_NAMES = {
    0: "At Risk",
    1: "Loyal",
    2: "Big Spenders",
    3: "New Customers",
}


def run_segmentation(rfm: pd.DataFrame) -> pd.DataFrame:
    """
    Run K-Means clustering on RFM data and save results to Firestore.

    Steps:
      1. Scale RFM features with StandardScaler
      2. Fit K-Means with N_CLUSTERS
      3. Assign cluster labels
      4. Write results to 'customers' Firestore collection
    
    Returns the RFM DataFrame with cluster labels attached.
    """
    # Extract numeric features
    features = rfm[["recency", "frequency", "monetary"]].values

    # Standardise features so K-Means treats them equally
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # Fit K-Means
    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    rfm["cluster_label"] = kmeans.fit_predict(features_scaled)

    # ── Save to Firestore ─────────────────────────────────────────
    # Clear old cluster data first
    delete_collection("customers")

    # Build documents and batch write
    records = []
    for _, row in rfm.iterrows():
        records.append({
            "customer_id": str(row["CustomerID"]),
            "cluster_label": int(row["cluster_label"]),
            "recency": float(row["recency"]),
            "frequency": float(row["frequency"]),
            "monetary": float(row["monetary"]),
        })

    batch_add("customers", records)

    return rfm
