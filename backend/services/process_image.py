import os
import shutil
from datetime import datetime

from starlette.datastructures import UploadFile
from ultralytics import YOLO

from backend.services.crud import crud_files, crud_monthly_consumption
from backend.services.exception.ResultIsNotFoundException import ResultIsNotFoundException
from backend.services.model.MonthlyConsumption import MonthlyConsumption

DETECT_FOLDER = "runs/obb/predict/"


class ProcessImage:
    model = YOLO("models/best.pt")

    def process_image(self, file: UploadFile):
        cleanup("", DETECT_FOLDER)
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)

        results = self.model(temp_file_path, save=True, rect=True, save_txt=True, imgsz=1280, conf=0.5)
        # results[0].show()

        detections = []
        for box in results[0].obb:
            cls = int(box.cls.item())
            conf = float(box.conf.item())
            label = self.model.names[cls]
            x_center = box.xywhr[0][0].item()
            detections.append((x_center, label, conf))

        detections.sort(key=lambda x: x[0])

        output = ''.join([lbl for _, lbl, _ in detections])
        with_conf = ' '.join([f"{lbl}:{conf:.2f}" for _, lbl, conf in detections])

        try:
            output = float(output)
        except ValueError:
            raise ResultIsNotFoundException()

        print("Predicted Number:", float(output))
        print("Digits with Confidence:", with_conf)

        monthly_consumption = MonthlyConsumption(
            modified_date=datetime.now(),
            date=datetime.now(),
            total_kwh_consumed=float(output),
            price=0.0,
            original_file=crud_files.save_file_to_db(temp_file_path, file.filename),
            file_name=file.filename,
            label_file=crud_files.save_file_to_db(
                DETECT_FOLDER + temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".jpg"),
                temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".jpg")),
            file_label_name=crud_files.save_file_to_db(
                DETECT_FOLDER + "labels/" + temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".txt"),
                temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".txt")))

        monthly_consumption_id = crud_monthly_consumption.save_monthly_consumption_to_db(monthly_consumption)

        cleanup(temp_file_path, DETECT_FOLDER)

        return crud_monthly_consumption.get_monthly_consumption_from_db(monthly_consumption_id)


def extract_file_name_type(file_name):
    file_name, file_type = os.path.splitext(file_name)
    return file_name, file_type


def cleanup(temp_file_path, directory):
    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)
    if os.path.exists(directory):
        shutil.rmtree(directory)
