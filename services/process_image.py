import re
import shutil
import os
import torch
from ultralytics import YOLO

from paddleocr import PaddleOCR
from starlette.datastructures import UploadFile

class ProcessImage:

    # model = torch.hub.load("ultralytics/yolov5", "yolov5s")  # Default: yolov5s
    model = YOLO("models/best.pt")

    def process_image(self, file: UploadFile):

        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)


        # img = "https://ultralytics.com/images/zidane.jpg"
        # results = self.model(img)
        # os.remove(temp_file_path)

        # results.save()  # Save results to runs/detect/exp

        # return results.pandas().xyxy[0].to_dict(orient="records")

        # train_results = self.model.train(
        #     data="lcd-detection/data.yaml",  # Path to dataset configuration file
        #     epochs=100,  # Number of training epochs
        #     imgsz=640,  # Image size for training
        #     device="cpu",  # Device to run on (e.g., 'cpu', 0, [0,1,2,3])
        #     name="lcd_detector_11n"
        # )

        results = self.model(temp_file_path)  # Predict on an image
        results[0].show()  # Display results


        paddleocr = PaddleOCR(use_angle_cls=True, det_db_box_thresh=0.1,drop_score=0.7,
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