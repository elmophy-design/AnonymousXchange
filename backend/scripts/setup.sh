#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "==> AnonymousXchange backend setup"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit secrets before production."
else
  echo ".env already exists (skipped)"
fi
echo "==> Installing dependencies"
npm install
echo "==> Starting Postgres + Redis (docker compose)"
if command -v docker >/dev/null 2>&1; then
  docker compose up -d || true
else
  echo "Docker not found — ensure DATABASE_URL and REDIS_URL point to running services."
fi
echo "==> Prisma generate + migrate"
npx prisma generate
npx prisma migrate dev --name init || npx prisma db push
echo "==> Done. Run: npm run dev"
echo "Health: curl http://localhost:5000/health"
echo "Telegram webhook after deploy:"
echo "  curl -X POST \"https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/setWebhook\" -H 'Content-Type: application/json' -d '{\"url\":\"https://YOUR_HOST/api/webhooks/telegram\"}'"
