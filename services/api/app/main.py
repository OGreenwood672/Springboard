from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db

from app.routers import (
    auth,
    profiles,
    businesses,
    opportunities,
    applications,
    matches,
    ai_coach,
    conversations,
    councils,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed data in standalone mode if needed
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Springboard - UK Youth Opportunities and Business Portal",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(businesses.router)
app.include_router(opportunities.router)
app.include_router(applications.router)
app.include_router(matches.router)
app.include_router(ai_coach.router)
app.include_router(conversations.router)
app.include_router(councils.router)


@app.get("/health", tags=["Infrastructure"])
def health_check():
    """Health check endpoint to verify API and environment status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
    }
