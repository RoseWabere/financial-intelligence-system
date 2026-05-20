"""
Kenya Financial Intelligence System — FastAPI entry point.
"""
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Rate limiting imports
# helps prevent abuse of the API, especially the open /api/chat/anonymous endpoint which is used in onboarding and WhatsApp flows. The limiter is configured globally in main.py, but we can also apply specific limits in individual routes if needed.
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.api import auth, chat, directory, market, recommendation, whatsapp_webhook, feedback
from app.core.config import settings

log = structlog.get_logger()

# ============================================================
#  Rate Limiter (GLOBAL)
# ============================================================
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10/hour"]  # baseline protection- 10 requests per hour per IP address... to adjust as needed based on expected traffic and abuse patterns.
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("startup", app=settings.APP_NAME)

    from app.services.embedding_service import embedding_service
    embedding_service.encode_single("warmup")

    log.info("embedding_model_loaded", model=settings.EMBEDDING_MODEL)
    yield
    log.info("shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Kenya-first financial intelligence: RAG Q&A, investment directory, WhatsApp bot.",
    lifespan=lifespan,
)

# ============================================================
#  Attach limiter to app

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ============================================================
# Middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Routers
# ============================================================
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(directory.router)
app.include_router(market.router)
app.include_router(recommendation.router)
app.include_router(whatsapp_webhook.router)
app.include_router(feedback.router)


# ============================================================
# Health
# ============================================================
@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}