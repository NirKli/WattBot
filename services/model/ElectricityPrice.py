from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import core_schema
from pydantic.json import pydantic_encoder


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


class ElectricityPrice(BaseModel):
    oid: PyObjectId = Field(alias="_id")
    price: float
    date: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_default: bool

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
        }
        populate_by_name: True
