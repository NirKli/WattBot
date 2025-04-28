from PIL import Image
import os

input_folder = "lcd-detection/images/train"
output_folder = "lcd-detection/images/train_augmented"

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png"):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)

        # Save original
        img.save(os.path.join(output_folder, filename))

        # Rotate +90 degrees
        img.rotate(45, expand=True).save(os.path.join(output_folder, f"r45_{filename}"))

        # Rotate -90 degrees
        img.rotate(-45, expand=True).save(os.path.join(output_folder, f"r-45_{filename}"))