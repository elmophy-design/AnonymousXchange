# AnonymousXchange Backend

AI-First Digital Asset Exchange Backend (Gift Cards + Crypto)

## Tech Stack

- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- Redis
- Socket.IO (real-time rates & chat)
- Zod (validation)
- JWT Auth

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start infrastructure (Postgres + Redis)

```bash
docker compose up -d
```

### 4. Database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run in development

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Project Structure

```
src/
├── api/            # Route definitions
├── config/         # Environment & database
├── controllers/    # Request handlers
├── services/       # Business logic (to be implemented)
├── middleware/     # Auth, validation, error handling
├── websockets/     # Real-time rates & chat
├── utils/          # Helpers & logger
├── types/          # TypeScript types
├── app.ts          # Express app
└── server.ts       # Entry point
```

## Available Scripts

| Command               | Description                    |
|-----------------------|--------------------------------|
| `npm run dev`         | Start development server       |
| `npm run build`       | Compile TypeScript             |
| `npm start`           | Run production build           |
| `npm run prisma:studio` | Open Prisma Studio           |
| `npm run prisma:migrate` | Run migrations              |

## Health Check

```
GET /health
```

## API Prefix

All routes are under `/api`

- `/api/auth`
- `/api/rates`
- `/api/transactions`
- `/api/chat`
- `/api/users`
```
