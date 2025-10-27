# 📚 Book Review Platform (Take-Home Challenge)

A full-stack web application where users can browse books, write reviews, and get AI-enriched insights (summary, sentiment, and tags) using **Mastra AI**.  
This project demonstrates full-stack development, REST API design, clean architecture, and upcoming AI integration.

---

## 🧠 Overview

The **Book Review Platform** allows users to:

- View and manage a list of books.
- Read detailed book information and user reviews.
- Submit new reviews (with rating, text, and reviewer name).
- Retrieve reviews associated with a specific book.
- Manage books with full CRUD functionality (Create, Read, Update, Delete).
- (Coming soon) Automatically enrich reviews using **Mastra AI** for:
  - Summarization
  - Sentiment analysis
  - Tag generation

The backend is built using **Express + PostgreSQL + TypeScript**, following modular, maintainable design practices.  
The frontend (Next.js + React) will consume these APIs and visualize both user and AI-generated data.

---

## 🧩 Tech Stack

### **Backend**

- [Express.js](https://expressjs.com/) – Fast and minimal web framework for Node.js
- [TypeScript](https://www.typescriptlang.org/) – Strongly typed JavaScript for scalable development
- [PostgreSQL](https://www.postgresql.org/) – Relational database for structured data
- [pg](https://www.npmjs.com/package/pg) – PostgreSQL client for Node.js
- [express-validator](https://express-validator.github.io/docs/) – Request validation and sanitization
- [dotenv](https://www.npmjs.com/package/dotenv) – Environment configuration
- [Jest](https://jestjs.io/) + [Supertest](https://www.npmjs.com/package/supertest) – Unit and integration testing
- [Docker](https://www.docker.com/) – Containerization for consistent deployment
- [Mastra AI](https://mastra.ai/) – _(Planned)_ For AI-based review enrichment (summary, sentiment, tags)

### **Frontend**

- [Next.js](https://nextjs.org/) + [React](https://react.dev/) – Modern React framework for building the client-side app
- [TypeScript](https://www.typescriptlang.org/) – Type-safe React components
- [React Hook Form](https://react-hook-form.com/) – Simplified form handling
- [Axios](https://axios-http.com/) / Fetch API – For backend communication
- [Tailwind CSS](https://tailwindcss.com/) _(Planned)_ – Utility-first styling

---

## 🚧 Project Status (Development Phases)

| Phase                        | Description                                                                               | Status       |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------ |
| 🏗️ **Setup & Environment**   | Initialize backend & frontend folders, configure TypeScript, ESLint, Prettier, and Docker | ✅ Completed |
| ⚙️ **Backend Foundation**    | Express app setup, routes, global error handler, and environment setup                    | ✅ Completed |
| 🗃️ **Database Integration**  | PostgreSQL setup using pg client, schema design for books & reviews                       | ✅ Completed |
| 💬 **API Endpoints**         | `/books`, `/reviews` (CRUD + nested routes)                                               | ✅ Completed |
| 🤖 **Mastra AI Integration** | AI-based enrichment for reviews (summary, sentiment, tags)                                | ⏳ Planned   |
| 💻 **Frontend UI**           | Next.js pages, book list, detail view, and review form                                    | ⏳ Planned   |
| 🧪 **Testing**               | Unit + integration tests (Jest, Supertest, RTL)                                           | ⏳ Planned   |
| 🐳 **Dockerization**         | Dockerfile + docker-compose setup for backend and database                                | ⏳ Planned   |
| 🧾 **Documentation**         | Final README, API docs, and setup instructions                                            | ⏳ Planned   |
