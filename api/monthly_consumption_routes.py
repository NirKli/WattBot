from fastapi import APIRouter, UploadFile, File, HTTPException

from services.NoObjectHasFoundException import NoObjectHasFoundException
from services.db_save import get_monthly_consumption_from_db
from services.model.MonthlyConsumption import MonthlyConsumption
from services.process_image import ProcessImage

router = APIRouter()
image_processor = ProcessImage()


@router.post("/monthly-consumption")
async def process_image(file: UploadFile = File(...)):
    return image_processor.process_image(file)


@router.get("/monthly-consumption/{monthly_consumption_id}", response_model=MonthlyConsumption)
async def get_monthly_consumption(monthly_consumption_id: str) -> MonthlyConsumption:
    try:
        monthly_consumption = get_monthly_consumption_from_db(monthly_consumption_id)
        return monthly_consumption
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")
