from bson.objectid import ObjectId

from services.db_client import save_imgs_db
from services.exception.NoObjectHasFoundException import NoObjectHasFoundException


def get_file_from_db(file_id):
    file_data = save_imgs_db.open_download_stream(ObjectId(file_id))
    if file_data:
        return file_data.read()
    else:
        raise NoObjectHasFoundException()


def save_file_to_db(path, filename):
    with open(path, "rb") as file_data:
        file_id = save_imgs_db.upload_from_stream(filename, file_data)
    return file_id
