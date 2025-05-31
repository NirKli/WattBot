from bson.objectid import ObjectId

from backend.services.db_client import get_fs_bucket
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException


def get_file_from_db(file_id):
    file_data = get_fs_bucket().open_download_stream(ObjectId(file_id))
    if file_data:
        return file_data.read()
    else:
        raise NoObjectHasFoundException()


def save_file_to_db(path, filename):
    with open(path, "rb") as file_data:
        file_id = get_fs_bucket().upload_from_stream(filename, file_data)
    return file_id
