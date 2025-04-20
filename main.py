from fastapi import FastAPI
from api import monthly_consumption_routes

app = FastAPI()
app.include_router(monthly_consumption_routes.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
