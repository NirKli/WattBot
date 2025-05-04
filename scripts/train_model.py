# train_model.py
from ultralytics import YOLO


# base model
if __name__ == "__main__":
    model = YOLO("models/yolo11x.pt")
    model.train(data='lcd-detection/data.yaml', epochs=300, imgsz=640, batch=4, name='lcd_detector', device=0)
