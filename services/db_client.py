import os
import pymongo
import gridfs

mongo_client = pymongo.MongoClient("mongodb://" + os.environ["MONGODB_URL"])
mongo_db = mongo_client["monthly-consumption"]
save_imgs_db = gridfs.GridFSBucket(mongo_db)