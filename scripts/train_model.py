from ultralytics import YOLO


# base model
if __name__ == "__main__":
    model = YOLO("yolo11x-obb.pt")
    model.train(data='lcd-detection/data.yaml', epochs=300, imgsz=640, batch=8, name='lcd_detector', device=0, rect=True)
