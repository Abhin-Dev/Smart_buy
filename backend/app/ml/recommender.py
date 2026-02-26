"""
SmartBuy — Recommendation Engine
Uses Apriori association rules to find product recommendations.
Personalises results using customer cluster membership.
Data persistence uses Firebase Firestore.
"""
import pandas as pd
from collections import Counter
from mlxtend.frequent_patterns import apriori, association_rules
from app.firebase import db, firestore_to_dataframe
from app.ml.preprocessing import build_basket

# -------------------------------------------------------------------
# Apriori parameters
# -------------------------------------------------------------------
MIN_SUPPORT = 0.02        # minimum fraction of transactions containing itemset
MIN_CONFIDENCE = 0.1      # minimum confidence for association rules
MIN_LIFT = 1.0            # only rules with lift > 1 (positive correlation)


def _load_recent_transactions(limit: int = 5000) -> pd.DataFrame:
    """
    Load the most recent transactions from Firestore as a DataFrame.
    Sorted by date_time descending, limited to `limit` rows.
    """
    df = firestore_to_dataframe("transactions")
    if df.empty:
        return pd.DataFrame()

    # Parse dates and sort
    df["date_time"] = pd.to_datetime(df["date_time"], errors="coerce")
    df = df.dropna(subset=["date_time"])
    df = df.sort_values("date_time", ascending=False).head(limit)

    # Rename columns to match ML function expectations
    df = df.rename(columns={
        "invoice_no": "InvoiceNo",
        "product": "Product",
        "quantity": "Quantity",
        "price": "Price",
        "customer_id": "CustomerID",
        "date_time": "DateTime",
    })

    return df


def generate_rules() -> pd.DataFrame:
    """
    Build a basket from recent transactions, run Apriori, and extract
    association rules.
    Returns a DataFrame of rules with antecedents, consequents,
    confidence, lift, and support.
    """
    df = _load_recent_transactions()
    if df.empty or df["InvoiceNo"].nunique() < 3:
        return pd.DataFrame()

    basket = build_basket(df)

    # Run Apriori to find frequent itemsets
    freq_items = apriori(basket, min_support=MIN_SUPPORT, use_colnames=True)
    if freq_items.empty:
        return pd.DataFrame()

    # Generate association rules
    rules = association_rules(freq_items, metric="confidence",
                              min_threshold=MIN_CONFIDENCE)
    rules = rules[rules["lift"] >= MIN_LIFT]

    # Convert frozensets to comma-separated strings for JSON serialisation
    rules["antecedent"] = rules["antecedents"].apply(lambda x: ", ".join(list(x)))
    rules["consequent"] = rules["consequents"].apply(lambda x: ", ".join(list(x)))

    return rules[["antecedent", "consequent", "confidence", "lift", "support"]]


def get_trending_products(top_n: int = 10) -> list[str]:
    """
    Return the top-N most purchased products from Firestore transactions.
    """
    df = firestore_to_dataframe("transactions")
    if df.empty:
        return []

    counts = Counter(df["product"])
    return [product for product, _ in counts.most_common(top_n)]


def get_recommendations(customer_id: str = None) -> dict:
    """
    Generate product recommendations.
    If customer_id is provided, filter rules by the products that
    customer's cluster typically buys.
    """
    rules_df = generate_rules()
    trending = get_trending_products()

    result = {
        "customer_id": customer_id,
        "cluster_label": None,
        "trending_products": trending,
        "recommendations": [],
    }

    if rules_df.empty:
        return result

    # Personalise if customer_id is provided
    if customer_id:
        # Look up the customer's cluster in Firestore
        customers_df = firestore_to_dataframe("customers")
        if not customers_df.empty:
            match = customers_df[customers_df["customer_id"] == str(customer_id)]
            if not match.empty:
                cluster_label = int(match.iloc[0]["cluster_label"])
                result["cluster_label"] = cluster_label

                # Find other customers in the same cluster
                same_cluster = customers_df[customers_df["cluster_label"] == cluster_label]
                same_cluster_ids = set(same_cluster["customer_id"].tolist())

                # Find products bought by the cluster
                txn_df = firestore_to_dataframe("transactions")
                if not txn_df.empty:
                    cluster_txns = txn_df[txn_df["customer_id"].isin(same_cluster_ids)]
                    cluster_product_set = set(cluster_txns["product"].unique())

                    # Filter rules where antecedent matches cluster products
                    filtered = rules_df[
                        rules_df["antecedent"].apply(
                            lambda a: any(p in cluster_product_set for p in a.split(", "))
                        )
                    ]
                    if not filtered.empty:
                        rules_df = filtered

    # Convert to list of dicts
    recs = rules_df.sort_values("lift", ascending=False).head(20)
    result["recommendations"] = [
        {
            "antecedent": row["antecedent"],
            "consequent": row["consequent"],
            "confidence": round(row["confidence"], 4),
            "lift": round(row["lift"], 4),
            "support": round(row["support"], 4),
        }
        for _, row in recs.iterrows()
    ]

    return result
