"""
RAG (Retrieval-Augmented Generation) service.

Three-mode retrieval:
  1. Internal KB (pgvector cosine similarity on knowledge_chunks)
  2. Structured data injection (providers / investments tables)
  3. News fallback (latest news_articles embeddings)

Enhanced with:
  - Hybrid search (vector + full-text)
  - Strict refusal logic when context is weak
  - Improved confidence scoring (top-k weighted)
  - Groq LLM (OpenAI-compatible) for fast inference

Answer generation via Groq (LLaMA / Mixtral).
"""
from __future__ import annotations

import uuid
from typing import Any, List

from openai import AsyncOpenAI
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import (
    ChatMessage,
    ChatSession,
    KnowledgeChunk,
    NewsArticle,
    Provider,
    Investment,
    QueryLog,
)
from app.schemas.schemas import ChatResponse, ChatSource
from app.services.embedding_service import embedding_service


# ============================================================
# Groq Client
# ============================================================
_groq = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


# ============================================================
# System Prompt (Blended + Hardened)
# ============================================================
SYSTEM_PROMPT = """\
You are a trusted Kenya-first financial intelligence assistant.
You help Kenyan retail investors — including M-Pesa users, SACCO members,
and young professionals — understand investments and make informed decisions.

Scope:
- Kenyan investments: MMFs, T-bills, bonds, SACCOs, NSE stocks, REITs
- Regulators: CMA, CBK, SASRA

Rules:
- Only answer using the provided context.
- If the context is missing, weak, or irrelevant, say:
  "I don't have enough reliable information to answer that. Please ask about Kenyan investment products, regulators, or how-to guides."
- Never invent facts, numbers, or products.
- Always cite sources explicitly (e.g. "CMA list", "CBK data", "NSE report").
- Flag anything unregulated as: POTENTIALLY RISKY.
- Keep answers clear, concise, and in plain English (you may mix light Kiswahili naturally).
- End every answer with:
  "This is educational guidance only — not licensed financial advice."
"""


# ============================================================
# Hybrid Retrieval
# ============================================================
async def _hybrid_search(
    db: AsyncSession,
    query_text: str,
    query_vec: List[float],
    top_k: int = 5,
    similarity_threshold: float = 0.65,
) -> List[dict[str, Any]]:
    vec_str = "[" + ",".join(str(v) for v in query_vec) + "]"

    # Vector search
    vec_sql = text(f"""
        SELECT content, source, 'kb' AS type,
               1 - (embedding <=> '{vec_str}'::vector) AS score
        FROM knowledge_chunks
        WHERE embedding IS NOT NULL
          AND (embedding <=> '{vec_str}'::vector) < {1 - similarity_threshold}
        ORDER BY embedding <=> '{vec_str}'::vector
        LIMIT :top_k
    """)

    # Full-text search
    fts_sql = text("""
        SELECT content, source, 'kb' AS type,
               ts_rank(content_tsv, plainto_tsquery('english', :query)) AS score
        FROM knowledge_chunks
        WHERE content_tsv @@ plainto_tsquery('english', :query)
        ORDER BY score DESC
        LIMIT :top_k
    """)

    vec_results = (await db.execute(vec_sql, {"top_k": top_k})).mappings().all()
    fts_results = (await db.execute(fts_sql, {"query": query_text, "top_k": top_k})).mappings().all()

    # Merge + deduplicate
    combined = {}
    for r in vec_results:
        combined[r["content"]] = dict(r)

    for r in fts_results:
        if r["content"] not in combined:
            combined[r["content"]] = dict(r)
        else:
            combined[r["content"]]["score"] = max(
                combined[r["content"]]["score"], r["score"]
            )

    # Filter
    filtered = []
    for item in combined.values():
        score = item.get("score", 0)
        if score >= similarity_threshold or score >= 0.3:
            filtered.append(item)

    # News fallback
    news_sql = text(f"""
        SELECT summary AS content, source, 'news' AS type,
               1 - (embedding <=> '{vec_str}'::vector) AS score
        FROM news_articles
        WHERE embedding IS NOT NULL
          AND (embedding <=> '{vec_str}'::vector) < {1 - similarity_threshold}
        ORDER BY embedding <=> '{vec_str}'::vector
        LIMIT 3
    """)
    news_results = (await db.execute(news_sql)).mappings().all()
    filtered.extend(news_results)

    return filtered


