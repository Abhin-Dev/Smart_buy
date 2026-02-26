"""
SmartBuy — Train Model Route
POST /train-model — Trigger the ML training pipeline.
"""
from fastapi import APIRouter
from app.ml.trainer import train_models

router = APIRouter()


@router.post("/train-model")
def train_model_endpoint():
    """
    Run the full ML training pipeline:
      1. Load transactions from Firestore
      2. Preprocess (clean, RFM, baskets)
      3. K-Means customer segmentation
      4. Apriori association rule mining

    Returns:
      - clusters_created: number of clusters
      - rules_generated: number of association rules found
    """
    result = train_models()
    return result
