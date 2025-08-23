class ResultIsAlreadyExistsException(Exception):
    """
    Exception raised when the consumption is already exists in the DB.
    """

    def __init__(self, message: str = ""):
        super().__init__(message)
        self.message = message
