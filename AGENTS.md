# AI-Powered Business Complaint Platform

## Repository shape

- `bcip-frontend/` is the Next.js 16 App Router frontend. Follow its local [AGENTS.md](bcip-frontend/AGENTS.md) before changing frontend files; it contains generated Next.js guidance that must be preserved.
- `bcip-backend/` is the TypeScript Express API. Prisma with PostgreSQL is the persistence layer, and the complaint feature also has domain/application/infrastructure boundaries under `src/modules/complaints/`.
- `bcip-ai-services/` is the Python FastAPI NLP service. Its API is mounted at `/api/v1`, with `/health` and `/api/v1/analyze` as the key endpoints.
- `bcip-ai-services/docker-compose.yml` provides local PostgreSQL on `5432` and Redis on `6379`; it does not run the FastAPI service.

## Commands

Run commands from the service directory that owns them:

```text
Frontend: npm run dev | npm run lint | npm run build | npm run start
Backend:  npm run dev | npm run typecheck | npm run build | npm test
AI API:   uvicorn app.main:app --reload --port 8000
Infra:    docker compose -f bcip-ai-services/docker-compose.yml up -d
```

There is no root build or test command. Install dependencies separately in `bcip-frontend/` and `bcip-backend/`; create a Python environment and install `bcip-ai-services/requirements.txt` for the AI service.

## Integration facts

- The backend loads `.env` from the repository root, validates `DATABASE_URL`, requires a `JWT_SECRET` of at least 32 characters, and uses `PORT` (default `3000`). Set a distinct backend port when running the frontend locally.
- The backend health endpoint is `/health`. Express routes are mounted under `/api/complaints` and `/api/v1`; authentication routes are under `/api/v1/auth`.
- The backend calls the AI service through `AI_SERVICE_URL`, defaulting to `http://localhost:8000`.
- The frontend API client requires `NEXT_PUBLIC_API_BASE_URL` at build/runtime. Keep CORS origins aligned with the frontend URL and the backend port.
- Treat tenant identity and authorization as part of every backend complaint operation. Do not bypass the existing auth, tenant, validation, correlation, idempotency, rate-limit, or error middleware.

## Change conventions

- Preserve the existing TypeScript strictness, Prisma schema/migration workflow, domain interfaces, and FastAPI Pydantic schemas. Prefer the nearest existing feature pattern over introducing a new abstraction.
- Keep persistence details out of complaint domain interfaces; adapters and repositories translate between domain objects and Prisma records.
- Add or update focused tests for backend use cases and run the narrowest relevant command before broader validation.
- Do not commit secrets, `.env` files, generated `dist/` output, or dependency directories.

## Documentation

- The [frontend README](bcip-frontend/README.md) contains the current Next.js starter workflow.
- The root [README](README.md) is currently only a project title; update it when establishing project-wide setup documentation rather than duplicating instructions here.