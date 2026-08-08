# AnonymousXchange Frontend

AI-First Digital Asset Exchange – React + TypeScript + Vite + Tailwind CSS v4

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Redux Toolkit
- React Router v7
- Axios + Socket.IO client

## Structure

```
src/
├── api/            # Axios client + API modules
├── components/     # UI components (layout, chat, dashboard, etc.)
├── hooks/          # Custom React hooks
├── pages/          # Route pages
├── store/          # Redux store + slices
├── styles/         # Global styles
├── types/          # TypeScript types
└── utils/          # Helpers
```

## Environment

```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```
