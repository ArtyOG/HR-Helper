from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(
    title="HR Helper AI Service",
    version="0.1.0",
    description="AI-powered CV processing and job recommendation service",
)

app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}