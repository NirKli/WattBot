from datetime import datetime

from bson.objectid import ObjectId
from pydantic import BaseModel


class MonthlyConsumption(BaseModel):
    modified_date: datetime
    date: datetime
    total_kwh_consumed: float
    price: float
    original_file: object
    file_name: str
    label_file: object
    file_label_name: object
