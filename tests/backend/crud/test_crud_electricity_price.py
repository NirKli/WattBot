from datetime import datetime
from unittest.mock import patch

import pytest
from bson import ObjectId

from backend.services.crud.crud_electricity_price import get_all_prices_from_db, get_price_from_db, save_price_to_db, \
    update_price_in_db, delete_price_from_db
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.services.model.ElectricityPrice import ElectricityPrice, PyObjectId


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_retrieves_all_prices_from_db(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]
    mock_collection.find.return_value = [
        {
            "_id": ObjectId(),
            "price": 0.15,
            "date": "2023-10-01",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_default": True
        },
        {
            "_id": ObjectId(),
            "price": 0.20,
            "date": "2023-10-02",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_default": False
        }
    ]
    result = get_all_prices_from_db()
    assert len(result) == 2
    assert result[0].price == 0.15
    assert result[1].price == 0.20


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_raises_exception_when_price_not_found(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]
    mock_collection.find_one.return_value = None
    with pytest.raises(NoObjectHasFoundException):
        get_price_from_db("0123456789abcdef01234567")


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_saves_price_to_db_and_returns_id(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]
    mock_collection.insert_one.return_value.inserted_id = ObjectId()
    electricity_price = ElectricityPrice(
        price=0.25,
        date="2023-10-03",
        created_at=None,
        updated_at=None,
        is_default=False
    )
    result = save_price_to_db(electricity_price)
    assert result is not None


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_updates_existing_price_in_db(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]

    mock_collection.find_one.return_value = {
        "_id": ObjectId("682d6f4ef62c1c14eae9f014"),
        "price": 0.20,
        "date": "2023-10-03",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "is_default": False
    }

    mock_collection.update_one.return_value.modified_count = 1

    electricity_price = ElectricityPrice(
        _id=PyObjectId("682d6f4ef62c1c14eae9f014"),
        price=0.30,
        date="2023-10-04",
        created_at=None,
        updated_at=None,
        is_default=True
    )

    update_price_in_db("682d6f4ef62c1c14eae9f014", electricity_price)


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_raises_exception_when_updating_nonexistent_price(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]

    mock_collection.find_one.return_value = {
        "_id": ObjectId("682d6f4ef62c1c14eae9f014"),
        "price": 0.20,
        "date": "2023-10-03",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "is_default": False
    }

    mock_collection.update_one.return_value.modified_count = 0

    electricity_price = ElectricityPrice(
        _id=PyObjectId("6831d40e9c8875180ea10b36"),
        price=0.30,
        date="2023-10-04",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        is_default=True
    )
    with pytest.raises(NoObjectHasFoundException):
        update_price_in_db("6831d40e9c8875180ea10b36", electricity_price)


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_deletes_price_from_db(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]
    mock_collection.delete_one.return_value.deleted_count = 1
    delete_price_from_db("682d6f4ef62c1c14eae9f014")


@patch("backend.services.crud.crud_electricity_price.get_db")
def test_raises_exception_when_deleting_nonexistent_price(mock_get_db):
    mock_collection = mock_get_db.return_value["electricity-prices"]
    mock_collection.delete_one.return_value.deleted_count = 0
    with pytest.raises(NoObjectHasFoundException):
        delete_price_from_db("0123456789abcdef01234567")
