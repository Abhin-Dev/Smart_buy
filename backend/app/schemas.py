"""
SmartBuy — Pydantic Schemas
Request / response validation models for the REST API.
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ── Transaction ────────────────────────────────────────────────────
class TransactionOut(BaseModel):
    id: int
    invoice_no: str
    product: str
    quantity: int
    price: float
    customer_id: str
    date_time: datetime

    class Config:
        from_attributes = True


# ── Upload Response ────────────────────────────────────────────────
class UploadResponse(BaseModel):
    message: str
    rows_inserted: int
    columns: List[str]
    preview: List[dict]
    ml_metrics: Optional[dict] = None


# ── Cluster ────────────────────────────────────────────────────────
class ClusterOut(BaseModel):
    customer_id: str
    cluster_label: int
    recency: float
    frequency: float
    monetary: float

    class Config:
        from_attributes = True


class ClusterSummary(BaseModel):
    cluster_label: int
    count: int
    avg_recency: float
    avg_frequency: float
    avg_monetary: float


class ClusterResponse(BaseModel):
    total_customers: int
    num_clusters: int
    clusters: List[ClusterSummary]
    customers: List[ClusterOut]


# ── Drift / Trends ─────────────────────────────────────────────────
class TrendItem(BaseModel):
    product: str
    trend: str             # trend_up | trend_down | new_trend
    current_count: int
    previous_count: int
    change_pct: float


class TrendResponse(BaseModel):
    window: str
    computed_at: Optional[datetime] = None
    items: List[TrendItem]


class DriftReportResponse(BaseModel):
    windows: List[TrendResponse]


# ── Recommendations ─────────────────────────────────────────────────
class RecommendationItem(BaseModel):
    antecedent: str
    consequent: str
    confidence: float
    lift: float
    support: float


class RecommendationResponse(BaseModel):
    customer_id: Optional[str] = None
    cluster_label: Optional[int] = None
    trending_products: List[str]
    recommendations: List[RecommendationItem]
