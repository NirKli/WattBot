from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en')  # need to run only once to download and load model into memory
img_path = "photo_2025-04-19_14-43-02.jpg"
result = ocr.ocr(img_path, cls=True)