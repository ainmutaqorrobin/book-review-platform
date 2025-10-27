# 📚 Book Review Platform (Take-Home Challenge)

A full-stack web application where users can browse books, write reviews, and get AI-enriched insights (summary, sentiment, and tags) using **Mastra AI**.  
This project is for demonstrating full-stack development skills, integration of AI tools, and clean architecture practices.

---

## 🧠 Overview

The **Book Review Platform** allows users to:
- View a list of available books.
- Read book details and user reviews.
- Submit new reviews that are automatically enriched using **Mastra AI** (summarization, sentiment analysis, and tag suggestions).
- Search for books and reviews.
- View AI-generated data such as review sentiment and tags directly from the UI.

---

## 🧩 Tech Stack

### **Backend**
- [Express.js](https://expressjs.com/) – REST API framework
- [TypeScript](https://www.typescriptlang.org/) – Type safety and maintainability
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) – SQLite database driver
- [dotenv](https://www.npmjs.com/package/dotenv) – Environment variable management
- [Jest](https://jestjs.io/) + [Supertest](https://www.npmjs.com/package/supertest) – Unit and integration testing
- [Docker](https://www.docker.com/) – Containerization
- [Mastra AI](https://mastra.ai/) – AI enrichment for reviews *(to be integrated)*

### **Frontend**
- [Next.js](https://nextjs.org/) + [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Hook Form](https://react-hook-form.com/) – Form handling
- [Axios / Fetch API] – API calls
- CSS Modules or Tailwind (TBD)

---

## 🚧 Project Status (Development Phases)

| Phase | Description | Status |
|-------|--------------|--------|
| 🏗️ **Setup & Environment** | Initialize backend & frontend folders, configure TypeScript, ESLint, Prettier, and Docker | ✅ Completed |
| ⚙️ **Backend Foundation** | Express app setup, routes, global error handler, and environment setup | ✅ Completed |
| 🗃️ **Database Integration** | Connect SQLite via better-sqlite3 or Prisma | ⏳ In Progress |
| 💬 **API Endpoints** | `/books`, `/books/:id`, `/books/:id/reviews`, `/search` | ⏳ Planned |
| 🤖 **Mastra AI Integration** | Integrate AI for summary, sentiment, and tags | ⏳ Planned |
| 💻 **Frontend UI** | Next.js pages, review form, book list, and detail view | ⏳ Planned |
| 🧪 **Testing** | Unit + integration tests (Jest, Supertest, RTL) | ⏳ Planned |
| 🐳 **Dockerization** | Dockerfile + docker-compose setup | ⏳ Planned |
| 🧾 **Documentation** | Final README + API docs | ⏳ Planned |
