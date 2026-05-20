import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.schemas.schemas import ChatMessageIn, ChatResponse
from app.services.rag_service import answer_query

from app.main import limiter

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Use same key strategy as main.py OR import limiter from there
limiter = Limiter(key_func=get_remote_address)


# ============================================================
# Authenticated chat
# ============================================================
@router.post("", response_model=ChatResponse)
@limiter.limit("5/minute")
async def chat(
    request: Request,  # REQUIRED -
    payload: ChatMessageIn,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return await answer_query(
        db=db,
        message=payload.message,
        session_id=payload.session_id,
        user_id=uuid.UUID(user_id),
        channel="web",
    )


# ============================================================
# Anonymous chat (stricter)

@router.post("/anonymous", response_model=ChatResponse)
@limiter.limit("2/minute")  # stricter for abuse protection
async def chat_anonymous(
    request: Request,  # REQUIRED  
    payload: ChatMessageIn,
    db: AsyncSession = Depends(get_db),
):
    return await answer_query(
        db=db,
        message=payload.message,
        session_id=payload.session_id,
        channel="web",
    )