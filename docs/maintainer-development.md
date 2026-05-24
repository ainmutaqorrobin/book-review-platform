# Maintainer Development

Use this workflow when you are actively editing the codebase. Docker runs shared dependencies only; backend, worker, and frontend run directly on your machine.

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

3. Start dependencies:

   ```bash
   docker compose -f docker-compose.infra.yml up -d
   ```

4. Start the backend API:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. Start the background worker in another terminal:

   ```bash
   cd backend
   npm run worker:dev
   ```

6. Start the frontend in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Useful Commands

Seed data:

```bash
cd backend
npm run seed
```

Check backend env:

```bash
cd backend
npm run env:check
```

Inspect review enrichment queue:

```bash
npm run queue:status
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Database health check: `http://localhost:4000/database`
- RustFS S3 endpoint: `http://localhost:9000`
- RustFS console: `http://localhost:9001`

## Docker Networking

Use `localhost` when a process runs on your machine:

- `DATABASE_URL=postgresql://bookreview:bookreviewpassword@localhost:5432/bookreview`
- `REDIS_URL=redis://localhost:6379`
- `S3_ENDPOINT=http://localhost:9000`

Use Docker service names only when containers talk to other containers, such as `db`, `redis`, and `rustfs`.
