"""
Migration: 20260217214100_backfill_new_fields

Backfills:
- conf_array
- score

For all documents in monthly_consumptions collection.
Resumable and safe on restart.
"""

from datetime import datetime, timezone

import cv2
import numpy as np
from bson import ObjectId
from gridfs import GridFS
from ultralytics import YOLO


MIGRATION_ID = "20260217214100_backfill_new_fields"

COLLECTION_NAME = "monthly_consumptions"
BATCH_SIZE = 10
MODEL_PATH = "models/best.pt"


# =========================
# Entry Point
# =========================

def run(db):
    migrations = db["data_migrations"]
    collection = db[COLLECTION_NAME]
    fs = GridFS(db)

    migration = migrations.find_one({"_id": MIGRATION_ID})
    if migration and migration.get("status") == "done":
        return

    migration = _init_migration(migrations, migration)

    print(f"[Migration] Starting {MIGRATION_ID}")

    model = YOLO(MODEL_PATH)
    last_id = migration.get("last_id")

    try:
        while True:
            docs = _get_batch(collection, last_id)

            if not docs:
                _mark_done(migrations)
                print(f"[Migration] Finished {MIGRATION_ID}")
                return

            last_id = _process_batch(
                docs,
                collection,
                fs,
                model,
                migrations,
                last_id,
            )

    except Exception as e:
        _mark_failed(migrations, str(e))
        raise


# =========================
# Migration Setup
# =========================

def _init_migration(migrations, migration):
    if not migration:
        migrations.insert_one(
            {
                "_id": MIGRATION_ID,
                "status": "running",
                "started_at": _utc_now(),
                "processed": 0,
                "last_id": None,
            }
        )
        return migrations.find_one({"_id": MIGRATION_ID})

    migrations.update_one(
        {"_id": MIGRATION_ID},
        {"$set": {"status": "running"}},
    )
    return migration


def _mark_done(migrations):
    migrations.update_one(
        {"_id": MIGRATION_ID},
        {
            "$set": {
                "status": "done",
                "finished_at": _utc_now(),
            }
        },
    )


def _mark_failed(migrations, error):
    migrations.update_one(
        {"_id": MIGRATION_ID},
        {
            "$set": {
                "status": "failed",
                "error": error,
                "finished_at": _utc_now(),
            }
        },
    )


# =========================
# Batch Processing
# =========================

def _get_batch(collection, last_id):
    query = {}
    if last_id:
        query["_id"] = {"$gt": last_id}

    return list(
        collection.find(query)
        .sort("_id", 1)
        .limit(BATCH_SIZE)
    )


def _process_batch(docs, collection, fs, model, migrations, last_id):
    processed_count = 0
    new_last_id = last_id

    for doc in docs:
        new_last_id = doc["_id"]
        _process_doc(doc, collection, fs, model)
        processed_count += 1

    migrations.update_one(
        {"_id": MIGRATION_ID},
        {
            "$set": {"last_id": new_last_id},
            "$inc": {"processed": processed_count},
        },
    )

    return new_last_id


# =========================
# Document Processing
# =========================

def _process_doc(doc, collection, fs, model):
    original_file_id = doc.get("original_file")
    if not original_file_id:
        return

    file_bytes = fs.get(ObjectId(original_file_id)).read()

    image = _decode_image(file_bytes)
    if image is None:
        return

    conf_array, score = _infer_conf_and_score(image, model)

    collection.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "conf_array": conf_array,
                "score": score,
            }
        },
    )


def _decode_image(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


# =========================
# Model Inference
# =========================

def _infer_conf_and_score(image, model):
    results = model(image)

    detections = []

    for box in results[0].obb:
        cls = int(box.cls.item())
        conf = float(box.conf.item())
        label = model.names[cls]
        x_center = box.xywhr[0][0].item()

        detections.append((x_center, label, conf))

    detections.sort(key=lambda x: x[0])

    conf_array = []
    score_sum = 0.0

    for _, lbl, conf in detections:
        conf_array.append({
            "char": str(lbl),
            "conf": float(conf)
        })
        score_sum += float(conf)

    score = score_sum / len(conf_array) if conf_array else 0.0

    return conf_array, score


# =========================
# Utils
# =========================

def _utc_now():
    return datetime.now(timezone.utc).isoformat()
