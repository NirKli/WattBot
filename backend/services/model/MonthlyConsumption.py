from datetime import datetime
from typing import Any

from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import core_schema


class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, value) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")

        return ObjectId(value)


class MonthlyConsumption(BaseModel):
    oid: PyObjectId = Field(default=None, alias="_id")
    modified_date: datetime
    date: datetime
    total_kwh_consumed: float
    price: float
    original_file: object
    file_name: str
    label_file: object
    file_label_name: object
    conf_array: list[dict]
    score: float

    class ConfigDict:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        validate_by_name = True
