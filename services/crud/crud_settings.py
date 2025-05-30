from datetime import datetime

from services.db_client import mongo_db
from services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from services.model.Settings import Settings


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
