from datetime import datetime
from typing import Optional, Literal

from bson import ObjectId
from pydantic import BaseModel


class Settings(BaseModel):
    _id: Optional[int] = 1
    currency: Optional[str] = "usd"
    dark_mode_preference: Optional[Literal['auto', 'on', 'off']] = 'auto'
    debug_mode: Optional[bool] = False
    calculate_price: Optional[bool] = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "populate_by_name": True,
    }
