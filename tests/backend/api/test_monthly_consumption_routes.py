import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from datetime import datetime, date
from bson import ObjectId

from backend.api.monthly_consumption_routes import get_file, update_monthly_consumption, get_monthly_consumption
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
@patch("backend.api.monthly_consumption_routes.update_monthly_consumption_in_db")
@patch("backend.api.monthly_consumption_routes.get_monthly_consumption_from_db")
async def test_raises_404_when_monthly_consumption_not_found(mock_get, mock_update):
    mock_update.side_effect = None
    mock_get.side_effect = NoObjectHasFoundException
    mock_get.return_value = sample_consumption
    with pytest.raises(HTTPException) as exc:
        await update_monthly_consumption("invalid_id", sample_consumption)
    assert exc.value.status_code == 404
    assert exc.value.detail == "No object found with the given ID."



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

@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.build_csv_bytes")
async def test_export_monthly_consumptions_returns_csv(mock_build_csv):
    mock_build_csv.return_value = b"col1,col2\n1,2\n"
    response = await monthly_consumption_routes.export_monthly_consumptions("csv")
    assert response.media_type == "text/csv"
    assert "attachment; filename=monthly_consumption.csv" in response.headers["Content-Disposition"]
    assert response.body == b"col1,col2\n1,2\n"


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.build_xlsx_bytes")
async def test_export_monthly_consumptions_returns_xlsx(mock_build_xlsx):
    mock_build_xlsx.return_value = b"xlsx-bytes"
    response = await monthly_consumption_routes.export_monthly_consumptions("xlsx")
    assert response.media_type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment; filename=monthly_consumption.xlsx" in response.headers["Content-Disposition"]
    assert response.body == b"xlsx-bytes"


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.build_pdf_bytes")
async def test_export_monthly_consumptions_returns_pdf(mock_build_pdf):
    mock_build_pdf.return_value = b"%PDF-1.4"
    response = await monthly_consumption_routes.export_monthly_consumptions("pdf")
    assert response.media_type == "application/pdf"
    assert "attachment; filename=monthly_consumption.pdf" in response.headers["Content-Disposition"]
    assert response.body == b"%PDF-1.4"

@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_file_from_db")
async def test_returns_file_with_valid_id(mock_get_file):
    mock_get_file.return_value = b"file-content"
    response = await get_file("valid_file_id")
    assert response.status_code == 200
    assert response.media_type == "image/jpg"
    assert response.headers["Content-Disposition"] == "attachment; filename=valid_file_id.jpg"
    assert response.body == b"file-content"


@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_file_from_db")
async def test_raises_404_when_file_not_found(mock_get_file):
    mock_get_file.return_value = None
    with pytest.raises(HTTPException) as exc:
        await get_file("invalid_file_id")
    assert exc.value.status_code == 404
    assert exc.value.detail == "No file found with the given ID."

@pytest.mark.asyncio
@patch("backend.api.monthly_consumption_routes.get_monthly_consumption_from_db")
async def test_raises_404_when_monthly_consumption_not_found(mock_get):
    mock_get.side_effect = NoObjectHasFoundException
    with pytest.raises(HTTPException) as exc:
        await get_monthly_consumption("invalid_id")
    assert exc.value.status_code == 404
    assert exc.value.detail == "No object found with the given ID."