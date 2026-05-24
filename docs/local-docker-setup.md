# Run All Services Locally With Docker

Use this workflow when you want to run the whole app after cloning the repository. It is meant for local evaluation and onboarding, not active code maintenance.

The Docker app services do not mount source-code volumes and do not promise hot reload. If you change app code, rebuild the containers.

## Setup

1. Copy the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill required secrets in `.env`:

   ```text
   OPENAI_API_KEY=...
   ANTHROPIC_API_KEY=...
   JWT_SECRET=...
   JWT_EXPIRES_IN=86400000
   ```

3. Start the full stack:

   ```bash
   docker compose up --build
   ```

4. Rebuild after code changes:

   ```bash
   docker compose up --build
   ```

## Services

- `frontend`: Next.js app
- `backend`: Express API
- `backend-worker`: BullMQ worker for AI review enrichment
- `db`: PostgreSQL
- `redis`: Redis queue backend
- `rustfs`: S3-compatible object storage
- `rustfs-bucket-init`: local bucket initializer

## Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Database health check: `http://localhost:4000/database`
- RustFS S3 endpoint: `http://localhost:9000`
- RustFS console: `http://localhost:9001`

## Useful Commands

Seed data:

```bash
docker compose exec backend npm run seed
```

Check backend env:

```bash
docker compose exec backend npm run env:check
```

Inspect the queue from the host:

```bash
npm run queue:status
```
