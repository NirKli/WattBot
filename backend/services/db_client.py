import os

import gridfs
import pymongo


def get_db():
    return pymongo.MongoClient("mongodb://" + os.environ["MONGODB_URL"])["monthly-consumption"]


def get_fs_bucket():
    return gridfs.GridFSBucket(get_db())
