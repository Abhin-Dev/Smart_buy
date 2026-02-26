"""
SmartBuy — Firebase Configuration
Initializes Firebase Admin SDK and provides Firestore client + helpers.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# -------------------------------------------------------------------
# Initialize Firebase App using service account key
# Set GOOGLE_APPLICATION_CREDENTIALS env var to the path
# of your serviceAccountKey.json file.
# -------------------------------------------------------------------
_cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
_cred = credentials.Certificate(_cred_path)
firebase_admin.initialize_app(_cred)

# Firestore client — used across all modules
db = firestore.client()


# -------------------------------------------------------------------
# Helper: Convert a Firestore collection to a Pandas DataFrame
# -------------------------------------------------------------------
def firestore_to_dataframe(collection_name: str, filters: list = None) -> pd.DataFrame:
    """
    Read all documents from a Firestore collection and return
    them as a Pandas DataFrame.

    Args:
        collection_name: Name of the Firestore collection.
        filters: Optional list of (field, op, value) tuples to filter
                 the query, e.g. [("customer_id", "==", "CUST001")].

    Returns:
        A DataFrame where each row is one Firestore document.
        An extra column 'doc_id' holds the document ID.
    """
    ref = db.collection(collection_name)

    # Apply optional filters
    if filters:
        for field, op, value in filters:
            ref = ref.where(field, op, value)

    docs = ref.stream()
    records = []
    for doc in docs:
        data = doc.to_dict()
        data["doc_id"] = doc.id
        records.append(data)

    if not records:
        return pd.DataFrame()

    return pd.DataFrame(records)


# -------------------------------------------------------------------
# Helper: Delete all documents in a collection (batch delete)
# -------------------------------------------------------------------
def delete_collection(collection_name: str, batch_size: int = 500):
    """
    Delete every document in a Firestore collection.
    Uses batched deletes for efficiency.
    """
    ref = db.collection(collection_name)
    while True:
        docs = ref.limit(batch_size).stream()
        deleted = 0
        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
            deleted += 1
        if deleted == 0:
            break
        batch.commit()


# -------------------------------------------------------------------
# Helper: Add multiple documents in batches (Firestore batch write)
# -------------------------------------------------------------------
def batch_add(collection_name: str, records: list[dict], batch_size: int = 500):
    """
    Add a list of dicts as new documents to a Firestore collection.
    Uses batched writes for efficiency (max 500 per batch).
    """
    ref = db.collection(collection_name)
    for i in range(0, len(records), batch_size):
        batch = db.batch()
        chunk = records[i : i + batch_size]
        for record in chunk:
            doc_ref = ref.document()  # auto-generated ID
            batch.set(doc_ref, record)
        batch.commit()
