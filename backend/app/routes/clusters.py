"""
SmartBuy — Clusters Route
GET /clusters — Return customer segmentation data from Firestore.
"""
from fastapi import APIRouter
from app.firebase import db, firestore_to_dataframe
from app.schemas import ClusterResponse, ClusterSummary, ClusterOut

router = APIRouter()


@router.get("/clusters", response_model=ClusterResponse)
def get_clusters():
    """
    Fetch all customer cluster assignments and summary statistics
    from the 'customers' Firestore collection.

    Returns:
      - Total number of customers
      - Number of clusters
      - Per-cluster summary (count, avg RFM)
      - Full customer list with cluster labels
    """
    # Read all customer documents from Firestore
    df = firestore_to_dataframe("customers")

    if df.empty:
        return ClusterResponse(
            total_customers=0,
            num_clusters=0,
            clusters=[],
            customers=[],
        )

    # Build per-cluster summaries using Pandas groupby
    summary = df.groupby("cluster_label").agg(
        count=("customer_id", "count"),
        avg_recency=("recency", "mean"),
        avg_frequency=("frequency", "mean"),
        avg_monetary=("monetary", "mean"),
    ).reset_index()

    cluster_summaries = [
        ClusterSummary(
            cluster_label=int(row["cluster_label"]),
            count=int(row["count"]),
            avg_recency=round(float(row["avg_recency"]), 2),
            avg_frequency=round(float(row["avg_frequency"]), 2),
            avg_monetary=round(float(row["avg_monetary"]), 2),
        )
        for _, row in summary.iterrows()
    ]

    customer_list = [
        ClusterOut(
            customer_id=str(row["customer_id"]),
            cluster_label=int(row["cluster_label"]),
            recency=float(row["recency"]),
            frequency=float(row["frequency"]),
            monetary=float(row["monetary"]),
        )
        for _, row in df.iterrows()
    ]

    return ClusterResponse(
        total_customers=len(df),
        num_clusters=len(cluster_summaries),
        clusters=cluster_summaries,
        customers=customer_list,
    )
