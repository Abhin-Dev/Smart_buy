"""
SmartBuy — Trends Route
GET /trends?window=1h — Fetch behaviour trends for a given time window.
Uses Firestore for data persistence.
"""
from fastapi import APIRouter, Query
from app.ml.drift import detect_drift_for_window, WINDOWS
from app.schemas import TrendResponse, TrendItem

router = APIRouter()


@router.get("/trends", response_model=TrendResponse)
def get_trends(
    window: str = Query("24h", description="Time window: 1h, 24h, or 7d"),
):
    """
    Analyse purchase trends within the specified time window.
    Compares product frequencies between the current and previous window
    to detect trend_up, trend_down, and new_trend patterns.

    Query params:
      - window: '1h', '24h', or '7d' (default '24h')
    """
    if window not in WINDOWS:
        window = "24h"

    items = detect_drift_for_window(window)

    return TrendResponse(
        window=window,
        items=[
            TrendItem(
                product=item["product"],
                trend=item["trend"],
                current_count=item["current_count"],
                previous_count=item["previous_count"],
                change_pct=item["change_pct"],
            )
            for item in items
        ],
    )
