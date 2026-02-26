"""
SmartBuy — FastAPI Application
Main app entry with CORS, router includes, and Firebase Firestore.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, clusters, trends, recommendations, drift, train

# -------------------------------------------------------------------
# Firebase is initialized on import of firebase.py
# (no table creation needed — Firestore is schema-less)
# -------------------------------------------------------------------

# -------------------------------------------------------------------
# FastAPI application instance
# -------------------------------------------------------------------
app = FastAPI(
    title="SmartBuy API",
    description="Customer behaviour drift detection & dynamic recommendation system",
    version="1.0.0",
)

# -------------------------------------------------------------------
# CORS — allow the React frontend to talk to the API
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Include route modules
# -------------------------------------------------------------------
app.include_router(upload.router,          prefix="/api", tags=["Dataset Upload"])
app.include_router(clusters.router,        prefix="/api", tags=["Customer Segmentation"])
app.include_router(trends.router,          prefix="/api", tags=["Trends"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(drift.router,           prefix="/api", tags=["Drift Report"])
app.include_router(train.router,           prefix="/api", tags=["ML Training"])


@app.get("/", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "app": "SmartBuy API", "version": "1.0.0"}
