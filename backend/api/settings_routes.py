from fastapi import APIRouter

from backend.services.crud.crud_settings import get_setting_from_db, update_setting_in_db
from backend.services.model.Settings import Settings

router = APIRouter()


@router.get("/settings")
async def get_settings():
    return get_setting_from_db()


@router.put("/settings", response_model=Settings)
async def update_settings(setting: Settings) -> Settings:
    update_setting_in_db(setting)
    return get_setting_from_db()
