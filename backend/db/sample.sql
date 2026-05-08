BEGIN;

-- Reset app content tables for repeatable local reseeding.
-- Leave users intact so the seeded admin account and any auth setup survive.
TRUNCATE TABLE reviews, books RESTART IDENTITY CASCADE;

WITH inserted_books AS (
    INSERT INTO books (title, author, description, cover_image_url)
    VALUES
        (
            'Clean Code',
            'Robert C. Martin',
            'A practical guide to writing readable, maintainable software.',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Pragmatic Programmer',
            'Andrew Hunt & David Thomas',
            'A classic book on practical habits, mindset, and long-term craft.',
            'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Refactoring',
            'Martin Fowler',
            'Patterns and techniques for improving existing code safely.',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Atomic Habits',
            'James Clear',
            'A clear framework for building good habits and breaking bad ones.',
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Deep Work',
            'Cal Newport',
            'Strategies for doing focused work in a distracted world.',
            'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Thinking, Fast and Slow',
            'Daniel Kahneman',
            'An exploration of judgment, bias, and human decision-making.',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Design of Everyday Things',
            'Don Norman',
            'A foundational book on usability, feedback, and product design.',
            'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Eloquent JavaScript',
            'Marijn Haverbeke',
            'A modern introduction to JavaScript and programming fundamentals.',
            'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'You Don''t Know JS Yet',
            'Kyle Simpson',
            'A deep dive into the language mechanics behind JavaScript.',
            'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Designing Data-Intensive Applications',
            'Martin Kleppmann',
            'A thorough guide to data systems, tradeoffs, and distributed architecture.',
            'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Psychology of Money',
            'Morgan Housel',
            'Short stories about behavior, risk, wealth, and long-term thinking.',
            'https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Hooked',
            'Nir Eyal',
            'A product framework for building habit-forming digital experiences.',
            'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Sprint',
            'Jake Knapp, John Zeratsky & Braden Kowitz',
            'A five-day process for solving problems and testing ideas quickly.',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Lean Startup',
            'Eric Ries',
            'A playbook for iterative product development and validated learning.',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Zero to One',
            'Peter Thiel',
            'A sharp, opinionated perspective on startups and creating new markets.',
            'https://images.unsplash.com/photo-1496104679561-38b2f5ca8c73?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Almanack of Naval Ravikant',
            'Eric Jorgenson',
            'Collected wisdom on leverage, decision-making, wealth, and happiness.',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Mom Test',
            'Rob Fitzpatrick',
            'A short guide to asking better customer research questions.',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Make Time',
            'Jake Knapp & John Zeratsky',
            'Practical tactics for controlling attention and designing better days.',
            'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'The Phoenix Project',
            'Gene Kim, Kevin Behr & George Spafford',
            'A novel that explains DevOps, flow, and operational bottlenecks.',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
        ),
        (
            'Inspired',
            'Marty Cagan',
            'A guide to building product teams that create products customers love.',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80'
        )
    RETURNING id, title
)
INSERT INTO reviews (
    book_id,
    reviewer_name,
    text,
    rating,
    summary,
    sentiment_score,
    tags
)
SELECT
    inserted_books.id,
    review_data.reviewer_name,
    review_data.text,
    review_data.rating,
    review_data.summary,
    review_data.sentiment_score,
    review_data.tags
FROM inserted_books
JOIN (
    VALUES
        (
            'Clean Code',
            'Alice',
            'This book still pushes me to simplify code and name things better every time I revisit it.',
            5,
            'A strong reminder to write code that other people can live with.',
            0.94,
            '["clean code", "software craftsmanship", "best practices"]'::jsonb
        ),
        (
            'Clean Code',
            'Bob',
            'Some examples feel dated, but the discipline around readability is still useful.',
            4,
            'Valuable principles, even if some specifics show their age.',
            0.66,
            '["readability", "legacy code", "engineering habits"]'::jsonb
        ),
        (
            'The Pragmatic Programmer',
            'Charlie',
            'One of the rare technical books that changes how you think about your career and daily work.',
            5,
            'Practical advice with unusually long shelf life.',
            0.92,
            '["career growth", "pragmatism", "software development"]'::jsonb
        ),
        (
            'Refactoring',
            'Dana',
            'The catalog of refactorings is great, but the real value is learning to improve systems incrementally.',
            5,
            'A high-signal guide for safer code improvement.',
            0.88,
            '["refactoring", "code quality", "maintainability"]'::jsonb
        ),
        (
            'Atomic Habits',
            'Evelyn',
            'Simple ideas, but they compound when you actually apply them for a few weeks.',
            4,
            'Accessible habit advice with clear systems thinking.',
            0.82,
            '["habits", "self-improvement", "systems"]'::jsonb
        ),
        (
            'Deep Work',
            'Farid',
            'A useful push to protect focused time, even if not every rule fits modern team work.',
            4,
            'Strong case for concentration in a noisy environment.',
            0.73,
            '["focus", "productivity", "attention"]'::jsonb
        ),
        (
            'The Design of Everyday Things',
            'Grace',
            'This made me notice confusing affordances everywhere, from doors to dashboards.',
            5,
            'A foundational usability book that sharpens product instincts.',
            0.91,
            '["ux", "design", "usability"]'::jsonb
        ),
        (
            'Eloquent JavaScript',
            'Hana',
            'Dense in parts, but it rewards careful reading and hands-on practice.',
            4,
            'A solid JavaScript book for readers willing to work through it.',
            0.69,
            '["javascript", "programming fundamentals", "practice"]'::jsonb
        ),
        (
            'Designing Data-Intensive Applications',
            'Irfan',
            'Heavy, but excellent. It helped me reason more clearly about consistency, storage, and scale.',
            5,
            'A demanding but extremely worthwhile systems book.',
            0.93,
            '["distributed systems", "databases", "architecture"]'::jsonb
        ),
        (
            'The Psychology of Money',
            'Jules',
            'Short chapters, sharp stories, and a good reminder that behavior matters more than spreadsheets.',
            5,
            'Memorable lessons about wealth and decision-making.',
            0.90,
            '["money", "behavior", "decision making"]'::jsonb
        ),
        (
            'The Phoenix Project',
            'Kai',
            'A little theatrical, but it makes operational bottlenecks and team dependencies easy to understand.',
            4,
            'A readable DevOps primer wrapped in a workplace story.',
            0.76,
            '["devops", "operations", "team workflow"]'::jsonb
        ),
        (
            'Inspired',
            'Lina',
            'Useful for understanding what strong product teams do differently, especially around discovery.',
            5,
            'Great product management perspective with practical framing.',
            0.89,
            '["product management", "discovery", "teamwork"]'::jsonb
        )
) AS review_data (
    book_title,
    reviewer_name,
    text,
    rating,
    summary,
    sentiment_score,
    tags
)
    ON inserted_books.title = review_data.book_title;

COMMIT;
