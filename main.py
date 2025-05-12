from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import monthly_consumption_routes
from api import price_routes

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:80",    # Production
    "http://localhost",       # Production without port
    "http://127.0.0.1:5173",  # Alternative localhost
    "http://127.0.0.1:80",    # Alternative production
    "http://127.0.0.1",       # Alternative localhost without port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(monthly_consumption_routes.router)
app.include_router(price_routes.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
