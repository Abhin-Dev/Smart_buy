"""
SmartBuy — Recommendations Route
GET /recommendations?customer_id= — Fetch product recommendations.
Uses Firestore for data persistence.
"""
from fastapi import APIRouter, Query
from app.ml.recommender import get_recommendations
from app.schemas import RecommendationResponse, RecommendationItem

router = APIRouter()


@router.get("/recommendations", response_model=RecommendationResponse)
def get_recommendations_endpoint(
    customer_id: str = Query(None, description="Optional customer ID for personalised results"),
):
    """
    Generate product recommendations using Apriori association rules.

    If customer_id is provided, recommendations are personalised based on
    the customer's cluster membership — filtering rules to focus on
    products typically purchased by similar customers.

    Returns:
      - trending_products: top-N most purchased products
      - recommendations: association rules with confidence, lift, support
    """
    result = get_recommendations(customer_id)

    return RecommendationResponse(
        customer_id=result["customer_id"],
        cluster_label=result["cluster_label"],
        trending_products=result["trending_products"],
        recommendations=[
            RecommendationItem(**rec) for rec in result["recommendations"]
        ],
    )
