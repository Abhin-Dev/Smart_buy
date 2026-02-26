"""
SmartBuy — ML Preprocessing
Cleans transaction data, builds basket format, and computes RFM metrics.
"""
import pandas as pd
import numpy as np


def prepare_transactions(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Clean and transform raw transaction data.

    Steps:
      1. Remove null values
      2. Convert datetime to timestamp
      3. Group rows by invoiceNo into basket transactions
      4. Compute RFM (Recency, Frequency, Monetary) per customer

    Args:
        df: Raw transaction DataFrame with columns:
            invoiceNo, product, quantity, price, customerId, datetime

    Returns:
        transactions_df: Cleaned transaction DataFrame
        rfm_df: RFM metrics per customer
    """
    # ── Step 1: Remove nulls and invalid rows ─────────────────────
    df = df.dropna()
    df = df[df["quantity"] > 0]
    df = df[df["price"] > 0]
    df = df.reset_index(drop=True)

    if df.empty:
        return pd.DataFrame(), pd.DataFrame()

    # ── Step 2: Ensure datetime is proper type ────────────────────
    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
    df = df.dropna(subset=["datetime"])

    # ── Step 3: Add total price per line item ─────────────────────
    df["totalPrice"] = df["quantity"] * df["price"]

    # ── Step 4: Create product list per invoice (basket) ──────────
    baskets = (
        df.groupby("invoiceNo")["product"]
        .apply(list)
        .reset_index()
        .rename(columns={"product": "products"})
    )

    # Merge basket info back for reference
    transactions_df = df.copy()
    transactions_df["_basket"] = transactions_df["invoiceNo"].map(
        baskets.set_index("invoiceNo")["products"]
    )

    # ── Step 5: Compute RFM metrics per customer ──────────────────
    reference_date = df["datetime"].max() + pd.Timedelta(days=1)

    rfm_df = df.groupby("customerId").agg(
        recency=("datetime", lambda x: (reference_date - x.max()).days),
        frequency=("invoiceNo", "nunique"),
        monetary=("totalPrice", "sum"),
    ).reset_index()

    return transactions_df, rfm_df
