import pandas as pd
from openpyxl import load_workbook


data = [
    {
        "_id": "682d7fc59976953d0a465bcb",
        "modified_date": "2025-05-21T12:19:33.763000",
        "date": "2022-03-31T00:00:00",
        "total_kwh_consumed": 286.48,
        "price": 145.1307,
        "original_file": "682d7fc19976953d0a465ba5",
        "file_name": "img9.JPG",
        "label_file": "682d7fc19976953d0a465bb7",
        "file_label_name": "682d7fc19976953d0a465bc9"
    },
    {
        "_id": "6832925c75188e41dd5c11fa",
        "modified_date": "2025-05-27T11:28:04.027000",
        "date": "2022-06-30T00:00:00",
        "total_kwh_consumed": 1090.98,
        "price": 167.8682,
        "original_file": "6832925b75188e41dd5c11f3",
        "file_name": "img2.jpg",
        "label_file": "6832925b75188e41dd5c11f5",
        "file_label_name": "6832925b75188e41dd5c11f8"
    }
]

#load data into a DataFrame object:
df = pd.DataFrame(data)

path = "data.xlsx"
df.to_excel(path, index=False)

wb = load_workbook(path)
ws = wb.active

for column_cells in ws.columns:
    max_length = 0
    column_letter = column_cells[0].column_letter

    for cell in column_cells:
        if cell.value is not None:
            max_length = max(max_length, len(str(cell.value)))

    ws.column_dimensions[column_letter].width = max_length + 2

wb.save(path)

print(df)

if __name__ == '__main__':
    print("Data exported to data.csv, data.xlsx, and data.json")
    # df.to_csv('data.csv', index=False)
    # df.to_excel('data.xlsx', index=False)
    # print("Data exported to data.csv, data.xlsx, and data.json")