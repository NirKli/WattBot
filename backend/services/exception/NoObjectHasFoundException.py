class NoObjectHasFoundException(Exception):
    """
    Exception raised when no object is found in the database.
    """

    def __init__(self, message: str = "No object found."):
        super().__init__(message)
        self.message = message
