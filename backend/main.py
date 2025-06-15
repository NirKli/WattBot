from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import monthly_consumption_routes
from backend.api import price_routes
from backend.api import settings_routes

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:80",    # Production
    "http://localhost",       # Production without port
    "http://127.0.0.1:5173",  # Alternative localhost
    "http://192.168.1.154:5173",  # Alternative localhost
    "http://100.96.72.9:5173",  # Alternative localhost
    "http://127.0.0.1:80",    # Alternative production
    "http://127.0.0.1",       # Alternative localhost without port
    "http://wattbot-ui",      # Docker service name
    "http://wattbot-ui:80",   # Docker service name with port
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
app.include_router(settings_routes.router)
