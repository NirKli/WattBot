import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import monthly_consumption_routes
from backend.api import price_routes
from backend.api import settings_routes
from backend.migrations.runner import run_data_migrations
from backend.services.db_client import get_db


@asynccontextmanager
async def lifespan(app: FastAPI):

    db = get_db()

    # Run migrations in background (non-blocking)
    def _run_migrations():
        run_data_migrations(db)

    thread = threading.Thread(
        target=_run_migrations,
        daemon=True
    )
    thread.start()

    yield


app = FastAPI(lifespan=lifespan)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:80",    # Production
    "http://localhost",       # Production without port
    "http://127.0.0.1:5173",  # Alternative localhost
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
