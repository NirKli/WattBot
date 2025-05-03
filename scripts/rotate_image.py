import os
import cv2
import numpy as np
import albumentations as A

INPUT_IMG_DIR = "lcd-detection/images/train"
INPUT_LABEL_DIR = "lcd-detection/labels/train"
OUTPUT_IMG_DIR = "lcd-detection/images/train_augmented"
OUTPUT_LABEL_DIR = "lcd-detection/labels/train_augmented"

os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)
os.makedirs(OUTPUT_LABEL_DIR, exist_ok=True)

augment = A.Compose([
    A.RandomBrightnessContrast(p=0.8),
    A.HueSaturationValue(hue_shift_limit=10, sat_shift_limit=15, val_shift_limit=10, p=0.7),
    A.GaussianBlur(blur_limit=(3, 5), p=0.3),
    A.Affine(scale=(0.95, 1.05), translate_percent=0.02, rotate=(-5, 5), p=0.5)
], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

def load_yolo_labels(label_path):
    boxes = []
    class_labels = []
    if not os.path.exists(label_path):
        return boxes, class_labels
    with open(label_path, "r") as f:
        for line in f.readlines():
            parts = line.strip().split()
            if len(parts) != 5:
                continue
            cls, x, y, w, h = map(float, parts)
            boxes.append([x, y, w, h])
            class_labels.append(int(cls))
    return boxes, class_labels

def save_yolo_labels(label_path, boxes, classes):
    with open(label_path, "w") as f:
        for box, cls in zip(boxes, classes):
            f.write(f"{cls} {' '.join([str(round(v, 6)) for v in box])}\n")

for file in os.listdir(INPUT_IMG_DIR):
    if not file.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    name, ext = os.path.splitext(file)
    img_path = os.path.join(INPUT_IMG_DIR, file)
    label_path = os.path.join(INPUT_LABEL_DIR, f"{name}.txt")

    image = cv2.imread(img_path)
    h, w = image.shape[:2]

    boxes, class_labels = load_yolo_labels(label_path)
    if not boxes:
        continue

    # Save original to augmented folder
    cv2.imwrite(os.path.join(OUTPUT_IMG_DIR, file), image)
    save_yolo_labels(os.path.join(OUTPUT_LABEL_DIR, f"{name}.txt"), boxes, class_labels)

    for i, angle in enumerate([45, -45]):
        aug_name = f"r{angle}_{name}"
        rotate_transform = A.Compose([
            A.Rotate(limit=(angle, angle), p=1, border_mode=cv2.BORDER_CONSTANT, value=0, crop_border=False)
        ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

        rotated = rotate_transform(image=image, bboxes=boxes, class_labels=class_labels)

        cv2.imwrite(os.path.join(OUTPUT_IMG_DIR, f"{aug_name}{ext}"), rotated["image"])
        save_yolo_labels(os.path.join(OUTPUT_LABEL_DIR, f"{aug_name}.txt"), rotated["bboxes"], rotated["class_labels"])

    # Two more augmentations
    for i in range(1, 3):
        aug = augment(image=image, bboxes=boxes, class_labels=class_labels)
        aug_name = f"aug{i}_{name}"
        cv2.imwrite(os.path.join(OUTPUT_IMG_DIR, f"{aug_name}{ext}"), aug["image"])
        save_yolo_labels(os.path.join(OUTPUT_LABEL_DIR, f"{aug_name}.txt"), aug["bboxes"], aug["class_labels"])
