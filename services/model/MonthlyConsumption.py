class MonthlyConsumption:
    def __init__(self, modified_date, date, total_kwh_consumed, price, original_file, file_name, label_file,
                 file_label_name):
        self.modified_date = modified_date
        self.date = date
        self.total_kwh_consumed = total_kwh_consumed
        self.price = price
        self.original_file = original_file
        self.file_name = file_name
        self.label_file = label_file
        self.file_label_name = file_label_name

    def __repr__(self):
        return f"MonthlyConsumption(modified_date={self.modified_date}, date={self.date}, total_kwh_consumed={self.total_kwh_consumed}, price={self.price}, file_name={self.file_name}, label_file={self.label_file}, file_label_name={self.file_label_name})"
