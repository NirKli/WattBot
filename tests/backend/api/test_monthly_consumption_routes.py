import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from datetime import datetime, date
from bson import ObjectId

from backend.services.model.MonthlyConsumption import MonthlyConsumption
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.api import monthly_consumption_routes

sample_id = str(ObjectId("0123456789abcdef01234567"))
sample_consumption = MonthlyConsumption(
    _id=ObjectId(sample_id),
    modified_date=datetime.now(),
    date=date(2023, 10, 1),
    total_kwh_consumed=150.0,
    price=22.5,
    original_file="file1",
    file_name="original.jpg",
    label_file="file2",
    file_label_name="label.jpg",
)


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_all_monthly_consumption_from_db")
async def test_get_all_monthly_consumptions(mock_get_all):
    mock_get_all.return_value = [sample_consumption]

    result = await monthly_consumption_routes.get_all_monthly_consumptions()

    assert len(result) == 1
    assert result[0].total_kwh_consumed == 150.0


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_latest_monthly_consumption_from_db")
async def test_get_latest_monthly_consumption(mock_get_latest):
    mock_get_latest.return_value = sample_consumption

    result = await monthly_consumption_routes.get_latest_monthly_consumption()

    assert result.price == 22.5


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_latest_monthly_consumption_from_db")
async def test_get_latest_monthly_consumption_404(mock_get_latest):
    mock_get_latest.side_effect = NoObjectHasFoundException()

    with pytest.raises(HTTPException) as exc:
        await monthly_consumption_routes.get_latest_monthly_consumption()

    assert exc.value.status_code == 404


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_monthly_consumption_from_db")
async def test_get_monthly_consumption(mock_get):
    mock_get.return_value = sample_consumption

    result = await monthly_consumption_routes.get_monthly_consumption(sample_id)

    assert result.oid == ObjectId(sample_id)


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_monthly_consumption_from_db")
@patch("backend.api.monthly_consumption_routes.update_monthly_consumption_in_db")
async def test_update_monthly_consumption(mock_update, mock_get):
    mock_get.return_value = sample_consumption

    result = await monthly_consumption_routes.update_monthly_consumption(sample_id, sample_consumption)

    assert result.file_name == "original.jpg"


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.delete_monthly_consumption_from_db")
async def test_delete_monthly_consumption(mock_delete):
    await monthly_consumption_routes.delete_monthly_consumption(sample_id)
    mock_delete.assert_called_once_with(sample_id)


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.delete_monthly_consumption_from_db")
async def test_delete_monthly_consumption_404(mock_delete):
    mock_delete.side_effect = NoObjectHasFoundException()

    with pytest.raises(HTTPException) as exc:
        await monthly_consumption_routes.delete_monthly_consumption(sample_id)

    assert exc.value.status_code == 404
