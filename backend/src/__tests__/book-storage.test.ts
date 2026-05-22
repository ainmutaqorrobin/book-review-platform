import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "3600000";
process.env.NODE_ENV = "test";
process.env.REDIS_URL = "redis://127.0.0.1:6379";
process.env.S3_PUBLIC_ENDPOINT = "https://s3.example.test";
process.env.S3_BUCKET = "book-review";

const {
  enrichReviewText,
  mockPool,
  mockQuery,
  uploadBookCover,
  deleteStoredCoverObject,
} = vi.hoisted(() => {
  const mockQuery = vi.fn<(...args: any[]) => Promise<any>>();
  const enrichReviewText = vi.fn<(text: string) => Promise<any>>();
  const uploadBookCover =
    vi.fn<
      (params: {
        bookId: number;
        buffer: Buffer;
        mimeType: string;
      }) => Promise<string>
    >();
  const deleteStoredCoverObject =
    vi.fn<(key?: string | null) => Promise<void>>();

  return {
    mockQuery,
    mockPool: {
      query: mockQuery,
      on: vi.fn(),
    },
    enrichReviewText,
    uploadBookCover,
    deleteStoredCoverObject,
  };
});

vi.mock("../config/db", () => ({
  default: mockPool,
}));

vi.mock("../mastra/agents/analyze-agent", () => ({
  analyzeAgents: {},
  enrichReviewText,
}));

vi.mock("../storage/bookCovers", async () => {
  const actual = await vi.importActual<typeof import("../storage/bookCovers")>(
    "../storage/bookCovers",
  );

  return {
    ...actual,
    uploadBookCover,
    deleteStoredCoverObject,
  };
});

vi.mock("@mastra/core", () => ({
  Mastra: class {
    constructor(_: unknown) {}
  },
}));

import { app } from "../app";

function createAuthCookie(userId: number, role: "user" | "admin" = "user") {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!);
  return `jwt=${token}`;
}

beforeEach(() => {
  mockQuery.mockReset();
  enrichReviewText.mockReset();
  uploadBookCover.mockReset();
  deleteStoredCoverObject.mockReset();
});

