# 📚 Book Review Platform (Take-Home Challenge)

A **full-stack web application** where users can browse books, write reviews, and get **AI-enriched insights** (summary, sentiment, and tags) powered by **Mastra AI**.  
This project demonstrates **Express + PostgreSQL + Next.js + TypeScript** integration, clean architecture, and modern frontend practices.

---

## 🧠 Overview

The **Book Review Platform** enables users to:

- View list of books.
- Create and delete a book.
- Read detailed book information and user reviews.
- Submit reviews with rating, text, and reviewer name.
- Enrich reviews automatically using **Mastra AI**.
- Enjoy a smooth, modern user experience.

---

## 🧩 Tech Stack

### **Backend**

- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [pg](https://www.npmjs.com/package/pg)
- [express-validator](https://express-validator.github.io/docs/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [Mastra AI](https://mastra.ai/)
- [Docker](https://www.docker.com/)

### **Frontend**

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Sonner](https://sonner.emilkowal.ski/) (for toast notifications)
- [Lucide Icons](https://lucide.dev/icons/)

---

## ⚙️ Backend Features

| Feature                       | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| 🗃️ **PostgreSQL Integration** | Fully connected relational database using `pg`               |
| ✅ **Input Validation**       | Implemented via `express-validator`                          |
| 🚨 **Error Handling**         | Centralized error handler using custom `AppError`            |
| 🧠 **Mastra AI Integration**  | Automatic summary, sentiment, and tag generation for reviews |
| 🚦 **Rate Limiter**           | Prevents excessive API calls per IP address                  |

---

## 💻 Frontend Features

| Feature                       | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| 🏠 **Landing Page**           | Main entry point showcasing platform features                |
| 📚 **Books List Page**        | Displays all available books with search and refresh options |
| 📖 **Book Detail Page**       | Shows details and reviews for each book                      |
| 🗎 **Create A Book Page**      | Fill the details and submit form to create new book          |
| 🔍 **Search Bar (Debounced)** | Smart searching with delay using debounced input             |
| ⏳ **Skeletons & Loaders**    | Smooth loading states for better UX                          |
| 🎨 **Pretty Layout/UI**       | Modern look using Tailwind + Shadcn                          |
| 📝 **Form Validation**        | Built with React Hook Form                                   |
| 🔔 **Toast Notifications**    | User feedback using Sonner                                   |

---

## 🚀 How to Run

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/book-review-platform.git
   cd book-review-platform
   ```

2. **Copy the environment file:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and fill in your own values.

3. **Build and run using Docker:**

   ```bash
   docker compose up --build
   ```

4. **Access the app:**
   - Frontend → [http://localhost:3000](http://localhost:3000)
   - Backend → [http://localhost:4000](http://localhost:4000)

---

## 📦 Folder Structure

```
book-review-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validation/
│   │   ├── mastra/
│   │   └── app.ts / server.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml

```

---

## 🧾 Development Progress

| Phase                        | Description                                  | Status           |
| ---------------------------- | -------------------------------------------- | ---------------- |
| 🏗️ **Setup & Environment**   | Configured backend, frontend, Docker         | ✅ Completed     |
| ⚙️ **Backend Foundation**    | Express setup, validation, error handler     | ✅ Completed     |
| 🗃️ **Database Integration**  | PostgreSQL setup & connection                | ✅ Completed     |
| 💬 **API Endpoints**         | CRUD for `/books`, create and get `/reviews` | ✅ Completed     |
| 🤖 **Mastra AI Integration** | Review enrichment (summary, sentiment, tags) | ✅ Completed     |
| 💻 **Frontend UI**           | Next.js app with pages, forms, and UI        | ✅ Completed     |
| 🧪 **Testing**               | Unit & integration (Jest, Supertest)         | ❌ Not Completed |
| 🐳 **Dockerization**         | Docker & docker-compose setup                | ✅ Completed     |
| 🧾 **Documentation**         | Project guide & README                       | ✅ Completed     |
