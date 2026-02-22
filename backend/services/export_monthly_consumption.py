import io
from datetime import datetime
from typing import List, Any, IO, cast

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

from backend.services.crud.crud_monthly_consumption import get_all_monthly_consumption_from_db
from backend.services.crud.crud_settings import get_setting_from_db


def _get_currency_symbol(currency_code: str) -> str:
    # normalize to uppercase to match common codes
    if not currency_code:
        return ""
    code = currency_code.upper()
    symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "ILS": "₪",
        "JPY": "¥",
        "CNY": "¥",
        "INR": "₹",
        "BTC": "₿",
    }
    return symbols.get(code, code)


def _prepare_dataframe(items: List[Any]) -> pd.DataFrame:
    # items are MonthlyConsumption model instances
    # build list of dicts sorted by date ascending
    rows = []
    for it in items:
        rows.append({
            "modified_date": it.modified_date,
            "date": it.date,
            "total_kwh_consumed": it.total_kwh_consumed,
            "price": it.price,
        })

    # sort by date ascending
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df = df.sort_values("date").reset_index(drop=True)

    # compute delta compared to previous month
    df["delta_kwh"] = df["total_kwh_consumed"].diff().fillna(df["total_kwh_consumed"]).round(3)

    # format dates to ISO strings
    df["modified_date"] = df["modified_date"].apply(lambda x: x.isoformat() if isinstance(x, datetime) else str(x))
    df["date"] = df["date"].apply(lambda x: x.date().isoformat() if isinstance(x, datetime) else str(x))

    # format price values using currency symbol from settings
    try:
        settings = get_setting_from_db()
        currency_code = getattr(settings, "currency", "") or ""
    except Exception:
        # if settings retrieval fails, fall back to no symbol
        currency_code = ""

    symbol = _get_currency_symbol(currency_code)

    # ensure numeric prices are formatted with 2 decimals and prefixed with symbol
    def _format_price(val):
        if val is None or (isinstance(val, float) and pd.isna(val)):
            return ""
        try:
            # try to coerce to float then format
            return f"{symbol}{float(val):.2f}"
        except Exception:
            # fallback to str
            return f"{symbol}{val}"

    df["price"] = df["price"].apply(_format_price)

    # reorder columns
    df = df[["modified_date", "date", "total_kwh_consumed", "price", "delta_kwh"]]
    return df


def build_csv_bytes() -> bytes:
    items = get_all_monthly_consumption_from_db()
    df = _prepare_dataframe(items)
    buf = io.BytesIO()
    # cast to a file-like for the type checker
    df.to_csv(cast(IO[Any], buf), index=False)
    return buf.getvalue()


def build_xlsx_bytes() -> bytes:
    items = get_all_monthly_consumption_from_db()
    df = _prepare_dataframe(items)
    buf = io.BytesIO()
    # use openpyxl engine (already a dependency)
    with pd.ExcelWriter(cast(IO[Any], buf), engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="monthly_consumption")
    return buf.getvalue()


def build_pdf_bytes() -> bytes:
    items = get_all_monthly_consumption_from_db()
    df = _prepare_dataframe(items)
    buf = io.BytesIO()

    # create a PDF with a simple table using reportlab
    doc = SimpleDocTemplate(buf, pagesize=landscape(letter))
    elements = []

    if df.empty:
        data = [["No data available"]]
    else:
        # build table data including header
        cols = list(df.columns)
        data = [cols] + df.values.tolist()
        # convert any non-string entries to str for reportlab
        for i in range(len(data)):
            data[i] = ["" if v is None else str(v) for v in data[i]]

    table = Table(data)
    table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ])
    table.setStyle(table_style)
    elements.append(table)

    doc.build(elements)
    buf.seek(0)
    return buf.getvalue()