# ============================================================
# Structured Context Injection
# ============================================================
async def _structured_context(db: AsyncSession, query: str) -> str:
    keywords = ["broker", "fund", "sacco", "bond", "mmf", "reit", "etf", "invest", "regulated"]

    if not any(k in query.lower() for k in keywords):
        return ""

    providers = (
        await db.execute(
            select(Provider)
            .where(Provider.regulation_status == "verified")
            .limit(8)
        )
    ).scalars().all()

    if not providers:
        return ""

    lines = ["=== Verified Kenyan Investment Providers (DB) ==="]
    for p in providers:
        lines.append(
            f"- {p.name} | Type: {p.type} | Regulated by: {p.regulated_by} | "
            f"Fees: {p.fees_text or 'N/A'} | Beginner-friendly: {p.beginner_friendly}"
        )

    return "\n".join(lines)


# ============================================================
# Confidence Scoring (Improved)
# ============================================================
def _compute_confidence(sources: List[ChatSource]) -> float:
    if not sources:
        return 0.0

    # Sort by relevance
    top = sorted(sources, key=lambda s: s.relevance, reverse=True)[:3]

    # Weighted average (top results matter more)
    weights = [0.5, 0.3, 0.2]
    score = sum(s.relevance * weights[i] for i, s in enumerate(top) if i < len(weights))

    return round(score, 2)


# ============================================================
# Main RAG Function
# ============================================================
async def answer_query(
    db: AsyncSession,
    message: str,
    session_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    channel: str = "web",
) -> ChatResponse:

    # 1. Embed query
    query_vec = embedding_service.encode_single(message)

    # 2. Retrieve context
    retrieved = await _hybrid_search(db, message, query_vec)

    if not retrieved:
        return ChatResponse(
            answer="I don't have enough reliable information to answer that. Please ask about Kenyan investment products, regulators, or how-to guides.",
            sources=[],
            confidence=0.0,
            session_id=session_id or uuid.uuid4(),
        )

    structured = await _structured_context(db, message)

    # 3. Build context
    context_parts = []
    sources: List[ChatSource] = []

    for i, r in enumerate(retrieved):
        context_parts.append(
            f"[{i+1}] ({r['source']}, score={r['score']:.2f})\n{r['content']}"
        )
        sources.append(
            ChatSource(
                title=r["content"][:60],
                source=r["source"],
                relevance=r["score"],
            )
        )

    if structured:
        context_parts.append(structured)

    context = "\n\n".join(context_parts)

    # 4. Confidence scoring
    confidence = _compute_confidence(sources)

    # Hard refusal guard
    if confidence < 0.55:
        return ChatResponse(
            answer="I don't have enough reliable information to answer that. Please ask about Kenyan investment products, regulators, or how-to guides.",
            sources=sources,
            confidence=confidence,
            session_id=session_id or uuid.uuid4(),
        )

    # 5. Load history
    history_msgs: List[dict[str, str]] = []
    if session_id:
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
        )
        for msg in reversed(result.scalars().all()):
            history_msgs.append({"role": msg.role, "content": msg.content})

    # 6. Build prompt
    user_prompt = f"Context:\n{context}\n\nUser question: {message}"
    messages = history_msgs + [{"role": "user", "content": user_prompt}]

    # 7. Call Groq
    response = await _groq.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages,
        ],
        max_tokens=800,
        temperature=0.25,
    )

    answer = response.choices[0].message.content

    # 8. Persist session
    if session_id is None:
        session = ChatSession(user_id=user_id, channel=channel)
        db.add(session)
        await db.flush()
        session_id = session.id

    db.add(ChatMessage(session_id=session_id, role="user", content=message))
    db.add(
        ChatMessage(
            session_id=session_id,
            role="assistant",
            content=answer,
            sources=[s.model_dump() for s in sources],
            confidence=confidence,
        )
    )

    # 9. Log analytics
    db.add(QueryLog(
        query_text=message[:500],
        channel=channel,
        response_confidence=confidence
    ))

    return ChatResponse(
        answer=answer,
        sources=sources,
        confidence=confidence,
        session_id=session_id,
    )