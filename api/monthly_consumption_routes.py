from fastapi import APIRouter, UploadFile, File, HTTPException, Response

from services.NoObjectHasFoundException import NoObjectHasFoundException
from services.db_save import get_monthly_consumption_from_db, get_file_from_db, get_all_monthly_consumption_from_db, \
    update_monthly_consumption_in_db
from services.model.MonthlyConsumption import MonthlyConsumption
from services.process_image import ProcessImage

router = APIRouter()
image_processor = ProcessImage()


@router.post("/monthly-consumption", response_model=MonthlyConsumption)
async def process_image(file: UploadFile = File(...)) -> MonthlyConsumption:
    monthly_consumption = image_processor.process_image(file)
    monthly_consumption.original_file = str(monthly_consumption.original_file)
    monthly_consumption.label_file = str(monthly_consumption.label_file)
    monthly_consumption.file_label_name = str(monthly_consumption.file_label_name)

    return monthly_consumption


@router.get("/monthly-consumption/{monthly_consumption_id}", response_model=MonthlyConsumption)
async def get_monthly_consumption(monthly_consumption_id: str) -> MonthlyConsumption:
    try:
        monthly_consumption = get_monthly_consumption_from_db(monthly_consumption_id)
        return monthly_consumption
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.put("/monthly-consumption/{monthly_consumption_id}", response_model=MonthlyConsumption)
async def update_monthly_consumption(monthly_consumption_id: str, monthly_consumption: MonthlyConsumption) -> MonthlyConsumption:
    try:
        update_monthly_consumption_in_db(monthly_consumption_id, monthly_consumption)
        return get_monthly_consumption_from_db(monthly_consumption_id)
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.get("/monthly-consumption", response_model=list[MonthlyConsumption])
async def get_all_monthly_consumptions() -> list[MonthlyConsumption]:
    return get_all_monthly_consumption_from_db()


@router.get("/monthly-consumption/file/{file_id}")
async def get_file(file_id: str):
    file_data = get_file_from_db(file_id)
    if file_data:
        return Response(
            content=file_data,
            media_type="image/jpg",
            headers={"Content-Disposition": f"attachment; filename={file_id}.jpg"})
    else:
        raise HTTPException(status_code=404, detail="No file found with the given ID.")
