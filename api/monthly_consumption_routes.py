from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/monthly-consumption")
async def process_image(file: UploadFile = File(...)):
    return {"filename": file.filename}
