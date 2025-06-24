from datetime import datetime
from unittest.mock import patch

import pytest
from bson import ObjectId

from backend.services.crud.crud_settings import save_setting_to_db, get_setting_from_db, update_setting_in_db
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.services.model.Settings import Settings


@patch("backend.services.crud.crud_settings.get_db")
def test_saves_setting_to_db_and_returns_id(mock_get_db):
    mock_collection = mock_get_db.return_value["settings"]
    mock_collection.insert_one.return_value.inserted_id = ObjectId()
    setting = Settings(
        _id=1,
        currency="usd",
        dark_mode_preference="auto",
        debug_mode=False,
        calculate_price=True,
        created_at=None,
        updated_at=None
    )
    result = save_setting_to_db(setting)
    assert result is not None


@patch("backend.services.crud.crud_settings.get_db")
def test_retrieves_existing_setting_from_db(mock_get_db):
    mock_collection = mock_get_db.return_value["settings"]
    mock_collection.find_one.return_value = {
        "_id": 1,
        "currency": "usd",
        "dark_mode_preference": "auto",
        "debug_mode": False,
        "calculate_price": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    result = get_setting_from_db()
    assert result.currency == "usd"
    assert result.dark_mode_preference == "auto"


@patch("backend.services.crud.crud_settings.get_db")
def test_creates_default_setting_when_none_exists(mock_get_db):
    mock_collection = mock_get_db.return_value["settings"]
    mock_collection.find_one.return_value = None
    mock_collection.insert_one.return_value.inserted_id = ObjectId()
    result = get_setting_from_db()
    assert result.currency == "usd"
    assert result.dark_mode_preference == "auto"


@patch("backend.services.crud.crud_settings.get_db")
def test_updates_existing_setting_in_db(mock_get_db):
    mock_collection = mock_get_db.return_value["settings"]

    mock_collection.find_one.return_value = {
        "_id": 1,
        "currency": "eur",
        "dark_mode_preference": "on",
        "debug_mode": True,
        "calculate_price": False,
        "created_at": None,
        "updated_at": None
    }

    mock_collection.update_one.return_value.modified_count = 1
    updated_setting = Settings(
        _id=1,
        currency="eur",
        dark_mode_preference="on",
        debug_mode=True,
        calculate_price=False,
        created_at=None,
        updated_at=None
    )
    update_setting_in_db(updated_setting)


@patch("backend.services.crud.crud_settings.get_db")
def test_raises_exception_when_updating_nonexistent_setting(mock_get_db):
    mock_collection = mock_get_db.return_value["settings"]

    mock_collection.find_one.return_value = {
        "_id": 1,
        "currency": "eur",
        "dark_mode_preference": "on",
        "debug_mode": True,
        "calculate_price": False,
        "created_at": None,
        "updated_at": None
    }

    mock_collection.update_one.return_value.modified_count = 0
    updated_setting = Settings(
        _id=2,
        currency="eur",
        dark_mode_preference="on",
        debug_mode=True,
        calculate_price=False,
        created_at=None,
        updated_at=None
    )
    with pytest.raises(NoObjectHasFoundException):
        update_setting_in_db(updated_setting)
