# Book Review Platform

Full-stack book review app for browsing books, writing reviews, and enriching submitted reviews with AI-generated summaries, sentiment, and tags.

## Tech Stack

- Backend: Express, TypeScript, PostgreSQL, Mastra AI
- Background jobs: Redis, BullMQ, dedicated backend worker
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, React Hook Form
- Storage: RustFS / S3-compatible object storage
- Deployment: Docker Compose, Docker Hub, GitHub Actions, VPS + Nginx

## Start Here

- Maintainers editing code day to day: [docs/maintainer-development.md](docs/maintainer-development.md)
- Developers who want to run all services locally with Docker: [docs/local-docker-setup.md](docs/local-docker-setup.md)

## Production

Production uses `docker-compose.production.yml` with prebuilt Docker Hub images. The VPS does not need a full repository checkout; CI uploads only the production compose file, then pulls and restarts images with `.env.production` kept on the server.

GitHub Actions builds and pushes:

- `${DOCKER_USERNAME}/book-review-backend`
- `${DOCKER_USERNAME}/book-review-frontend`

The production stack runs PostgreSQL, Redis, backend API, backend worker, and frontend. Nginx terminates TLS and proxies `/` to frontend and `/api/` to backend.

## Environment Files

- `.env.example`: local development defaults
- `.env.production.example`: production template for the VPS `.env.production`

Keep real secrets out of git.
