import os
import sys
from fastapi import FastAPI

# Ensure services/api is on the python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
services_api_dir = os.path.abspath(os.path.join(current_dir, "..", "services", "api"))
if services_api_dir not in sys.path:
    sys.path.insert(0, services_api_dir)

from app.main import app as base_app

# Vercel ASGI Application Entrypoint
app = FastAPI(
    title="Springboard API Gateway",
    docs_url=None,
    redoc_url=None,
)

# Mount base_app at both /api and root to seamlessly handle paths with or without /api prefix
app.mount("/api", base_app)
app.mount("/", base_app)
