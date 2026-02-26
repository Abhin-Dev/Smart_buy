"""
SmartBuy — Upload Route
POST /upload_dataset — Upload a CSV retail dataset.
Uses Firebase Firestore for data persistence.
Runs ML pipeline and returns accuracy metrics.
"""
import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import UploadResponse
from app.ml.preprocessing import validate_columns, clean_data, run_full_pipeline
from app.ml.trainer import train_models

router = APIRouter()


@router.post("/upload_dataset", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV retail transaction dataset.

    Steps:
      1. Read the CSV from the uploaded file
      2. Validate that required columns are present
      3. Run the full preprocessing + ML pipeline
      4. Run ML training (K-Means + Apriori) and collect metrics
      5. Return a preview of the uploaded data along with ML accuracy
    """
    # Read CSV into pandas DataFrame
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    # Validate columns
    if not validate_columns(df):
        raise HTTPException(
            status_code=400,
            detail="CSV must contain columns: InvoiceNo, Product, Quantity, Price, CustomerID, DateTime",
        )

    # Run the full preprocessing pipeline (clean → store → segment → drift)
    try:
        result = run_full_pipeline(df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Run ML training pipeline and collect accuracy metrics
    try:
        train_result = train_models()
    except Exception:
        train_result = None

    # Build ML metrics summary
    ml_metrics = None
    if train_result and train_result.get("status") == "success":
        ml_metrics = {
            "silhouette_score": train_result.get("silhouette_score"),
            "clusters_created": train_result.get("clusters_created", 0),
            "customers_segmented": train_result.get("customers_segmented", 0),
            "rules_generated": train_result.get("rules_generated", 0),
            "avg_confidence": train_result.get("avg_confidence"),
            "avg_lift": train_result.get("avg_lift"),
            "cluster_summary": train_result.get("cluster_summary", []),
        }

    # Build a preview (first 10 rows)
    preview_df = clean_data(df).head(10)
    preview = preview_df.to_dict(orient="records")

    # Convert any Timestamp objects to strings for JSON serialisation
    for row in preview:
        for key, val in row.items():
            if isinstance(val, pd.Timestamp):
                row[key] = val.isoformat()

    return UploadResponse(
        message=f"Dataset uploaded successfully. {result['rows_inserted']} rows stored, "
                f"{result['customers_segmented']} customers segmented.",
        rows_inserted=result["rows_inserted"],
        columns=list(df.columns),
        preview=preview,
        ml_metrics=ml_metrics,
    )
