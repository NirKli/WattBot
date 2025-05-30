from fastapi import APIRouter, HTTPException

from services.crud.crud_electricity_price import get_all_prices_from_db, get_price_from_db, save_price_to_db, \
    update_price_in_db, delete_price_from_db
from services.exception.NoObjectHasFoundException import NoObjectHasFoundException
from services.model.ElectricityPrice import ElectricityPrice

router = APIRouter()


@router.get("/electricity-prices", response_model=list[ElectricityPrice])
async def get_prices() -> list[ElectricityPrice]:
    return get_all_prices_from_db()


@router.get("/electricity-price/{electricity_price_id}", response_model=ElectricityPrice)
async def get_price(electricity_price_id: str) -> ElectricityPrice:
    try:
        return get_price_from_db(electricity_price_id)
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.post("/electricity-price")
async def create_price(electricity_price: ElectricityPrice):
    save_price_to_db(electricity_price)


@router.put("/electricity-price/{electricity_price_id}", response_model=ElectricityPrice)
async def update_price(electricity_price_id: str, electricity_price: ElectricityPrice) -> ElectricityPrice:
    try:
        update_price_in_db(electricity_price_id, electricity_price)
        return get_price_from_db(electricity_price_id)
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")


@router.delete("/electricity-price/{electricity_price_id}")
async def delete_price(electricity_price_id: str):
    try:
        delete_price_from_db(electricity_price_id)
    except NoObjectHasFoundException:
        raise HTTPException(status_code=404, detail="No object found with the given ID.")
