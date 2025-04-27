# train_model.py
from ultralytics import YOLO

model = YOLO("models/yolo11x.pt")
  # base model
model.train(data='lcd-detection/data.yaml', epochs=100, imgsz=640, batch=4, name='lcd_detector')
