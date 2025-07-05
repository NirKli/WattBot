from unittest.mock import patch

from backend.services.crud.crud_monthly_consumption import (
    get_monthly_consumption_from_db,
    get_all_monthly_consumption_from_db,
    get_latest_monthly_consumption_from_db,
    save_monthly_consumption_to_db,
    update_monthly_consumption_in_db,
    delete_monthly_consumption_from_db,
)
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.services.model.MonthlyConsumption import MonthlyConsumption


@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_retrieves_monthly_consumption_data(mock_get_db):
    mock_collection = mock_get_db.return_value["monthly_consumptions"]
    mock_collection.find.return_value = [
        {
            "_id": ObjectId(),
            "modified_date": datetime.now(),
            "date": datetime.now(),
            "total_kwh_consumed": 12124.0,
            "price": 12.1,
            "original_file": ObjectId(),
            "file_name": "original_file.jpg",
            "label_file": ObjectId(),
            "file_label_name": "label_file.jpg"
        },
    ]
    result = get_all_monthly_consumption_from_db()
    assert len(result) == 1
    assert result[0].total_kwh_consumed == 12124.0


@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_raises_exception_when_monthly_consumption_not_found(mock_get_db):
    mock_get_db.return_value["monthly_consumptions"].find_one.return_value = None
    with pytest.raises(NoObjectHasFoundException):
        get_monthly_consumption_from_db("0123456789abcdef01234567")


