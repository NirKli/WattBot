import os
from datetime import datetime

import gridfs
import pymongo
from bson.objectid import ObjectId

from services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from services.model.ElectricityPrice import ElectricityPrice
from services.model.MonthlyConsumption import MonthlyConsumption
from services.model.Settings import Settings

mongo_client = pymongo.MongoClient("mongodb://" + os.environ["MONGODB_URL"])

mongo_db = mongo_client["monthly-consumption"]
save_imgs_db = gridfs.GridFSBucket(mongo_db)


def save_file_to_db(path, filename):
    with open(path, "rb") as file_data:
        file_id = save_imgs_db.upload_from_stream(filename, file_data)
    return file_id


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
            oid=result["_id"],
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
            oid=doc["_id"],
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
            return electricity_price[0]["price"] * (current_total_kwh_consumed - last_month_consumption[0]["total_kwh_consumed"])
        else:
            raise NoObjectHasFoundException()
    else:
        collection = mongo_db["electricity-prices"]
        electricity_price = list(collection.find().sort("date", pymongo.DESCENDING).limit(1))
        if electricity_price:
            return electricity_price[0]["price"] * current_total_kwh_consumed
        else:
            raise NoObjectHasFoundException()


def get_file_from_db(file_id):
    file_data = save_imgs_db.open_download_stream(ObjectId(file_id))
    if file_data:
        return file_data.read()
    else:
        raise NoObjectHasFoundException()


def get_price_from_db(price_id):
    collection = mongo_db["electricity-prices"]
    result = collection.find_one({"_id": ObjectId(price_id)})
    if result:
        return ElectricityPrice(
            oid=result["_id"],
            price=result["price"],
            date=result["date"],
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            is_default=result["is_default"]
        )
    else:
        raise NoObjectHasFoundException()


def save_price_to_db(electricity_price: ElectricityPrice):
    collection = mongo_db["electricity-prices"]
    price_dict = {
        "price": electricity_price.price,
        "date": electricity_price.date,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "is_default": electricity_price.is_default

    }
    result = collection.insert_one(price_dict)
    return str(result.inserted_id)


def update_price_in_db(electricity_price_id: str, updated_electricity_price: ElectricityPrice):
    existing_price = get_price_from_db(electricity_price_id)
    existing_price.price = updated_electricity_price.price
    existing_price.date = updated_electricity_price.date
    existing_price.updated_at = datetime.now()
    existing_price.is_default = updated_electricity_price.is_default

    collection = mongo_db["electricity-prices"]
    updated_price_dict = {
        "price": existing_price.price,
        "date": existing_price.date,
        "created_at": existing_price.created_at,
        "updated_at": existing_price.updated_at,
        "is_default": existing_price.is_default
    }
    result = collection.update_one({"_id": ObjectId(electricity_price_id)}, {"$set": updated_price_dict})

    if result.modified_count == 0:
        raise NoObjectHasFoundException()


def get_all_prices_from_db():
    collection = mongo_db["electricity-prices"]
    results = collection.find()
    prices = []
    for doc in results:
        prices.append(ElectricityPrice(
            oid=doc["_id"],
            price=doc["price"],
            date=doc["date"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
            is_default=doc["is_default"]
        ))
    return prices


def delete_price_from_db(price_id: str):
    collection = mongo_db["electricity-prices"]
    result = collection.delete_one({"_id": ObjectId(price_id)})
    if result.deleted_count == 0:
        raise NoObjectHasFoundException()


def save_setting_to_db(setting: Settings):
    collection = mongo_db["settings"]
    setting_dict = {
        "_id": 1,
        "currency": setting.currency,
        "dark_mode": setting.dark_mode,
        "debug_mode": setting.debug_mode,
        "calculate_price": setting.calculate_price,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    result = collection.insert_one(setting_dict)
    return str(result.inserted_id)


def get_setting_from_db():
    collection = mongo_db["settings"]
    result = collection.find_one({"_id": 1})
    if result:
        return Settings(
            _id=1,
            currency=result["currency"],
            dark_mode=result["dark_mode"],
            calculate_price=result["calculate_price"],
            debug_mode=result["debug_mode"],
            created_at=result["created_at"],
            updated_at=result["updated_at"]
        )
    elif result is None:
        settings = Settings(
            _id=1,
            currency="usd",
            dark_mode=False,
            debug_mode=False,
            calculate_price=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        save_setting_to_db(settings)
        return settings
    else:
        raise NoObjectHasFoundException()


def update_setting_in_db(updated_setting: Settings):
    existing_setting = get_setting_from_db()
    collection = mongo_db["settings"]

    updated_setting_dict = {
        "currency": updated_setting.currency,
        "dark_mode": updated_setting.dark_mode,
        "debug_mode": updated_setting.debug_mode,
        "calculate_price": updated_setting.calculate_price,
        "created_at": existing_setting.created_at,
        "updated_at": datetime.now()
    }

    result = collection.update_one({"_id": 1}, {"$set": updated_setting_dict})

    if result.modified_count == 0:
        raise NoObjectHasFoundException()
