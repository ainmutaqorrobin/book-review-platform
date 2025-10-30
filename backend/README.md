# Book Review Platform — Backend API

This backend service provides RESTful endpoints for managing books and reviews, built with Express.js, TypeScript, and PostgreSQL.

---

## ✅ Base Endpoints

| Method | Route       | Description                           |
|--------|-------------|---------------------------------------|
| GET    | `/`         | Check API status / root health        |
| GET    | `/database` | Verify database connectivity & status |

---

## 📚 Books Routes

| Method | Route                          | Description                                |
|--------|--------------------------------|--------------------------------------------|
| GET    | `/books`                       | Fetch list of all books                    |
| GET    | `/books/{bookId}`              | Get detailed information for a single book |
| POST   | `/books`                       | Create a new book                          |
| PUT    | `/books/{bookId}`              | Update an existing book                    |
| DELETE | `/books/{bookId}`              | Delete a book by its ID                    |
| POST   | `/books/{bookId}/reviews`      | Create a review for the selected book      |

---

## 📝 Reviews Routes

| Method | Route                        | Description                             |
|--------|------------------------------|-----------------------------------------|
| GET    | `/reviews/{bookId}`          | Retrieve all reviews for a given book   |
| POST   | `/reviews/{bookId}`          | Create a new review for a given book    |

---

## 🔍 Search Route

| Method | Route                      | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/search?query={yourQuery}`| Search across books or reviews       |

---

## 🛠 Usage & Setup

1. Ensure you have PostgreSQL configured and the required environment variables set (e.g., `DATABASE_URL`, `PORT`, etc.).  
2. Run database migrations or apply your schema.  
3. Start the server (e.g., `npm run dev` for development or `npm run start` for production build).  
4. Use the endpoints above to interact with the API.

---

## 🚀 Notes & Highlights

- Input validation is performed for request bodies and parameters to ensure data integrity.  
- Error handling middleware provides consistent error responses.  
- A rate limiter is applied across all endpoints to prevent abuse.  
- When reviews are submitted, AI enrichment (summary, sentiment, tags) is integrated via Mastra AI.  
- Proper HTTP status codes are returned for success, validation errors, and server errors.

---

Feel free to clone this service, extend the routes, and adapt it for your specific use case or deployment environment.