@patch("backend.services.crud.crud_settings.get_db")
@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_saves_monthly_consumption_to_db_and_returns_id(mock_mc_get_db, mock_settings_get_db):
    mock_mc_get_db.return_value["monthly_consumptions"].insert_one.return_value.inserted_id = ObjectId()
    mock_settings_get_db.return_value["settings"].find_one.return_value = {
        "calculate_price": False,
        "currency": "usd",
        "debug_mode": False,
        "dark_mode_preference": "auto",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    monthly_consumption = MonthlyConsumption(
        modified_date=datetime.now(),
        date=datetime.now(),
        total_kwh_consumed=12124.0,
        price=12.1,
        original_file=ObjectId(),
        file_name="original_file.jpg",
        label_file=ObjectId(),
        file_label_name="label_file.jpg"
    )
    result = save_monthly_consumption_to_db(monthly_consumption)
    assert result is not None


@patch("backend.services.crud.crud_settings.get_db")
@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_updates_existing_monthly_consumption_in_db(mock_get_db, mock_settings_get_db):
    mock_settings_get_db.return_value["settings"].find_one.return_value = {
        "currency": "usd",
        "debug_mode": False,
        "dark_mode_preference": "auto",
        "calculate_price": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    mock_collection = mock_get_db.return_value["monthly_consumptions"]
    mock_collection.find_one.return_value = {
        "_id": ObjectId(),
        "modified_date": datetime.now(),
        "date": datetime.now(),
        "total_kwh_consumed": 100,
        "price": 10,
        "original_file": ObjectId(),
        "file_name": "file.jpg",
        "label_file": ObjectId(),
        "file_label_name": "label.jpg"
    }
    mock_collection.update_one.return_value.modified_count = 1

    update_monthly_consumption_in_db("682d6f4ef62c1c14eae9f014", MonthlyConsumption(
        date=datetime.now(),
        modified_date=datetime.now(),
        total_kwh_consumed=13000.0,
        price=20.0,
        original_file=ObjectId(),
        file_name="updated_file.jpg",
        label_file=ObjectId(),
        file_label_name="updated_label.jpg"
    ))


@patch("backend.services.crud.crud_settings.get_db")
@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_raises_exception_when_updating_nonexistent_monthly_consumption(mock_get_db, mock_settings_get_db):
    mock_settings_get_db.return_value["settings"].find_one.return_value = {
        "currency": "usd",
        "debug_mode": False,
        "dark_mode_preference": "auto",
        "calculate_price": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    mock_collection = mock_get_db.return_value["monthly_consumptions"]
    mock_collection.find_one.return_value = {
        "_id": ObjectId("682d6f4ef62c1c14eae9f015"),
        "modified_date": datetime.now(),
        "date": datetime.now(),
        "total_kwh_consumed": 100,
        "price": 10,
        "original_file": ObjectId(),
        "file_name": "file.jpg",
        "label_file": ObjectId(),
        "file_label_name": "label.jpg"
    }
    mock_collection.update_one.return_value.modified_count = 0

    with pytest.raises(NoObjectHasFoundException):
        update_monthly_consumption_in_db("682d6f4ef62c1c14eae9f014", MonthlyConsumption(
            date=datetime.now(),
            modified_date=datetime.now(),
            total_kwh_consumed=13000.0,
            price=20.0,
            original_file=ObjectId(),
            file_name="updated_file.jpg",
            label_file=ObjectId(),
            file_label_name="updated_label.jpg"
        ))


@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_deletes_monthly_consumption_from_db(mock_get_db):
    mock_collection = mock_get_db.return_value["monthly_consumptions"]

    mock_collection.find_one.return_value = {
        "_id": ObjectId("682d6f4ef62c1c14eae9f014"),
        "modified_date": datetime.now(),
        "date": datetime.now(),
        "total_kwh_consumed": 100,
        "price": 10,
        "original_file": ObjectId(),
        "file_name": "file.jpg",
        "label_file": ObjectId(),
        "file_label_name": ObjectId()
    }
    mock_collection.delete_one.return_value.deleted_count = 1

    with patch("backend.services.crud.crud_monthly_consumption.get_fs_bucket") as mock_fs:
        mock_fs.return_value.deleted_count = 1
        delete_monthly_consumption_from_db("682d6f4ef62c1c14eae9f014")


@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_raises_exception_when_deleting_nonexistent_monthly_consumption(mock_get_db):
    mock_collection = mock_get_db.return_value["monthly_consumptions"]
    mock_collection.find_one.return_value = {
        "_id": ObjectId(),
        "modified_date": datetime.now(),
        "date": datetime.now(),
        "total_kwh_consumed": 100,
        "price": 10,
        "original_file": ObjectId(),
        "file_name": "file.jpg",
        "label_file": ObjectId(),
        "file_label_name": ObjectId()
    }
    mock_collection.delete_one.return_value.deleted_count = 0

    with pytest.raises(NoObjectHasFoundException):
        with patch("backend.services.crud.crud_monthly_consumption.get_fs_bucket") as mock_fs:
            mock_fs.return_value.deleted_count = 0
            delete_monthly_consumption_from_db("682d6f4ef62c1c14eae9f014")


@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_get_latest_monthly_consumption_from_db(mock_get_db):
    mock_get_db.return_value["monthly_consumptions"].find.return_value.sort.return_value.limit.return_value = [{
        "_id": ObjectId(),
        "modified_date": datetime.now(),
        "date": datetime.now(),
        "total_kwh_consumed": 100.0,
        "price": 0.25,
        "original_file": ObjectId(),
        "file_name": "file.jpg",
        "label_file": ObjectId(),
        "file_label_name": "label.jpg"
    }]
    result = get_latest_monthly_consumption_from_db()
    assert result.total_kwh_consumed == 100.0


@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_raises_exception_when_latest_monthly_consumption_not_found(mock_get_db):
    mock_get_db.return_value["monthly_consumptions"].find.return_value.sort.return_value.limit.return_value = []
    with pytest.raises(NoObjectHasFoundException):
        get_latest_monthly_consumption_from_db()


from unittest.mock import MagicMock, patch
from bson import ObjectId
from datetime import datetime
import pytest


@patch("backend.services.crud.crud_settings.get_db")
@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_calculate_price_from_last_month_with_previous_consumption(mock_mc_get_db, mock_settings_get_db):
    from backend.services.crud.crud_monthly_consumption import calculate_price_from_current_consumption_from_last_month
    from datetime import datetime

    mock_settings_get_db.return_value["settings"].find_one.return_value = {
        "currency": "usd",
        "debug_mode": False,
        "dark_mode_preference": "auto",
        "calculate_price": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    mock_monthly_collection = MagicMock()
    mock_monthly_collection.find_one.return_value = {"total_kwh_consumed": 100}

    mock_price_collection = MagicMock()
    mock_price_collection.find_one.return_value = {"price": 0.5}

    mock_mc_get_db.return_value.__getitem__.side_effect = lambda name: {
        "monthly_consumptions": mock_monthly_collection,
        "electricity-prices": mock_price_collection
    }[name]

    result = calculate_price_from_current_consumption_from_last_month(120)
    assert result == 10.0


@patch("backend.services.crud.crud_settings.get_db")
@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_calculate_price_from_last_month_without_previous_consumption(mock_mc_get_db, mock_settings_get_db):
    from backend.services.crud.crud_monthly_consumption import calculate_price_from_current_consumption_from_last_month

    mock_settings_get_db.return_value["settings"].find_one.return_value = {
        "currency": "usd",
        "debug_mode": False,
        "dark_mode_preference": "auto",
        "calculate_price": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    mock_monthly_collection = MagicMock()
    mock_monthly_collection.find_one.return_value = None

    mock_price_collection = MagicMock()
    mock_price_collection.find_one.return_value = {"price": 0.5}

    def get_collection(name):
        if name == "monthly_consumptions":
            return mock_monthly_collection
        if name == "electricity-prices":
            return mock_price_collection
        return MagicMock()

    mock_mc_get_db.return_value.__getitem__.side_effect = get_collection

    result = calculate_price_from_current_consumption_from_last_month(80)
    assert result == 40.0


@patch("backend.services.crud.crud_settings.get_db")
@patch("backend.services.crud.crud_monthly_consumption.get_db")
def test_calculate_price_raises_when_no_price_set(mock_mc_get_db, mock_settings_get_db):
    from backend.services.crud.crud_monthly_consumption import calculate_price_from_current_consumption_from_last_month

    mock_settings_get_db.return_value["settings"].find_one.return_value = {
        "currency": "usd",
        "debug_mode": False,
        "dark_mode_preference": "auto",
        "calculate_price": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    mock_mc_get_db.return_value["monthly_consumptions"].find.return_value.sort.return_value.limit.return_value = []
    mock_mc_get_db.return_value["electricity-prices"].find_one.return_value = None

    with pytest.raises(NoObjectHasFoundException):
        calculate_price_from_current_consumption_from_last_month(50)
