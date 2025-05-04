import os
import shutil

from starlette.datastructures import UploadFile
from ultralytics import YOLO

from services.model.MonthlyConsumption import MonthlyConsumption


class ProcessImage:
    model = YOLO("models/best.pt")

    def process_image(self, file: UploadFile):
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)

        results = self.model(temp_file_path, save=True, save_dir="process_imgs", rect=True, save_txt=True)
        results[0].show()

        detections = []
        for box in results[0].boxes:
            cls = int(box.cls.item())
            conf = float(box.conf.item())
            label = self.model.names[cls]
            x_center = box.xywh[0][0].item()
            detections.append((x_center, label, conf))

        detections.sort(key=lambda x: x[0])

        output = ''.join([lbl for _, lbl, _ in detections])
        with_conf = ' '.join([f"{lbl}:{conf:.2f}" for _, lbl, conf in detections])

        print("Predicted Number:", float(output))
        print("Digits with Confidence:", with_conf)
        monthly_consumption = MonthlyConsumption(
            modified_date="2023-10-01",
            date="2023-10-01",
            total_kwh_consumed=float(output),
            price=0.0,
            original_file=temp_file_path,
            file_name=file.filename,
            label_file="runs/detect/predict/" + temp_file_path.replace("JPEG","jpg") ,
            file_label_name="runs/detect/predict/labels/" + file.filename.replace("JPEG","txt"),
        )
        os.remove(temp_file_path)
        shutil.rmtree("runs/detect/predict/")

        return monthly_consumption
