-- users table
CREATE TABLE IF NOT EXISTS
    users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user', -- e.g. 'user', 'admin'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- books table
CREATE TABLE
    IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        owner_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
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
        ai_enrichment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        ai_enrichment_error TEXT,
        ai_enrichment_started_at TIMESTAMP,
        ai_enrichment_completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT reviews_ai_enrichment_status_check CHECK (
            ai_enrichment_status IN ('pending', 'processing', 'completed', 'failed')
        )
    );

-- indexes
CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_owner_user_id ON books (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_books_created_at_id ON books (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews (book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id_created_at_id ON reviews (book_id, created_at DESC, id DESC);
