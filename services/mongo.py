import pymongo


mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")

mongo_db = mongo_client["monthly-consumption"]

print(mongo_db.list_collection_names())
