# Book Review Platform

Book Review Platform is a full-stack app for browsing books, writing reviews, and enriching reviews with AI-generated summary, sentiment, and tags. The stack uses Express, PostgreSQL, Next.js, TypeScript, and Docker.

## Stack

- Backend: Express, TypeScript, PostgreSQL, Mastra AI
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, React Hook Form
- Deployment: Docker Compose, Docker Hub, GitHub Actions, VPS + Nginx

## Local Development

There are two local workflows. Use the manual workflow when you want the fastest feedback loop while editing code. Use the full Docker workflow when you want a new developer to clone the repo and start everything with one command.

### Recommended Manual Dev

This runs only shared dependencies in Docker. Backend, worker, and frontend run directly on your machine, so file watching behaves like normal local development.

1. Copy the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required secrets in `.env`, especially:
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`

3. Start local dependencies:

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

7. Open the app:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`
   - Database health check: `http://localhost:4000/database`
   - RustFS S3 endpoint: `http://localhost:9000`
   - RustFS console: `http://localhost:9001`

8. Seed dummy data when you want:

   ```bash
   cd backend
   npm run seed
   ```

   This also creates or updates a seeded admin account. With the default local
   `.env.example` values, the credentials are:
   - Username: `admin`
   - Password: `admin12345`

9. Check backend environment status when needed:

   ```bash
   cd backend
   npm run env:check
   ```

10. Inspect the review enrichment queue when needed:

   ```bash
   npm run queue:status
   ```

### One-Command Docker Dev

This starts the full app stack in Docker. It is the easiest path for a new developer after cloning the repo.

1. Copy the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required secrets in `.env`, especially:
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`

3. Make sure Docker Desktop or your local Docker daemon is running.

4. Start the full local development stack:

   ```bash
   docker compose up --build
   ```

5. Open the app:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`
   - Database health check: `http://localhost:4000/database`
   - RustFS S3 endpoint: `http://localhost:9000`
   - RustFS console: `http://localhost:9001`

6. Seed dummy data when you want:

   ```bash
   docker compose exec backend npm run seed
   ```

   This also creates or updates a seeded admin account. With the default local
   `.env.example` values, the credentials are:
   - Username: `admin`
   - Password: `admin12345`

7. Check backend environment status when needed:

   ```bash
   docker compose exec backend npm run env:check
   ```

The full local compose file runs:

- `frontend` from `./frontend` in development mode with hot reload
- `backend` from `./backend` in development mode with hot reload
- `backend-worker` from `./backend` to process review enrichment jobs
- `db` from `postgres:16-alpine`
- `redis` from `redis:7-alpine`
- `rustfs` from `rustfs/rustfs:latest` for local object storage
- `rustfs-bucket-init` to create the `book-review` bucket automatically

The database schema is initialized from `backend/db/schema.sql` the first time the Postgres volume is created.
Source code is bind-mounted into the frontend and backend containers, while `node_modules` stay inside Docker volumes so you can edit locally without reinstalling on every container start.
The backend dev container now re-runs `npm ci` automatically when `backend/package-lock.json` changes, which prevents stale Docker `node_modules` volumes from missing newly added dependencies.
The Docker backend and worker use internal service hostnames like `db`, `redis`, and `rustfs`, so host-machine values from `.env.example` do not break container networking.

### Docker Networking Rule Of Thumb

Use `localhost` when the process is running directly on your machine. That is why manual backend development uses values like:

- `DATABASE_URL=postgresql://bookreview:bookreviewpassword@localhost:5432/bookreview`
- `REDIS_URL=redis://localhost:6379`
- `S3_ENDPOINT=http://localhost:9000`

Use Docker service names when one container talks to another container on the same Compose network. That is why the full Docker stack overrides those values internally with:

- `db:5432`
- `redis:6379`
- `http://rustfs:9000`

## Production Deployment Model

Production uses a separate compose file:

- `docker-compose.production.yml` pulls prebuilt Docker Hub images for `frontend` and `backend`
- A `db` container runs on the VPS with a named volume
- A `redis` container runs on the VPS with a named volume for review enrichment jobs
- A `backend-worker` container runs the same backend image with `npm run worker`
- Nginx on the VPS terminates TLS and proxies:
  - `/` to `127.0.0.1:3000`
  - `/api/` to `127.0.0.1:4000/`

The frontend production build is compiled with `NEXT_PUBLIC_API_URL=/api`, so the browser talks to the API through the same public domain:

- `https://book-review.mutaqorrobin.online`

## CI/CD

GitHub Actions in `.github/workflows/deploy.yml` runs on pushes to `main` and on manual dispatch.

It does the following:

1. Installs dependencies and builds the backend.
2. Installs dependencies and builds the frontend with `NEXT_PUBLIC_API_URL=/api`.
3. Builds and pushes these images to Docker Hub:
   - `${DOCKER_USERNAME}/book-review-backend`
   - `${DOCKER_USERNAME}/book-review-frontend`
4. Uploads only `docker-compose.production.yml` to the VPS app directory.
5. SSHes into the VPS and runs:

   ```bash
   docker compose --env-file .env.production -f docker-compose.production.yml pull
   docker compose --env-file .env.production -f docker-compose.production.yml up -d --remove-orphans
   docker image prune -f
   ```

The VPS does not need a full repository checkout. It only needs Docker, the uploaded `docker-compose.production.yml`, and a server-local `.env.production` file containing production secrets.

## Environment Files

- `.env.example`: manual local development and browser settings
- `.env.production.example`: production values for the VPS copy at `.env.production`

Storage-related env vars now include:

- `S3_ENDPOINT`
- `S3_PUBLIC_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`
- `S3_REGION`
- `S3_FORCE_PATH_STYLE`

Admin seed configuration is also environment-driven:

- `ADMIN_SEED_USERNAME`
- `ADMIN_SEED_NAME`
- `ADMIN_SEED_PASSWORD`

Keep real secrets out of git. `.env.production` should exist only on the VPS.

## Notes

- Production Postgres is a fresh database by default.
- Existing API routes stay unchanged; Nginx strips the `/api` prefix before the request reaches Express.
- `TODO-VPS.md` lists the manual VPS steps that still need to be completed on your server.
