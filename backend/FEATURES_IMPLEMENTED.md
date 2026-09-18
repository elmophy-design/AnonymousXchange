# Features 1–9 Implemented (AnonymousXchange)

## 1. Global AI chat widget
- `frontend/src/components/chat/GlobalChatWidget/GlobalChatWidget.tsx`
- Mounted in `Layout` on every page (floating button bottom-right)

## 2. Homepage live rates strip
- `frontend/src/components/rates/LiveRatesStrip/LiveRatesStrip.tsx`
- Auto-refreshes every 60s from `GET /api/rates` (backed by CoinGecko + gift-card table)
- Shown under Navbar on all Layout pages

## 3. Receipts
- `frontend/src/components/dashboard/Receipt/Receipt.tsx` — view / print / download
- Backend: `src/services/receipt.service.ts`
- Integrated on Dashboard detail panel

## 4. Account management
- `frontend/src/pages/Account/Account.tsx` — profile, password change, linked channels
- Routes: `GET/PATCH /api/users/me`, `POST /api/users/me/password`, `GET /api/users/me/channels`
- Navbar links to `/account` when authenticated

## 5. Support flow
- Enhanced `frontend/src/pages/Support/Support.tsx` — ticket form + AI handoff tips
- `POST /api/support/tickets` (+ optional email to SUPPORT_EMAIL)

## 6. Transaction timeline
- `frontend/src/components/dashboard/Timeline/Timeline.tsx`
- Dashboard: select a tx → status timeline + receipt button

## 7. Multi-channel webhooks
- `POST /api/webhooks/telegram`
- `GET/POST /api/webhooks/whatsapp` (Meta verify + messages)
- Existing `telegram.service` / `whatsapp.service` handle messages via chatService
- Channel links listed on Account page

## 8. Richer chat UX
- Message bubbles parse image URLs and show reliable previews
- ChatInput supports compact mode + image upload
- `chatApi.streamMessage` SSE client ready for `/chat/messages/stream`
- Typing indicator + Global widget

## 9. Trust section
- `frontend/src/components/home/TrustSection.tsx` on homepage
- Security, how it works, fees overview

## Live rates source
- Crypto: CoinGecko public API (`rates.service.ts`)
- Gift cards: seeded rates in service + DB upsert
- Cached in Postgres `Rate` model

## Setup
```bash
# Backend
cd backend && bash scripts/setup.sh
# edit .env — especially DATABASE_URL, JWT_*, TELEGRAM_*, WHATSAPP_*

# Frontend
cd frontend && bash scripts/setup.sh
# set VITE_API_URL to your API
```

## Production checklist (feature 10 related)
1. Set production DATABASE_URL (Supabase/Render/Neon)
2. Run `npx prisma migrate deploy`
3. Set JWT secrets, FRONTEND_URL, CORS
4. Set TELEGRAM_BOT_TOKEN and register webhook
5. Set WhatsApp token + phone id + verify token; configure Meta webhook
6. Optional: OPENAI_API_KEY for full LLM; SMTP for tickets
7. Deploy FE with correct VITE_API_URL / VITE_WS_URL
