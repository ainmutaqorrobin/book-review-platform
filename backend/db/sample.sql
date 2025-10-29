-- Insert sample books
INSERT INTO
    books (title, author, description, cover_image_url)
VALUES
    (
        'Clean Code',
        'Robert C. Martin',
        'A Handbook of Agile Software Craftsmanship',
        'https://media.istockphoto.com/id/173015527/photo/a-single-red-book-on-a-white-surface.jpg?s=612x612&w=0&k=20&c=AeKmdZvg2_bRY2Yct7odWhZXav8CgDtLMc_5_pjSItY='
    ),
    (
        'The Pragmatic Programmer',
        'Andrew Hunt & David Thomas',
        'Your Journey to Mastery, 20th Anniversary Edition',
        'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books-illustration_23-2149341898.jpg?semt=ais_hybrid&w=740&q=80'
    ),
    (
        'Refactoring: Improving the Design of Existing Code',
        'Martin Fowler',
        'Second Edition of the classic refactoring book',
        'https://mphonline.com/cdn/shop/files/9781529936735.jpg?v=1757489065&width=480'
    );

-- Insert sample reviews
INSERT INTO
    reviews (
        book_id,
        reviewer_name,
        text,
        rating,
        summary,
        sentiment_score,
        tags
    )
VALUES
    (
        1,
        'Alice',
        'Clean Code is a must-read. It changed how I write code.',
        5,
        'Essential read for clean coding practices',
        0.95,
        '["clean code","software craftsmanship","best practices"]'
    ),
    (
        1,
        'Bob',
        'Good book but somewhat dated in parts.',
        4,
        'Valuable insights but some outdated tech',
        0.60,
        '["legacy code","refactoring","software design"]'
    ),
    (
        2,
        'Charlie',
        'Pragmatic Programmer opened my eyes to practical career advice.',
        5,
        'Practical and timeless advice',
        0.90,
        '["pragmatic programming","career advice","software development"]'
    ),
    (
        3,
        'Dana',
        'Refactoring helped me improve large codebases.',
        4,
        'Great for refactoring legacy systems',
        0.80,
        '["refactoring","legacy systems","code quality"]'
    );