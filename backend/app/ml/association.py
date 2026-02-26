"""
SmartBuy — Association Rule Mining (Apriori)
Discovers product associations from transaction baskets.
"""
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from app.ml.utils import save_rules


def run_apriori(transactions_df: pd.DataFrame) -> dict:
    """
    Run the Apriori algorithm on transaction data to find association rules.

    Steps:
      1. Convert basket transactions to a one-hot encoded matrix
      2. Find frequent itemsets (min_support = 0.02)
      3. Generate association rules (min_confidence = 0.3)
      4. Save rules (productA, productB, support, confidence, lift)
         to the recommendations collection

    Args:
        transactions_df: Cleaned transaction DataFrame with columns:
            invoiceNo, product, quantity

    Returns:
        Dict with rules_count and the top rules.
    """
    if transactions_df.empty:
        return {"rules_count": 0, "rules": []}

    # ── Step 1: Build one-hot encoded basket matrix ───────────────
    basket = (
        transactions_df.groupby(["invoiceNo", "product"])["quantity"]
        .sum()
        .unstack(fill_value=0)
        .map(lambda x: 1 if x > 0 else 0)
    )

    if basket.empty or basket.shape[0] < 3:
        return {"rules_count": 0, "rules": []}

    # ── Step 2: Find frequent itemsets ────────────────────────────
    freq_items = apriori(basket, min_support=0.02, use_colnames=True)
    if freq_items.empty:
        return {"rules_count": 0, "rules": []}

    # ── Step 3: Generate association rules ────────────────────────
    rules = association_rules(
        freq_items,
        metric="confidence",
        min_threshold=0.3,
    )

    if rules.empty:
        return {"rules_count": 0, "rules": []}

    # Filter for positive correlations only (lift > 1)
    rules = rules[rules["lift"] >= 1.0]

    # ── Step 4: Format and save ───────────────────────────────────
    rules_formatted = pd.DataFrame({
        "productA": rules["antecedents"].apply(lambda x: ", ".join(list(x))),
        "productB": rules["consequents"].apply(lambda x: ", ".join(list(x))),
        "support": rules["support"],
        "confidence": rules["confidence"],
        "lift": rules["lift"],
    })

    # Save to Firestore recommendations collection
    save_rules(rules_formatted)

    # Build response
    top_rules = rules_formatted.sort_values("lift", ascending=False).head(20)
    rules_list = [
        {
            "productA": row["productA"],
            "productB": row["productB"],
            "support": round(row["support"], 4),
            "confidence": round(row["confidence"], 4),
            "lift": round(row["lift"], 4),
        }
        for _, row in top_rules.iterrows()
    ]

    return {
        "rules_count": len(rules_formatted),
        "rules": rules_list,
    }
