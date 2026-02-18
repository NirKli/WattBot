from unittest.mock import patch
from datetime import datetime
from io import BytesIO
from pypdf import PdfReader

import pandas as pd
import pytest

from backend.services.export_monthly_consumption import build_pdf_bytes
from backend.services.model.MonthlyConsumption import MonthlyConsumption


@patch("backend.services.export_monthly_consumption.get_setting_from_db")
@patch("backend.services.export_monthly_consumption.get_all_monthly_consumption_from_db")
def test_build_csv_uses_currency_symbol(mock_get_all, mock_get_settings):
    # Arrange
    mock_get_settings.return_value = type("S", (), {"currency": "USD"})()
    items = [
        MonthlyConsumption(
            modified_date=datetime(2025, 12, 1, 12, 0, 0),
            date=datetime(2025, 12, 1),
            total_kwh_consumed=100.0,
            price=12.3456,
            original_file=None,
            file_name="a.jpg",
            label_file=None,
            file_label_name="b.jpg",
            conf_array= [
                {
                    "char": "0",
                    "conf": 0.9783397912979126
                },
                {
                    "char": "0",
                    "conf": 0.8652015328407288
                },
                {
                    "char": "5",
                    "conf": 0.9761660695075989
                },
                {
                    "char": "7",
                    "conf": 0.9605460166931152
                },
                {
                    "char": "1",
                    "conf": 0.8946158289909363
                },
                {
                    "char": "8",
                    "conf": 0.9541907906532288
                },
                {
                    "char": ".",
                    "conf": 0.8447996377944946
                },
                {
                    "char": "1",
                    "conf": 0.9127216339111328
                },
                {
                    "char": "3",
                    "conf": 0.9876267313957214
                }
            ],
            score= 0.9304675592316521
        )
    ]
    mock_get_all.return_value = items

    # Act
    from backend.services.export_monthly_consumption import build_csv_bytes

    csv_bytes = build_csv_bytes()

    # Assert
    assert b"$12.35" in csv_bytes  # formatted to 2 decimals
    # header and other columns exist
    assert b"total_kwh_consumed" in csv_bytes


@patch("backend.services.export_monthly_consumption.get_setting_from_db")
@patch("backend.services.export_monthly_consumption.get_all_monthly_consumption_from_db")
def test_build_xlsx_uses_currency_symbol(mock_get_all, mock_get_settings):
    # Arrange
    mock_get_settings.return_value = type("S", (), {"currency": "EUR"})()
    items = [
        MonthlyConsumption(
            modified_date=datetime(2025, 11, 1, 12, 0, 0),
            date=datetime(2025, 11, 1),
            total_kwh_consumed=50.0,
            price=3.1,
            original_file=None,
            file_name="c.jpg",
            label_file=None,
            file_label_name="d.jpg",
            conf_array= [
                {
                    "char": "0",
                    "conf": 0.9783397912979126
                },
                {
                    "char": "0",
                    "conf": 0.8652015328407288
                },
                {
                    "char": "5",
                    "conf": 0.9761660695075989
                },
                {
                    "char": "7",
                    "conf": 0.9605460166931152
                },
                {
                    "char": "1",
                    "conf": 0.8946158289909363
                },
                {
                    "char": "8",
                    "conf": 0.9541907906532288
                },
                {
                    "char": ".",
                    "conf": 0.8447996377944946
                },
                {
                    "char": "1",
                    "conf": 0.9127216339111328
                },
                {
                    "char": "3",
                    "conf": 0.9876267313957214
                }
            ],
            score= 0.9304675592316521
        )
    ]
    mock_get_all.return_value = items

    # Act
    from backend.services.export_monthly_consumption import build_xlsx_bytes

    xlsx_bytes = build_xlsx_bytes()

    # Read back with pandas
    df = pd.read_excel(BytesIO(xlsx_bytes))

    # Assert
    assert df.loc[0, "price"] == "€3.10"
    assert "date" in df.columns


