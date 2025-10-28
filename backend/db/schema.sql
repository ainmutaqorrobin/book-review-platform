-- books table
CREATE TABLE
    IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- reviews table
CREATE TABLE
    IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books (id) ON DELETE CASCADE,
        reviewer_name VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        summary TEXT,
        sentiment_score REAL,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- indexes
CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);

CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews (book_id);