export interface Book {
  title: string;
  author: string;
  description?: string;
  cover_image_url?: string;
}

export interface Review {
  book_id: number;
  reviewer_name: string;
  text: string;
  rating: number;
  summary?: string;
  sentiment_score?: number;
  tags?: string[];
}
