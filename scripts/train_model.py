from ultralytics import YOLO

# base model
if __name__ == "__main__":
    model = YOLO("yolo11s-obb.pt")
    model.train(data='lcd-detection/data.yaml', epochs=200, imgsz=1280, batch=12, name='lcd_detector', device=0,
                rect=False, degrees=15,
                translate=0.1,
                scale=0.5,
                shear=2.0,
                perspective=0.0,
                fliplr=0.1,
                mosaic=1.0,
                mixup=0.2)
