"""
SmartBuy — ML Training Controller
Orchestrates the full ML training pipeline:
  load data → preprocess → cluster → association rules
Computes accuracy metrics (silhouette score, avg confidence/lift).
"""
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
from app.ml.utils import load_transactions
from app.ml.preprocess import prepare_transactions
from app.ml.clustering import run_kmeans
from app.ml.association import run_apriori


def train_models() -> dict:
    """
    Execute the complete ML training pipeline.

    Flow:
      1. Load transactions from Firestore
      2. Preprocess data (clean, build baskets, compute RFM)
      3. Run K-Means clustering on RFM features
      4. Compute silhouette score for clustering quality
      5. Run Apriori association rule mining on baskets
      6. Compute average confidence and lift for rule quality
      7. Return summary with accuracy metrics

    Returns:
        Dict with clusters_created, rules_generated, and accuracy metrics.
    """
    # ── Step 1: Load transactions from database ───────────────────
    raw_df = load_transactions()
    if raw_df.empty:
        return {
            "status": "error",
            "message": "No transaction data found. Upload a dataset first.",
            "clusters_created": 0,
            "rules_generated": 0,
        }

    # ── Step 2: Preprocess data ───────────────────────────────────
    transactions_df, rfm_df = prepare_transactions(raw_df)
    if transactions_df.empty or rfm_df.empty:
        return {
            "status": "error",
            "message": "Preprocessing failed — no valid data after cleaning.",
            "clusters_created": 0,
            "rules_generated": 0,
        }

    # ── Step 3: Run K-Means clustering ────────────────────────────
    cluster_result = run_kmeans(rfm_df, k=4)

    # ── Step 4: Compute Silhouette Score (clustering accuracy) ────
    sil_score = None
    if len(rfm_df) > 4:  # Need more samples than clusters
        try:
            features = rfm_df[["recency", "frequency", "monetary"]].values
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            labels = rfm_df["cluster"].values
            sil_score = round(float(silhouette_score(features_scaled, labels)), 4)
        except Exception:
            sil_score = None

    # ── Step 5: Run Apriori association rules ─────────────────────
    rules_result = run_apriori(transactions_df)

    # ── Step 6: Compute average rule metrics ──────────────────────
    avg_confidence = None
    avg_lift = None
    rules_list = rules_result.get("rules", [])
    if rules_list:
        avg_confidence = round(
            sum(r["confidence"] for r in rules_list) / len(rules_list), 4
        )
        avg_lift = round(
            sum(r["lift"] for r in rules_list) / len(rules_list), 4
        )

    # ── Step 7: Return summary ────────────────────────────────────
    return {
        "status": "success",
        "message": "ML models trained successfully.",
        "clusters_created": cluster_result["cluster_count"],
        "customers_segmented": cluster_result.get("customers_segmented", 0),
        "rules_generated": rules_result["rules_count"],
        "silhouette_score": sil_score,
        "avg_confidence": avg_confidence,
        "avg_lift": avg_lift,
        "cluster_summary": cluster_result.get("summary", []),
        "top_rules": rules_result.get("rules", [])[:10],
    }
