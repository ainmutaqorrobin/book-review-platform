# Book Review Platform

Book Review Platform is a full-stack app for browsing books, writing reviews, and enriching reviews with AI-generated summary, sentiment, and tags. The stack uses Express, PostgreSQL, Next.js, TypeScript, and Docker.

## Stack

- Backend: Express, TypeScript, PostgreSQL, Mastra AI
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, React Hook Form
- Deployment: Docker Compose, Docker Hub, GitHub Actions, VPS + Nginx

## Local Development With Docker

1. Copy the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required secrets in `.env`, especially:
   - `OPENAI_API_KEY`
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

6. Seed dummy data when you want:

   ```bash
   docker compose exec backend npm run seed
   ```

The local compose file now runs:
- `frontend` from `./frontend` in development mode with hot reload
- `backend` from `./backend` in development mode with hot reload
- `db` from `postgres:16-alpine`

The database schema is initialized from `backend/db/schema.sql` the first time the Postgres volume is created.
Source code is bind-mounted into the frontend and backend containers, while `node_modules` stay inside Docker volumes so you can edit locally without reinstalling on every container start.

## Production Deployment Model

Production uses a separate compose file:

- `docker-compose.production.yml` pulls prebuilt Docker Hub images for `frontend` and `backend`
- A `db` container runs on the VPS with a named volume
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
4. SSHes into the VPS and runs:

   ```bash
   git pull --ff-only origin main
   docker compose --env-file .env.production -f docker-compose.production.yml pull
   docker compose --env-file .env.production -f docker-compose.production.yml up -d --remove-orphans
   docker image prune -f
   ```

## Environment Files

- `.env.example`: local Docker and local browser settings
- `.env.production.example`: production values for the VPS copy at `.env.production`

Keep real secrets out of git. `.env.production` should exist only on the VPS.

## Notes

- Production Postgres is a fresh database by default.
- Existing API routes stay unchanged; Nginx strips the `/api` prefix before the request reaches Express.
- `TODO-VPS.md` lists the manual VPS steps that still need to be completed on your server.
