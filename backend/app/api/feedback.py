"""
helpful for users to flag incorrect or inappropriate messages, which can then be reviewed by admins for quality control and model improvement.
handle POST /api/feedback/message/{message_id} with body {"reason": "inappropriate content"}

"""


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.models import ChatMessage
from app.schemas.schemas import FeedbackIn

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

@router.post("/message/{message_id}")
async def flag_message(message_id: int, feedback: FeedbackIn, db: AsyncSession = Depends(get_db)):
    msg = await db.get(ChatMessage, message_id)
    if not msg:
        raise HTTPException(404, "Message not found")
    msg.flagged = True
    msg.flag_reason = feedback.reason
    await db.commit()
    return {"status": "recorded"}