@patch("backend.services.export_monthly_consumption.get_setting_from_db")
@patch("backend.services.export_monthly_consumption.get_all_monthly_consumption_from_db")
def test_prepare_dataframe_formats_price_with_currency_symbol(mock_get_all, mock_get_settings):
    # Arrange
    mock_get_settings.return_value = type("S", (), {"currency": "ILS"})()
    items = [
        MonthlyConsumption(
            modified_date=datetime(2025, 10, 1, 12, 0, 0),
            date=datetime(2025, 10, 1),
            total_kwh_consumed=75.0,
            price=7.5,
            original_file=None,
            file_name="e.jpg",
            label_file=None,
            file_label_name="f.jpg",
            conf_array= [
                {
                    "char": "0",
                    "conf": 0.9783397912979126
                },
                {
                    "char": "0",
                    "conf": 0.8652015328407288
                },
                {
                    "char": "5",
                    "conf": 0.9761660695075989
                },
                {
                    "char": "7",
                    "conf": 0.9605460166931152
                },
                {
                    "char": "1",
                    "conf": 0.8946158289909363
                },
                {
                    "char": "8",
                    "conf": 0.9541907906532288
                },
                {
                    "char": ".",
                    "conf": 0.8447996377944946
                },
                {
                    "char": "1",
                    "conf": 0.9127216339111328
                },
                {
                    "char": "3",
                    "conf": 0.9876267313957214
                }
            ],
            score= 0.9304675592316521
        )
    ]
    mock_get_all.return_value = items

    # Act
    from backend.services.export_monthly_consumption import _prepare_dataframe

    df = _prepare_dataframe(items)

    # Assert
    assert df.loc[0, "price"] == "₪7.50"


@pytest.mark.asyncio
@patch("backend.services.export_monthly_consumption.get_all_monthly_consumption_from_db")
async def test_builds_pdf_with_valid_data(mock_get_data):
    mock_get_data.return_value = [
        MonthlyConsumption(
            modified_date=datetime(2025, 10, 1, 12, 0, 0),
            date=datetime(2025, 10, 1),
            total_kwh_consumed=75.0,
            price=7.5,
            original_file=None,
            file_name="e.jpg",
            label_file=None,
            file_label_name="f.jpg",
            conf_array= [
                {
                    "char": "0",
                    "conf": 0.9783397912979126
                },
                {
                    "char": "0",
                    "conf": 0.8652015328407288
                },
                {
                    "char": "5",
                    "conf": 0.9761660695075989
                },
                {
                    "char": "7",
                    "conf": 0.9605460166931152
                },
                {
                    "char": "1",
                    "conf": 0.8946158289909363
                },
                {
                    "char": "8",
                    "conf": 0.9541907906532288
                },
                {
                    "char": ".",
                    "conf": 0.8447996377944946
                },
                {
                    "char": "1",
                    "conf": 0.9127216339111328
                },
                {
                    "char": "3",
                    "conf": 0.9876267313957214
                }
            ],
            score= 0.9304675592316521
        )
    ]
    result = build_pdf_bytes()
    assert b"%PDF" in result

    from io import BytesIO

    reader = PdfReader(BytesIO(result))
    extracted_text = ""
    for page in reader.pages:
        extracted_text += page.extract_text() or ""

    assert "2025-10-01" in extracted_text
    assert "75.0" in extracted_text or "75" in extracted_text


@pytest.mark.asyncio
@patch("backend.services.export_monthly_consumption.get_all_monthly_consumption_from_db")
async def test_builds_pdf_with_empty_data(mock_get_data):
    mock_get_data.return_value = []
    result = build_pdf_bytes()
    assert b"%PDF" in result

    from io import BytesIO

    reader = PdfReader(BytesIO(result))
    extracted_text = ""
    for page in reader.pages:
        extracted_text += page.extract_text() or ""

    assert "No data available" in extracted_text
