
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings
from app.routers import (
    auth_router, procedures_router, checkins_router,
    timeline_router, risk_router, scanner_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="DermTrace API",
    description="AI-assisted post-procedure recovery platform.\n\n> Not medical advice.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(procedures_router)
app.include_router(checkins_router)
app.include_router(timeline_router)
app.include_router(risk_router)
app.include_router(scanner_router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "dermatrace-api", "version": "1.0.0"}
