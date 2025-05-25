from PIL import Image
import os
import cv2
import albumentations as A
import numpy as np

input_folder = "lcd-detection/images/original_imgs"
output_folder = "lcd-detection/images/train_augmented"

os.makedirs(output_folder, exist_ok=True)

# Augmentation pipeline
augment = A.Compose([
    A.RandomBrightnessContrast(p=0.8),
    A.HueSaturationValue(hue_shift_limit=10, sat_shift_limit=15, val_shift_limit=10, p=0.7),
    A.GaussianBlur(blur_limit=(3, 5), p=0.3),
    A.Affine(scale=(0.95, 1.05), translate_percent=0.02, rotate=(-5, 5), p=0.5)
])

for filename in os.listdir(input_folder):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        img_path = os.path.join(input_folder, filename)
        img_pil = Image.open(img_path)

        # Save original
        img_pil.save(os.path.join(output_folder, filename))

        # Rotate +45 and -45
        img_pil.rotate(45, expand=True).save(os.path.join(output_folder, f"r45_{filename}"))
        img_pil.rotate(-45, expand=True).save(os.path.join(output_folder, f"r-45_{filename}"))

        # Convert to OpenCV format for augmentation
        img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

        # Apply 2 random augmentations
        for i in range(1, 3):
            augmented = augment(image=img_cv)['image']
            aug_filename = f"aug{i}_{filename}"
            cv2.imwrite(os.path.join(output_folder, aug_filename), augmented)
