from fastapi import APIRouter

from services.db_save import get_setting_from_db, update_setting_in_db
from services.model.Settings import Settings

router = APIRouter()


@router.get("/settings")
async def get_settings():
    return get_setting_from_db()


@router.put("/settings", response_model=Settings)
async def update_settings(setting: Settings) -> Settings:
    update_setting_in_db(setting)
    return get_setting_from_db()
