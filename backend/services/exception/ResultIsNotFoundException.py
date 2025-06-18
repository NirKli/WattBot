class ResultIsNotFoundException(BaseException):
    """
    Exception raised when no number is found in the image.
    """

    def __init__(self, message: str = "No Number has been found, on the image."):
        super().__init__(message)
        self.message = message
