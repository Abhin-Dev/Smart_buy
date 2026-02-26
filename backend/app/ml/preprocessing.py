"""
SmartBuy — ML Preprocessing Pipeline
Cleans raw transaction data, computes RFM metrics, and builds basket format.
Data persistence uses Firebase Firestore.
"""
import pandas as pd
import numpy as np
from datetime import datetime
from app.firebase import db, batch_add


# -------------------------------------------------------------------
# Required columns in the uploaded CSV
# -------------------------------------------------------------------
REQUIRED_COLUMNS = {"InvoiceNo", "Product", "Quantity", "Price", "CustomerID", "DateTime"}


def validate_columns(df: pd.DataFrame) -> bool:
    """Check that the DataFrame contains all required columns."""
    return REQUIRED_COLUMNS.issubset(set(df.columns))


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows with null values and invalid quantities/prices.
    Returns a cleaned copy of the DataFrame.
    """
    df = df.dropna()
    df = df[df["Quantity"] > 0]
    df = df[df["Price"] > 0]
    df["DateTime"] = pd.to_datetime(df["DateTime"], errors="coerce")
    df = df.dropna(subset=["DateTime"])
    return df.reset_index(drop=True)


def compute_rfm(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute Recency, Frequency, and Monetary metrics per customer.

    Recency  = days since last purchase (relative to the latest date in data)
    Frequency = number of unique invoices
    Monetary  = total spend (Quantity × Price)
    """
    df["TotalPrice"] = df["Quantity"] * df["Price"]
    reference_date = df["DateTime"].max() + pd.Timedelta(days=1)

    rfm = df.groupby("CustomerID").agg(
        recency=("DateTime", lambda x: (reference_date - x.max()).days),
        frequency=("InvoiceNo", "nunique"),
        monetary=("TotalPrice", "sum"),
    ).reset_index()

    return rfm


def build_basket(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert transaction data into basket (one-hot) format.
    Rows = invoices, Columns = products, Values = 1/0.
    Used as input for the Apriori algorithm.
    """
    basket = (
        df.groupby(["InvoiceNo", "Product"])["Quantity"]
        .sum()
        .unstack(fill_value=0)
        .map(lambda x: 1 if x > 0 else 0)
    )
    return basket


def store_transactions(df: pd.DataFrame) -> int:
    """
    Insert cleaned transaction rows into the Firestore 'transactions' collection.
    Each row becomes a JSON document.
    Returns the number of rows inserted.
    """
    records = []
    for _, row in df.iterrows():
        records.append({
            "invoice_no": str(row["InvoiceNo"]),
            "product": str(row["Product"]),
            "quantity": int(row["Quantity"]),
            "price": float(row["Price"]),
            "customer_id": str(row["CustomerID"]),
            "date_time": row["DateTime"].isoformat(),  # Store as ISO string
        })

    # Batch write to Firestore
    batch_add("transactions", records)
    return len(records)


def run_full_pipeline(df: pd.DataFrame) -> dict:
    """
    Execute the complete preprocessing pipeline:
      1. Validate columns
      2. Clean data
      3. Store transactions in Firestore
      4. Compute RFM metrics
      5. Run segmentation (imported here to avoid circular imports)
      6. Run drift detection
    Returns a summary dict.
    """
    from app.ml.segmentation import run_segmentation
    from app.ml.drift import compute_drift_report

    # Step 1 — Validate
    if not validate_columns(df):
        raise ValueError(f"CSV must contain columns: {REQUIRED_COLUMNS}")

    # Step 2 — Clean
    df_clean = clean_data(df)
    if df_clean.empty:
        raise ValueError("No valid rows after cleaning.")

    # Step 3 — Store in Firestore
    rows = store_transactions(df_clean)

    # Step 4 — RFM
    rfm = compute_rfm(df_clean)

    # Step 5 — Segmentation
    run_segmentation(rfm)

    # Step 6 — Drift detection
    compute_drift_report()

    return {
        "rows_inserted": rows,
        "customers_segmented": len(rfm),
    }
