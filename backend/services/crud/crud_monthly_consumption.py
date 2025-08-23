from datetime import datetime

import pymongo
from bson.objectid import ObjectId

from backend.services.crud.crud_settings import get_setting_from_db
from backend.services.db_client import get_db, get_fs_bucket
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.services.exception.ResultIsAlreadyExistsException import ResultIsAlreadyExistsException
from backend.services.model.MonthlyConsumption import MonthlyConsumption


def save_monthly_consumption_to_db(monthly_consumption):
    collection = get_db()["monthly_consumptions"]
    monthly_consumption_dict = {
        "modified_date": monthly_consumption.modified_date,
        "date": monthly_consumption.date,
        "total_kwh_consumed": monthly_consumption.total_kwh_consumed,
        "price": calculate_price_from_current_consumption_from_last_month(monthly_consumption.total_kwh_consumed),
        "original_file": monthly_consumption.original_file,
        "file_name": monthly_consumption.file_name,
        "label_file": monthly_consumption.label_file,
        "file_label_name": monthly_consumption.file_label_name
    }
    result = collection.insert_one(monthly_consumption_dict)
    return result.inserted_id


def get_monthly_consumption_from_db(monthly_consumption_id):
    collection = get_db()["monthly_consumptions"]
    result = collection.find_one({"_id": ObjectId(monthly_consumption_id)})
    if result:
        return MonthlyConsumption(
            _id=result["_id"],
            modified_date=result["modified_date"],
            date=result["date"],
            total_kwh_consumed=result["total_kwh_consumed"],
            price=result["price"],
            original_file=str(result["original_file"]) if isinstance(result["original_file"], ObjectId) else result[
                "original_file"],
            file_name=result["file_name"],
            label_file=str(result["label_file"]) if isinstance(result["label_file"], ObjectId) else result[
                "label_file"],
            file_label_name=str(result["file_label_name"]) if isinstance(result["file_label_name"], ObjectId) else
            result["file_label_name"]
        )
    else:
        raise NoObjectHasFoundException()


def get_latest_monthly_consumption_from_db():
    collection = get_db()["monthly_consumptions"]
    result = collection.find().sort("date", pymongo.DESCENDING).limit(1)
    monthly_consumption = list(result)
    if monthly_consumption:
        doc = monthly_consumption[0]
        return MonthlyConsumption(
            _id=doc["_id"],
            modified_date=doc["modified_date"],
            date=doc["date"],
            total_kwh_consumed=doc["total_kwh_consumed"],
            price=doc["price"],
            original_file=str(doc["original_file"]) if isinstance(doc["original_file"], ObjectId) else doc[
                "original_file"],
            file_name=doc["file_name"],
            label_file=str(doc["label_file"]) if isinstance(doc["label_file"], ObjectId) else doc["label_file"],
            file_label_name=str(doc["file_label_name"]) if isinstance(doc["file_label_name"], ObjectId) else doc[
                "file_label_name"]
        )
    else:
        raise NoObjectHasFoundException()


def get_all_monthly_consumption_from_db():
    collection = get_db()["monthly_consumptions"]
    results = collection.find()
    monthly_consumptions = []
    for doc in results:
        monthly_consumptions.append(MonthlyConsumption(
            _id=doc["_id"],
            modified_date=doc["modified_date"],
            date=doc["date"],
            total_kwh_consumed=doc["total_kwh_consumed"],
            price=doc["price"],
            original_file=str(doc["original_file"]) if isinstance(doc["original_file"], ObjectId) else doc[
                "original_file"],
            file_name=doc["file_name"],
            label_file=str(doc["label_file"]) if isinstance(doc["label_file"], ObjectId) else doc["label_file"],
            file_label_name=str(doc["file_label_name"]) if isinstance(doc["file_label_name"], ObjectId) else doc[
                "file_label_name"]
        ))
    return monthly_consumptions


def update_monthly_consumption_in_db(monthly_consumption_id: str, updated_monthly_consumption: MonthlyConsumption):
    existing_consumption = get_monthly_consumption_from_db(monthly_consumption_id)
    existing_consumption.total_kwh_consumed = updated_monthly_consumption.total_kwh_consumed
    existing_consumption.price = updated_monthly_consumption.price
    existing_consumption.modified_date = datetime.now()
    existing_consumption.date = updated_monthly_consumption.date

    collection = get_db()["monthly_consumptions"]
    updated_monthly_consumption = {
        "modified_date": existing_consumption.modified_date,
        "date": existing_consumption.date,
        "total_kwh_consumed": existing_consumption.total_kwh_consumed,
        "price": calculate_price_for_custom_date(existing_consumption.date, existing_consumption.total_kwh_consumed),
        "original_file": existing_consumption.original_file,
        "file_name": existing_consumption.file_name,
        "label_file": existing_consumption.label_file,
        "file_label_name": existing_consumption.file_label_name
    }
    result = collection.update_one({"_id": ObjectId(monthly_consumption_id)}, {"$set": updated_monthly_consumption})

    if result.modified_count == 0:
        raise NoObjectHasFoundException()


def delete_monthly_consumption_from_db(monthly_consumption_id: str):
    collection = get_db()["monthly_consumptions"]
    existing_consumption = get_monthly_consumption_from_db(monthly_consumption_id)
    if existing_consumption.original_file:
        get_fs_bucket().delete(ObjectId(str(existing_consumption.original_file)))
    if existing_consumption.label_file:
        get_fs_bucket().delete(ObjectId(str(existing_consumption.label_file)))
    if existing_consumption.file_label_name:
        get_fs_bucket().delete(ObjectId(str(existing_consumption.file_label_name)))
    result = collection.delete_one({"_id": ObjectId(monthly_consumption_id)})
    if result.deleted_count == 0:
        raise NoObjectHasFoundException()


def calculate_price_from_current_consumption_from_last_month(current_total_kwh_consumed: float) -> float:
    settings = get_setting_from_db()
    if not settings.calculate_price:
        return 0.0

    db = get_db()

    last_month_doc = db["monthly_consumptions"].find_one(sort=[("date", pymongo.DESCENDING)])
    price_doc = db["electricity-prices"].find_one(sort=[("date", pymongo.DESCENDING)])

    if not price_doc:
        raise NoObjectHasFoundException("No electricity price found")

    price_per_kwh = price_doc["price"]

    if last_month_doc is not None:
        if last_month_doc["total_kwh_consumed"] >= current_total_kwh_consumed:
            raise ResultIsAlreadyExistsException("Monthly consumption for this month already exists. Please check the history.")
        kwh_diff = current_total_kwh_consumed - last_month_doc["total_kwh_consumed"]
    else:
        kwh_diff = current_total_kwh_consumed

    return round(kwh_diff * price_per_kwh, 2)


def calculate_price_for_custom_date(selected_date: datetime, total_kwh: float) -> float:
    db = get_db()
    settings = get_setting_from_db()
    if not settings.calculate_price:
        return 0.0

    previous_consumption = db["monthly_consumptions"].find_one(
        {"date": {"$lt": selected_date}},
        sort=[("date", pymongo.DESCENDING)]
    )

    price_doc = db["electricity-prices"].find_one(
        {"date": {"$lte": selected_date.strftime('%Y/%m/%d')}},
        sort=[("date", pymongo.DESCENDING)]
    )

    if not price_doc:
        raise NoObjectHasFoundException("No price found for the selected date")

    previous_kwh = previous_consumption["total_kwh_consumed"] if previous_consumption else 0
    delta_kwh = total_kwh - previous_kwh

    return round(delta_kwh * price_doc["price"], 2)
