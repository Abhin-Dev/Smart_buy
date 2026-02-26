"""
SmartBuy — ML Utilities
Helper functions shared across ML modules.
"""
import pandas as pd
from app.firebase import db, firestore_to_dataframe, batch_add, delete_collection


def load_transactions() -> pd.DataFrame:
    """
    Load all transaction documents from the Firestore 'transactions'
    collection and return them as a pandas DataFrame.

    Returns:
        DataFrame with columns: invoiceNo, product, quantity, price,
        customerId, datetime
    """
    df = firestore_to_dataframe("transactions")
    if df.empty:
        return pd.DataFrame()

    # Rename Firestore field names to standard ML column names
    df = df.rename(columns={
        "invoice_no": "invoiceNo",
        "product": "product",
        "quantity": "quantity",
        "price": "price",
        "customer_id": "customerId",
        "date_time": "datetime",
    })

    # Parse datetime strings
    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
    df = df.dropna(subset=["datetime"])

    return df


def save_clusters(rfm_df: pd.DataFrame):
    """
    Save customer cluster assignments to the Firestore 'customers' collection.
    Clears old data before writing.
    """
    delete_collection("customers")

    records = []
    for _, row in rfm_df.iterrows():
        records.append({
            "customer_id": str(row["customerId"]),
            "cluster_label": int(row["cluster"]),
            "recency": float(row["recency"]),
            "frequency": float(row["frequency"]),
            "monetary": float(row["monetary"]),
        })

    batch_add("customers", records)


def save_rules(rules_df: pd.DataFrame):
    """
    Save association rules to the Firestore 'recommendations' collection.
    Clears old data before writing.
    """
    delete_collection("recommendations")

    records = []
    for _, row in rules_df.iterrows():
        records.append({
            "productA": str(row["productA"]),
            "productB": str(row["productB"]),
            "support": round(float(row["support"]), 4),
            "confidence": round(float(row["confidence"]), 4),
            "lift": round(float(row["lift"]), 4),
        })

    batch_add("recommendations", records)
