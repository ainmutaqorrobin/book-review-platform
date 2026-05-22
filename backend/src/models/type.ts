export enum Role {
  GUEST = "guest",
  USER = "user",
  ADMIN = "admin",
}

export const REVIEW_ENRICHMENT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export type ReviewEnrichmentStatus =
  (typeof REVIEW_ENRICHMENT_STATUSES)[number];

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
  summary?: string | null;
  sentiment_score?: number | null;
  tags?: string[] | null;
  ai_enrichment_status?: ReviewEnrichmentStatus;
  ai_enrichment_error?: string | null;
  ai_enrichment_started_at?: Date | string | null;
  ai_enrichment_completed_at?: Date | string | null;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  role: PersistedRole;
  created_at: Date;
}
