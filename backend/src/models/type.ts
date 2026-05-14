export enum Role {
  GUEST = "guest",
  USER = "user",
  ADMIN = "admin",
}

export type PersistedRole = Role.USER | Role.ADMIN;

export interface Book {
  title: string;
  author: string;
  description?: string | null;
  cover_image_url?: string | null;
  owner_user_id?: number | null;
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

export interface User {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  role: PersistedRole;
  created_at: Date;
}
