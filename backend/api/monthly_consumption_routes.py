from fastapi import APIRouter, UploadFile, File, HTTPException, Response, Query

from backend.services.crud.crud_files import get_file_from_db
from backend.services.crud.crud_monthly_consumption import get_monthly_consumption_from_db, \
    get_all_monthly_consumption_from_db, \
    update_monthly_consumption_in_db, delete_monthly_consumption_from_db, get_latest_monthly_consumption_from_db
from backend.services.exception import ResultIsNotFoundException
from backend.services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from backend.services.exception.ResultIsAlreadyExistsException import ResultIsAlreadyExistsException
from backend.services.export_monthly_consumption import build_csv_bytes, build_xlsx_bytes, build_pdf_bytes
from backend.services.model.MonthlyConsumption import MonthlyConsumption
from backend.services.process_image import ProcessImage

router = APIRouter()



@router.post("/monthly-consumption", response_model=MonthlyConsumption)
async def process_image(file: UploadFile = File(...)) -> MonthlyConsumption:
    try:
        image_processor = ProcessImage()
        monthly_consumption = image_processor.process_image(file)
        monthly_consumption.original_file = str(monthly_consumption.original_file)
        monthly_consumption.label_file = str(monthly_consumption.label_file)
        monthly_consumption.file_label_name = str(monthly_consumption.file_label_name)
        return monthly_consumption
    except ResultIsNotFoundException.ResultIsNotFoundException:
        raise HTTPException(status_code=422,
                            detail="No number has been found in the image. Please try again with a clearer image.")
    except ResultIsAlreadyExistsException:
        raise HTTPException(status_code=409,
                            detail="A reading for this month already exists. Check your history to view or edit it.")


@router.get("/monthly-consumption/latest", response_model=MonthlyConsumption)
async def get_latest_monthly_consumption() -> MonthlyConsumption:
    try:
        monthly_consumption = get_latest_monthly_consumption_from_db()
        return monthly_consumption
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.get("/monthly-consumption/{monthly_consumption_id}", response_model=MonthlyConsumption)
async def get_monthly_consumption(monthly_consumption_id: str) -> MonthlyConsumption:
    try:
        monthly_consumption = get_monthly_consumption_from_db(monthly_consumption_id)
        return monthly_consumption
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.put("/monthly-consumption/{monthly_consumption_id}", response_model=MonthlyConsumption)
async def update_monthly_consumption(monthly_consumption_id: str,
                                     monthly_consumption: MonthlyConsumption) -> MonthlyConsumption:
    try:
        update_monthly_consumption_in_db(monthly_consumption_id, monthly_consumption)
        return get_monthly_consumption_from_db(monthly_consumption_id)
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.get("/monthly-consumption", response_model=list[MonthlyConsumption])
async def get_all_monthly_consumptions() -> list[MonthlyConsumption]:
    return get_all_monthly_consumption_from_db()


@router.delete("/monthly-consumption/{monthly_consumption_id}")
async def delete_monthly_consumption(monthly_consumption_id: str):
    try:
        delete_monthly_consumption_from_db(monthly_consumption_id)
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


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


@router.get("/monthly-consumptions/export")
async def export_monthly_consumptions(file_format: str = Query("csv", pattern="^(csv|xlsx|pdf)$")):
    if file_format == "csv":
        data = build_csv_bytes()
        media_type = "text/csv"
        filename = "monthly_consumption.csv"

    elif file_format == "xlsx":
        data = build_xlsx_bytes()
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = "monthly_consumption.xlsx"

    else:
        data = build_pdf_bytes()
        media_type = "application/pdf"
        filename = "monthly_consumption.pdf"

    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
