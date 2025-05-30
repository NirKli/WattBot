from datetime import datetime

import pymongo
from bson.objectid import ObjectId

from services.crud.crud_settings import get_setting_from_db
from services.db_client import mongo_db, save_imgs_db
from services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from services.model.MonthlyConsumption import MonthlyConsumption


def save_monthly_consumption_to_db(monthly_consumption):
    collection = mongo_db["monthly_consumptions"]
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
    collection = mongo_db["monthly_consumptions"]
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


def get_all_monthly_consumption_from_db():
    collection = mongo_db["monthly_consumptions"]
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

    collection = mongo_db["monthly_consumptions"]
    updated_monthly_consumption = {
        "modified_date": existing_consumption.modified_date,
        "date": existing_consumption.date,
        "total_kwh_consumed": existing_consumption.total_kwh_consumed,
        "price": existing_consumption.price,
        "original_file": existing_consumption.original_file,
        "file_name": existing_consumption.file_name,
        "label_file": existing_consumption.label_file,
        "file_label_name": existing_consumption.file_label_name
    }
    result = collection.update_one({"_id": ObjectId(monthly_consumption_id)}, {"$set": updated_monthly_consumption})

    if result.modified_count == 0:
        raise NoObjectHasFoundException()


def delete_monthly_consumption_from_db(monthly_consumption_id: str):
    collection = mongo_db["monthly_consumptions"]
    existing_consumption = get_monthly_consumption_from_db(monthly_consumption_id)
    if existing_consumption.original_file:
        save_imgs_db.delete(ObjectId(existing_consumption.original_file))
    if existing_consumption.label_file:
        save_imgs_db.delete(ObjectId(existing_consumption.label_file))
    if existing_consumption.file_label_name:
        save_imgs_db.delete(ObjectId(existing_consumption.file_label_name))
    result = collection.delete_one({"_id": ObjectId(monthly_consumption_id)})
    if result.deleted_count == 0:
        raise NoObjectHasFoundException()


def calculate_price_from_current_consumption_from_last_month(current_total_kwh_consumed: float) -> float:
    settings = get_setting_from_db()
    if not settings.calculate_price:
        return 0.0
    collection = mongo_db["monthly_consumptions"]
    last_month_consumption = list(collection.find().sort("date", pymongo.DESCENDING).limit(1))
    if last_month_consumption:
        collection = mongo_db["electricity-prices"]
        electricity_price = list(collection.find().sort("date", pymongo.DESCENDING).limit(1))
        if electricity_price:
            return electricity_price[0]["price"] * (
                        current_total_kwh_consumed - last_month_consumption[0]["total_kwh_consumed"])
        else:
            raise NoObjectHasFoundException()
    else:
        collection = mongo_db["electricity-prices"]
        electricity_price = list(collection.find().sort("date", pymongo.DESCENDING).limit(1))
        if electricity_price:
            return electricity_price[0]["price"] * current_total_kwh_consumed
        else:
            raise NoObjectHasFoundException()
