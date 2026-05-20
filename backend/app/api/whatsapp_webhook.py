"""
WhatsApp webhook router.

The Node.js whatsapp-web.js bot forwards incoming messages to:
  POST /webhook/whatsapp

This handler:
  1. Validates the shared secret header
  2. Resolves or creates a chat session keyed by phone number
  3. Runs the RAG pipeline
  4. Returns {to, body} JSON → the Node bot sends the reply back to WhatsApp
"""
import hashlib
import hmac

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.models import ChatSession, User
from app.schemas.schemas import WhatsAppIncoming, WhatsAppReply
from app.services.rag_service import answer_query

router = APIRouter(prefix="/webhook", tags=["whatsapp"])


def _verify_secret(x_whatsapp_secret: str | None = Header(None)) -> None:
    if x_whatsapp_secret != settings.WHATSAPP_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid webhook secret")


@router.post("/whatsapp", response_model=WhatsAppReply)
async def whatsapp_incoming(
    payload: WhatsAppIncoming,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_verify_secret),
) -> WhatsAppReply:
    phone = payload.from_number.strip().lstrip("+")

    # ── Find or create a user record for this WhatsApp number ─
    user = (
        await db.execute(select(User).where(User.phone == phone))
    ).scalar_one_or_none()

    # ── Find or create an open WhatsApp session ───────────────
    session = (
        await db.execute(
            select(ChatSession).where(
                ChatSession.whatsapp_number == phone,
                ChatSession.channel == "whatsapp",
            )
        )
    ).scalar_one_or_none()

    session_id = session.id if session else None

    # ── Handle onboarding keywords ────────────────────────────
    msg = payload.message.strip().lower()
    if msg in ("hi", "hello", "habari", "start"):
        return WhatsAppReply(
            to=payload.from_number,
            body=(
                "Karibu Kenya Financial Intelligence! 🇰🇪\n\n"
                "I can help you:\n"
                "• Find regulated brokers, SACCOs & funds\n"
                "• Understand bonds, T-bills, MMFs & REITs\n"
                "• Get a personalised investment plan\n\n"
                "Just ask me anything — e.g. 'Best MMF for KES 10k?'\n"
                "Or type *PLAN* to get an investment recommendation."
            ),
        )

    if msg == "plan":
        return WhatsAppReply(
            to=payload.from_number,
            body=(
                "To build your plan, reply with:\n"
                "PLAN <monthly income KES> <low/medium/high risk> <goal> <years>\n\n"
                "Example:\n"
                "PLAN 45000 medium retirement 10"
            ),
        )

    if msg.startswith("plan "):
        return await _handle_plan_command(payload.from_number, msg)

    # ── Default: RAG answer ───────────────────────────────────
    result = await answer_query(
        db=db,
        message=payload.message,
        session_id=session_id,
        user_id=user.id if user else None,
        channel="whatsapp",
    )

    # Format reply for WhatsApp (plain text, no markdown)
    body = result.answer
    if result.sources:
        src_list = ", ".join({s.source for s in result.sources[:3]})
        body += f"\n\n_Sources: {src_list}_"
    body += "\n\n_Not licensed financial advice._"

    return WhatsAppReply(to=payload.from_number, body=body)


async def _handle_plan_command(from_number: str, msg: str) -> WhatsAppReply:
    """Parse 'PLAN <income> <risk> <goal> <years>' and run decision engine."""
    from app.schemas.schemas import UserProfile
    from app.services.decision_engine import recommend

    parts = msg.split()
    try:
        income = int(parts[1])
        risk = parts[2] if parts[2] in ("low", "medium", "high") else "medium"
        goal = parts[3] if len(parts) > 3 else "retirement"
        years = int(parts[4]) if len(parts) > 4 else 5
    except (IndexError, ValueError):
        return WhatsAppReply(
            to=from_number,
            body="Format: PLAN <income KES> <low/medium/high> <goal> <years>\nExample: PLAN 50000 medium house 7",
        )

    plan_result = recommend(UserProfile(
        income_kes_monthly=income,
        risk=risk,
        goals=[goal],
        horizon_years=years,
        age=30,
    ))

    lines = [f"Your {years}-year plan (KES {income:,}/month, {risk} risk):\n"]
    for item in plan_result.plan:
        lines.append(f"• {item.category}: {item.allocation_pct}%")
        if item.example_products:
            lines.append(f"  e.g. {item.example_products[0]}")

    lines.append(f"\n{plan_result.explanation}")
    lines.append("\nActions:")
    for a in plan_result.recommended_actions[:3]:
        lines.append(f"• {a}")
    lines.append("\n_Not licensed financial advice._")

    return WhatsAppReply(to=from_number, body="\n".join(lines))
