from datetime import datetime

from bson.objectid import ObjectId

from backend.services.db_client import get_db
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.services.model.ElectricityPrice import ElectricityPrice


def get_price_from_db(price_id):
    collection = get_db()["electricity-prices"]
    result = collection.find_one({"_id": ObjectId(price_id)})
    if result:
        return ElectricityPrice(
            _id=result["_id"],
            price=result["price"],
            date=result["date"],
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            is_default=result["is_default"]
        )
    else:
        raise NoObjectHasFoundException()


def save_price_to_db(electricity_price: ElectricityPrice):
    collection = get_db()["electricity-prices"]
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

    collection = get_db()["electricity-prices"]
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
    collection = get_db()["electricity-prices"]
    results = collection.find()
    prices = []
    for doc in results:
        prices.append(ElectricityPrice(
            _id=doc["_id"],
            price=doc["price"],
            date=doc["date"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
            is_default=doc["is_default"]
        ))
    return prices


def delete_price_from_db(price_id: str):
    collection = get_db()["electricity-prices"]
    result = collection.delete_one({"_id": ObjectId(price_id)})
    if result.deleted_count == 0:
        raise NoObjectHasFoundException()
