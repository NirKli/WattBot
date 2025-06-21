import pytest
from unittest.mock import patch

from backend.services.model.ElectricityPrice import ElectricityPrice, PyObjectId
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.api.price_routes import get_prices, get_price, create_price, update_price, delete_price


@pytest.mark.asyncio
@patch("backend.api.price_routes.get_all_prices_from_db")
async def test_get_prices(mock_get_all_prices):
    mock_get_all_prices.return_value = [
        ElectricityPrice(_id=PyObjectId("67f514095b899d19b77dc6d8"),price=0.15, date="2025-10-01", created_at=None, updated_at=None, is_default=True),
        ElectricityPrice(_id=PyObjectId("673250f024d31720fe07fc4e"),price=0.20, date="2025-10-02", created_at=None, updated_at=None, is_default=False)
    ]

    result = await get_prices()

    assert len(result) == 2
    assert result[0].price == 0.15

@pytest.mark.asyncio
@patch("backend.api.price_routes.get_price_from_db")
async def test_get_price(mock_get_price):
    mock_get_price.return_value = ElectricityPrice(_id=PyObjectId("67f514095b899d19b77dc6d8"),price=0.15, date="2023-10-01", created_at=None, updated_at=None, is_default=True)

    result = await get_price("67f514095b899d19b77dc6d8")
    assert result.price == 0.15

@pytest.mark.asyncio
@patch("backend.api.price_routes.get_price_from_db", side_effect=NoObjectHasFoundException())
async def test_get_price_not_found(mock_delete):
    electricity_price_id = "fedcba987654321001234567"

    with pytest.raises(HTTPException) as exc:
        await get_price(electricity_price_id)

    assert exc.value.status_code == 404
    assert "No object found" in exc.value.detail
    mock_delete.assert_called_once_with(electricity_price_id)


@pytest.mark.asyncio
@patch("backend.api.price_routes.save_price_to_db")
async def test_create_price(mock_save_price):
    create_electricity_price = ElectricityPrice(_id=PyObjectId("67f514095b899d19b77dc6d8"),price=0.15,date="2023-10-01",created_at=None,updated_at=None,is_default=True)

    await create_price(create_electricity_price)

    mock_save_price.assert_called_once_with(create_electricity_price)

@pytest.mark.asyncio
@patch("backend.api.price_routes.update_price_in_db")
@patch("backend.api.price_routes.get_price_from_db")
async def test_update_price_success(mock_get_price, mock_update_price):
    mock_get_price.return_value = ElectricityPrice(
        _id=PyObjectId("67f514095b899d19b77dc6d8"),
        price=0.20,
        date="2023-10-02",
        created_at=None,
        updated_at=None,
        is_default=False
    )

    electricity_price = ElectricityPrice(
        _id=PyObjectId("67f514095b899d19b77dc6d8"),
        price=0.20,
        date="2023-10-02",
        created_at=None,
        updated_at=None,
        is_default=False
    )

    result = await update_price("67f514095b899d19b77dc6d8", electricity_price)

    assert result.price == 0.20
    mock_update_price.assert_called_once_with("67f514095b899d19b77dc6d8", electricity_price)
    mock_get_price.assert_called_once_with("67f514095b899d19b77dc6d8")

from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from fastapi import HTTPException
import pytest

@pytest.mark.asyncio
@patch("backend.api.price_routes.update_price_in_db", side_effect=NoObjectHasFoundException())
async def test_update_price_not_found(mock_update_price):
    from backend.api.price_routes import update_price

    electricity_price = ElectricityPrice(
        _id=PyObjectId("0123456789abcdef01234567"),
        price=0.20,
        date="2023-10-02",
        created_at=None,
        updated_at=None,
        is_default=False
    )

    with pytest.raises(HTTPException) as exc_info:
        await update_price("nonexistentid", electricity_price)

    assert exc_info.value.status_code == 404
    assert "No object found" in exc_info.value.detail


@pytest.mark.asyncio
@patch("backend.api.price_routes.delete_price_from_db")
async def test_delete_price_ok(mock_delete):
    electricity_price_id = "0123456789abcdef01234567"

    result = await delete_price(electricity_price_id)

    assert result is None
    mock_delete.assert_called_once_with(electricity_price_id)


@pytest.mark.asyncio
@patch("backend.api.price_routes.delete_price_from_db", side_effect=NoObjectHasFoundException())
async def test_delete_price_not_found(mock_delete):
    electricity_price_id = "fedcba987654321001234567"

    with pytest.raises(HTTPException) as exc:
        await delete_price(electricity_price_id)

    assert exc.value.status_code == 404
    assert "No object found" in exc.value.detail
    mock_delete.assert_called_once_with(electricity_price_id)
