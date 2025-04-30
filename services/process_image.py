import os
import re
import shutil

from PIL import Image
from paddleocr import PaddleOCR
from starlette.datastructures import UploadFile
from ultralytics import YOLO


class ProcessImage:
    model = YOLO("models/best.pt")

    def process_image(self, file: UploadFile):

        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)

        results = self.model(temp_file_path, save=True, project="process_imgs")  # Predict on an image
        results[0].show()  # Display results

        image = Image.open(f"{temp_file_path}")  # Display results
        # Image.open(f"{temp_file_path}").show()  # Display results
        boxes = results[0].boxes.xyxy[0]  # get boxes from the first image
        image.crop(boxes[0], boxes[1], boxes[2], boxes[3])

        paddleocr = PaddleOCR(use_angle_cls=True, det_db_box_thresh=0.1, drop_score=0.7,
                              lang='en')  # need to run only once to download and load model into memory
        results = paddleocr.ocr(temp_file_path, cls=True)
        for result in results:
            #   print(f"Result: {result}")
            for line in result:
                #   print(f"Line: {line}")
                for word_info in line:
                    #     print(f"Word Info: {word_info}")
                    for word in word_info:
                        #    print(f"Word: {word}")
                        if isinstance(word, str):
                            if re.fullmatch("\d+(\.\d+)?", word):
                                print(f"Word is: {word}")
                                os.remove(temp_file_path)
                                return word

        os.remove(temp_file_path)
