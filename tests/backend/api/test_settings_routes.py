import pytest
from unittest.mock import patch
from backend.api.settings_routes import get_settings, update_settings
from backend.services.model.Settings import Settings

@pytest.mark.asyncio
@patch("backend.api.settings_routes.get_setting_from_db")
async def test_get_settings(mock_get):
    mock_get.return_value = Settings(currency="USD", calculate_price=True, dark_mode_preference="auto", debug_mode=False)
    result = await get_settings()
    assert isinstance(result, Settings)
    assert result.currency == "USD"

@pytest.mark.asyncio
@patch("backend.api.settings_routes.update_setting_in_db")
@patch("backend.api.settings_routes.get_setting_from_db")
async def test_update_settings(mock_get, mock_update):
    expected = Settings(currency="EUR", calculate_price=False, dark_mode_preference="off", debug_mode=True)
    mock_get.return_value = expected
    result = await update_settings(expected)
    assert result.currency == "EUR"
