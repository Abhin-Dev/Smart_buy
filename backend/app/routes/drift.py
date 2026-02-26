"""
SmartBuy — Drift Report Route
GET /drift_report — Full drift analysis across all time windows.
Uses Firestore for data persistence.
"""
from fastapi import APIRouter
from app.ml.drift import detect_drift_for_window, WINDOWS
from app.schemas import DriftReportResponse, TrendResponse, TrendItem

router = APIRouter()


@router.get("/drift_report", response_model=DriftReportResponse)
def get_drift_report():
    """
    Generate a comprehensive drift report covering all time windows
    (1 hour, 24 hours, 7 days).

    For each window, returns products with their trend classification
    and percentage change in purchase frequency.
    """
    windows = []

    for window_key in WINDOWS:
        items = detect_drift_for_window(window_key)

        windows.append(
            TrendResponse(
                window=window_key,
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
        )

    return DriftReportResponse(windows=windows)
