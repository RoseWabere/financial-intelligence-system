#!/bin/bash
# Run Alembic migrations then seed the KB
set -e
cd /app
alembic upgrade head
python scripts/seed_kb.py
echo "Migrations and seed complete."
