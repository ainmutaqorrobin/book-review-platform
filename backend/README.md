# Book Review Platform — Backend API

This backend service provides RESTful endpoints for managing books and reviews, built with Express.js, TypeScript, and PostgreSQL.

View [API Documentation](https://documenter.getpostman.com/view/24966843/2sB3WnxMsD#b76501d0-09db-4b5c-bd75-fcd66890bcb2)

---

## ✅ Base Endpoints

| Method | Route       | Description                           |
| ------ | ----------- | ------------------------------------- |
| GET    | `/`         | Main root endpoint — check API status |
| GET    | `/database` | Check database connection status      |

---

## 📚 Books Routes

| Method | Route                     | Description                                                                                         |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| GET    | `/books`                  | Get list of all books                                                                               |
| GET    | `/books/{bookId}`         | Get detailed information of a book                                                                  |
| POST   | `/books`                  | Create a book with JSON or multipart form data; supports either `cover_image_url` or a `cover` file |
| PUT    | `/books/{bookId}`         | Update a book with JSON or multipart form data; supports either `cover_image_url` or a `cover` file |
| DELETE | `/books/{bookId}`         | Delete a book by its ID                                                                             |
| POST   | `/books/{bookId}/reviews` | Create a review for the selected book (body requires `reviewer_name`, `text`, `rating`)             |

---

## 📝 Reviews Routes

| Method | Route               | Description                                                       |
| ------ | ------------------- | ----------------------------------------------------------------- |
| GET    | `/reviews/{bookId}` | Get all reviews of a specific book                                |
| POST   | `/reviews/{bookId}` | Create a review (body requires `reviewer_name`, `text`, `rating`) |

---

## 🔍 Search Route

| Method | Route                       | Description                     |
| ------ | --------------------------- | ------------------------------- |
| GET    | `/search?query={yourQuery}` | Search for books **or** reviews |

---

## 🛠 Usage & Setup

1. Ensure you have PostgreSQL configured and the required environment variables set (e.g., `DATABASE_URL`, `PORT`, S3 storage configuration, etc.).
2. Run database migrations or apply your schema.
3. Seed dummy data when needed with `npm run seed`. This runs `db/sample.sql` against `DATABASE_URL` and creates or updates an admin user.
4. Start the server (e.g., `npm run dev` for development or `npm run start` for production build).
5. Use the endpoints above to interact with the API.

For local development, the default seeded admin credentials are:

- Username: `admin`
- Password: `admin12345`

These can be overridden with `ADMIN_SEED_USERNAME`, `ADMIN_SEED_NAME`, and `ADMIN_SEED_PASSWORD`.

---

## 🚀 Notes & Highlights

- Input validation is performed for request bodies and parameters to ensure data integrity.
- Error handling middleware provides consistent error responses.
- A rate limiter is applied across all endpoints to prevent abuse.
- When reviews are submitted, AI enrichment (summary, sentiment, tags) is integrated via Mastra AI.
- Proper HTTP status codes are returned for success, validation errors, and server errors.
