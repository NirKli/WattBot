from unittest.mock import patch, MagicMock, mock_open

import pytest
from bson import ObjectId

from backend.services.crud.crud_files import get_file_from_db, save_file_to_db


@patch("backend.services.crud.crud_files.get_fs_bucket")
def test_get_file_from_db_returns_bytes(mock_get_fs_bucket):
    mock_stream = MagicMock()
    mock_stream.read.return_value = b"image data"
    mock_get_fs_bucket.return_value.open_download_stream.return_value = mock_stream

    result = get_file_from_db("682d6f4ef62c1c14eae9f014")

    assert result == b"image data"
    mock_get_fs_bucket.return_value.open_download_stream.assert_called_once_with(
        ObjectId("682d6f4ef62c1c14eae9f014")
    )


@patch("backend.services.crud.crud_files.get_fs_bucket")
def test_save_file_to_db_returns_file_id(mock_get_fs_bucket):
    expected_id = ObjectId()
    mock_get_fs_bucket.return_value.upload_from_stream.return_value = expected_id

    with patch("builtins.open", mock_open(read_data=b"raw bytes")):
        result = save_file_to_db("/tmp/meter.jpg", "meter.jpg")

    assert result == expected_id
    mock_get_fs_bucket.return_value.upload_from_stream.assert_called_once()