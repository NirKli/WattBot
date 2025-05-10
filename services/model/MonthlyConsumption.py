from datetime import datetime

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