describe("Book cover storage", () => {
  it("creates a book with an external cover URL", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 21,
          title: "External Cover",
          author: "Reader",
          description: "Stored from URL",
          cover_image_url: "https://images.example.test/cover.jpg",
          owner_user_id: 9,
        },
      ],
    });

    const response = await request(app)
      .post("/books")
      .set("Cookie", createAuthCookie(9))
      .send({
        title: "External Cover",
        author: "Reader",
        description: "Stored from URL",
        cover_image_url: "https://images.example.test/cover.jpg",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.cover_image_url).toBe(
      "https://images.example.test/cover.jpg",
    );
    expect(response.body.data.cover_image_storage_value).toBe(
      "https://images.example.test/cover.jpg",
    );
    expect(response.body.data.cover_image_source).toBe("external");
    expect(mockQuery.mock.calls[0]?.[1]).toEqual([
      "External Cover",
      "Reader",
      "Stored from URL",
      "https://images.example.test/cover.jpg",
      9,
    ]);
    expect(uploadBookCover).not.toHaveBeenCalled();
  });

  it("creates a book with an uploaded cover and returns a public URL", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 30,
            title: "Uploaded Cover",
            author: "Reader",
            description: "Stored in RustFS",
            cover_image_url: null,
            owner_user_id: 4,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 30,
            title: "Uploaded Cover",
            author: "Reader",
            description: "Stored in RustFS",
            cover_image_url: "covers/30/cover.png",
            owner_user_id: 4,
          },
        ],
      });
    uploadBookCover.mockResolvedValueOnce("covers/30/cover.png");

    const response = await request(app)
      .post("/books")
      .set("Cookie", createAuthCookie(4))
      .field("title", "Uploaded Cover")
      .field("author", "Reader")
      .field("description", "Stored in RustFS")
      .attach("cover", Buffer.from("png-file"), {
        filename: "cover.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(201);
    expect(uploadBookCover).toHaveBeenCalledWith({
      bookId: 30,
      buffer: expect.any(Buffer),
      mimeType: "image/png",
    });
    expect(mockQuery.mock.calls[0]?.[1]).toEqual([
      "Uploaded Cover",
      "Reader",
      "Stored in RustFS",
      null,
      4,
    ]);
    expect(response.body.data.cover_image_storage_value).toBe(
      "covers/30/cover.png",
    );
    expect(response.body.data.cover_image_url).toBe(
      "https://s3.example.test/book-review/covers/30/cover.png",
    );
    expect(response.body.data.cover_image_source).toBe("upload");
  });

  it("rejects requests that send both a cover file and a cover URL", async () => {
    const response = await request(app)
      .post("/books")
      .set("Cookie", createAuthCookie(7))
      .field("title", "Conflicting Cover")
      .field("author", "Reader")
      .field("cover_image_url", "https://images.example.test/cover.jpg")
      .attach("cover", Buffer.from("png-file"), {
        filename: "cover.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/validation failed/i);
    expect(uploadBookCover).not.toHaveBeenCalled();
  });

  it("rejects invalid cover mime types", async () => {
    const response = await request(app)
      .post("/books")
      .set("Cookie", createAuthCookie(7))
      .field("title", "Bad Cover")
      .field("author", "Reader")
      .attach("cover", Buffer.from("<svg></svg>"), {
        filename: "cover.svg",
        contentType: "image/svg+xml",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/jpeg, png, or webp/i);
  });

  it("rejects files larger than 5 MB", async () => {
    const response = await request(app)
      .post("/books")
      .set("Cookie", createAuthCookie(7))
      .field("title", "Large Cover")
      .field("author", "Reader")
      .attach("cover", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "cover.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(413);
    expect(response.body.message).toMatch(/5 mb or smaller/i);
  });

  it("replaces an uploaded cover with a new upload and deletes the old object when the key changes", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 40,
            title: "Stored Book",
            author: "Owner",
            cover_image_url: "covers/40/cover.jpg",
            owner_user_id: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 40,
            title: "Stored Book",
            author: "Owner",
            cover_image_url: "covers/40/cover.jpg",
            owner_user_id: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 40,
            title: "Stored Book",
            author: "Owner",
            description: "Updated",
            cover_image_url: "covers/40/cover.png",
            owner_user_id: 12,
          },
        ],
      });
    uploadBookCover.mockResolvedValueOnce("covers/40/cover.png");

    const response = await request(app)
      .put("/books/40")
      .set("Cookie", createAuthCookie(12))
      .field("title", "Stored Book")
      .field("author", "Owner")
      .field("description", "Updated")
      .attach("cover", Buffer.from("new-png"), {
        filename: "cover.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(200);
    expect(deleteStoredCoverObject).toHaveBeenCalledWith("covers/40/cover.jpg");
    expect(response.body.data.cover_image_storage_value).toBe(
      "covers/40/cover.png",
    );
    expect(response.body.data.cover_image_source).toBe("upload");
  });

  it("switches from an uploaded cover to an external URL and deletes the old object", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 41,
            title: "Stored Book",
            author: "Owner",
            cover_image_url: "covers/41/cover.jpg",
            owner_user_id: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 41,
            title: "Stored Book",
            author: "Owner",
            cover_image_url: "covers/41/cover.jpg",
            owner_user_id: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 41,
            title: "Stored Book",
            author: "Owner",
            description: "Updated",
            cover_image_url: "https://images.example.test/replaced.jpg",
            owner_user_id: 12,
          },
        ],
      });

    const response = await request(app)
      .put("/books/41")
      .set("Cookie", createAuthCookie(12))
      .send({
        title: "Stored Book",
        author: "Owner",
        description: "Updated",
        cover_image_url: "https://images.example.test/replaced.jpg",
      });

    expect(response.status).toBe(200);
    expect(deleteStoredCoverObject).toHaveBeenCalledWith("covers/41/cover.jpg");
    expect(response.body.data.cover_image_url).toBe(
      "https://images.example.test/replaced.jpg",
    );
    expect(response.body.data.cover_image_source).toBe("external");
  });

  it("clears an uploaded cover and deletes the old object", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 42,
            title: "Stored Book",
            author: "Owner",
            cover_image_url: "covers/42/cover.jpg",
            owner_user_id: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 42,
            title: "Stored Book",
            author: "Owner",
            cover_image_url: "covers/42/cover.jpg",
            owner_user_id: 12,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 42,
            title: "Stored Book",
            author: "Owner",
            description: "Updated",
            cover_image_url: null,
            owner_user_id: 12,
          },
        ],
      });

    const response = await request(app)
      .put("/books/42")
      .set("Cookie", createAuthCookie(12))
      .send({
        title: "Stored Book",
        author: "Owner",
        description: "Updated",
        cover_image_url: "",
      });

    expect(response.status).toBe(200);
    expect(deleteStoredCoverObject).toHaveBeenCalledWith("covers/42/cover.jpg");
    expect(response.body.data.cover_image_url).toBeNull();
    expect(response.body.data.cover_image_source).toBeNull();
  });

  it("serializes existing external cover URLs unchanged when reading a book", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 50,
          title: "Existing External Cover",
          author: "Reader",
          description: "Read path",
          cover_image_url: "https://images.example.test/original.jpg",
          owner_user_id: 8,
        },
      ],
    });

    const response = await request(app).get("/books/50");

    expect(response.status).toBe(200);
    expect(response.body.data.cover_image_url).toBe(
      "https://images.example.test/original.jpg",
    );
    expect(response.body.data.cover_image_storage_value).toBe(
      "https://images.example.test/original.jpg",
    );
    expect(response.body.data.cover_image_source).toBe("external");
  });
});
