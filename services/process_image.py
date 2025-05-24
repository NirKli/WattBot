import os
import shutil
from datetime import datetime

from starlette.datastructures import UploadFile
from ultralytics import YOLO

from services import db_save
from services.model.MonthlyConsumption import MonthlyConsumption

DETECT_FOLDER = "runs/obb/predict/"

class ProcessImage:
    model = YOLO("models/best.pt")

    def process_image(self, file: UploadFile):
        cleanup("", DETECT_FOLDER)
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)

        results = self.model(temp_file_path, save=True, save_dir="process_imgs", rect=True, save_txt=True, imgsz=2048)
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

        print("Predicted Number:", float(output))
        print("Digits with Confidence:", with_conf)

        monthly_consumption = MonthlyConsumption(
            modified_date=datetime.now(),
            date=datetime.now(),
            total_kwh_consumed=float(output),
            price=0.0,
            original_file=db_save.save_file_to_db(temp_file_path, file.filename),
            file_name=file.filename,
            label_file=db_save.save_file_to_db(DETECT_FOLDER + temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".jpg"),
                                               temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".jpg")),
            file_label_name=db_save.save_file_to_db(
                DETECT_FOLDER + "labels/" + temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".txt"),
                temp_file_path.replace(extract_file_name_type(temp_file_path)[1], ".txt")))

        db_save.save_monthly_consumption_to_db(monthly_consumption)

        cleanup(temp_file_path, DETECT_FOLDER)

        return monthly_consumption


def extract_file_name_type(file_name):
    file_name, file_type = os.path.splitext(file_name)
    return file_name, file_type


def cleanup(temp_file_path, directory):
    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)
    if os.path.exists(directory):
        shutil.rmtree(directory)
