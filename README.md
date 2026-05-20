# Financial Intelligence System

A financial intelligence platform: investment directory, localized knowledge base, RAG Q&A, rule-based decision engine, and WhatsApp bot.

Answers “why / how / where / when” about investment products (MMFs, T‑bills, SACCOs, NSE stocks, REITs)

Questions are answered using:

* Structured directory of providers & investments (CMA/CBK/SASRA verified)
* RAG Q&A (pgvector + Claude/Groq) over a knowledge base + news
* Rule‑based decision engine that outputs illustrative allocations (not binding advice)
* WhatsApp & web chat with citations and confidence scores
* Automated scrapers for CBK, CMA, Yahoo Finance, and news



## Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.11) |
| Database | PostgreSQL + pgvector (Aiven) |
| Object Storage | MinIO |
| WhatsApp Bot | whatsapp-web.js (Node 18) + Webhook bridge |
| Worker/Cron | APScheduler in separate container |
| Embedding | sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Claude API (claude-sonnet-4-20250514) via Anthropic SDK |

## Project StructureAnswers “why / how / where / when” about investment products (MMFs, T‑bills, SACCOs, NSE stocks, REITs)

Questions are answered using:

* Structured directory of providers & investments (CMA/CBK/SASRA verified)
* RAG Q&A (pgvector + Claude/Groq) over a knowledge base + news
* Rule‑based decision engine that outputs illustrative allocations (not binding advice)
* WhatsApp & web chat with citations and confidence scores
* Automated scrapers for CBK, CMA, Yahoo Finance, and news



```
kenyan-fintel/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers
│   │   ├── core/         # Config, security, logging
│   │   ├── db/           # DB connection, base
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic (RAG, decisions, embeddings)
│   │   └── scrapers/     # Data ingestion (CBK, CMA, Yahoo, NewsAPI)
│   ├── migrations/       # Alembic
│   └── tests/
├── whatsapp-bot/         # Node.js whatsapp-web.js bot
│   └── src/
├── worker/               # Cron job container
├── docker/               # Dockerfiles
└── docker-compose.yml
```

## Quickstart

```bash
cp .env.example .env
# fill in ANTHROPIC_API_KEY, DATABASE_URL, etc.
docker compose up --build
```

API docs: http://localhost:8000/docs  
WhatsApp bot: scan QR in whatsapp-bot container logs
