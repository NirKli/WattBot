from fastapi import APIRouter, UploadFile, File

from services.process_image import ProcessImage

router = APIRouter()
image_processor = ProcessImage()


@router.post("/monthly-consumption")
async def process_image(file: UploadFile = File(...)):
    return image_processor.process_image(file)
    # return {"filename": file.filename}
