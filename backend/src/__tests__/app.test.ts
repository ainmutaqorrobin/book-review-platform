import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "3600000";
process.env.NODE_ENV = "test";

const { enrichReviewText, mockPool, mockQuery } = vi.hoisted(() => {
  const mockQuery = vi.fn<(...args: any[]) => Promise<any>>();
  const enrichReviewText = vi.fn<(text: string) => Promise<any>>();

  return {
    mockQuery,
    mockPool: {
      query: mockQuery,
      on: vi.fn(),
    },
    enrichReviewText,
  };
});

vi.mock("../config/db", () => ({
  default: mockPool,
}));

vi.mock("../mastra/agents/analyze-agent", () => ({
  analyzeAgents: {},
  enrichReviewText,
}));

vi.mock("@mastra/core", () => ({
  Mastra: class {
    constructor(_: unknown) {}
  },
}));

import { app } from "../app";

function createAuthCookie(userId: number, role: "user" | "admin") {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!);
  return `jwt=${token}`;
}

beforeEach(() => {
  mockQuery.mockReset();
  enrichReviewText.mockReset();
  enrichReviewText.mockResolvedValue({
    sentimentScore: 0.91,
    summary: "Helpful review",
    tags: ["helpful"],
  });
});

describe("Auth and RBAC", () => {
  it("allows anonymous users to list paginated books", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ total: 1 }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: "Book One",
            author: "Author",
            owner_user_id: 7,
          },
        ],
      });

    const response = await request(app).get("/books");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items[0].owner_user_id).toBe(7);
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 9,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("supports paginated books with page and limit params", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ total: 20 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 10, title: "Page Two", author: "Author" }],
      });

    const response = await request(app).get("/books?page=2&limit=9");

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toMatchObject({
      page: 2,
      limit: 9,
      totalItems: 20,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(mockQuery.mock.calls[1]?.[1]).toEqual([9, 9]);
  });

  it("filters paginated books by query", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ total: 1 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 2, title: "Clean Code", author: "Robert C. Martin" }],
      });

    const response = await request(app).get("/books?query=clean");

    expect(response.status).toBe(200);
    expect(response.body.data.items[0].title).toBe("Clean Code");
    expect(mockQuery.mock.calls[0]?.[1]).toEqual(["%clean%"]);
    expect(mockQuery.mock.calls[1]?.[1]).toEqual(["%clean%", 9, 0]);
  });

  it("filters paginated books to the signed-in owner's collection", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ total: 1 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 4, title: "Mine Only", author: "Owner", owner_user_id: 11 }],
      });

    const response = await request(app)
      .get("/books?scope=mine")
      .set("Cookie", createAuthCookie(11, "user"));

    expect(response.status).toBe(200);
    expect(response.body.data.items[0].owner_user_id).toBe(11);
    expect(mockQuery.mock.calls[0]?.[1]).toEqual([11]);
    expect(mockQuery.mock.calls[1]?.[1]).toEqual([11, 9, 0]);
  });

  it("rejects owner-scoped books for anonymous users", async () => {
    const response = await request(app).get("/books?scope=mine");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/sign in to view your books/i);
  });

  it("rejects invalid book pagination params", async () => {
    const response = await request(app).get("/books?page=0&limit=99");

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Validation failed/i);
  });

  it("allows anonymous users to create reviews", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            book_id: 2,
            reviewer_name: "Guest Reviewer",
            text: "Great book",
            rating: 5,
            summary: "Helpful review",
            sentiment_score: 0.91,
            tags: ["helpful"],
          },
        ],
      });

    const response = await request(app).post("/reviews/2").send({
      reviewer_name: "Guest Reviewer",
      text: "Great book",
      rating: 5,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(enrichReviewText).toHaveBeenCalledWith("Great book");
  });

  it("returns paginated reviews for a book", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ total: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            book_id: 2,
            reviewer_name: "Guest Reviewer",
            text: "Great book",
            rating: 5,
          },
        ],
      });

    const response = await request(app).get("/reviews/2?page=1&limit=1");

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("clamps review pages beyond the last page", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ total: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 11,
            book_id: 2,
            reviewer_name: "Another Reviewer",
            text: "Still good",
            rating: 4,
          },
        ],
      });

    const response = await request(app).get("/reviews/2?page=9&limit=1");

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toMatchObject({
      page: 2,
      limit: 1,
      totalItems: 2,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
    expect(mockQuery.mock.calls[2]?.[1]).toEqual([2, 1, 1]);
  });

  it("rejects anonymous book creation", async () => {
    const response = await request(app).post("/books").send({
      title: "Restricted",
      author: "Guest",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Authentication required/i);
  });

  it("lets signed-in users create books with ownership", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 5,
          title: "Owned Book",
          author: "User",
          owner_user_id: 11,
        },
      ],
    });

    const response = await request(app)
      .post("/books")
      .set("Cookie", createAuthCookie(11, "user"))
      .send({
        title: "Owned Book",
        author: "User",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.owner_user_id).toBe(11);
    const params = mockQuery.mock.calls[0]?.[1] as unknown[];
    expect(params[4]).toBe(11);
  });

  it("lets users edit their own books", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ id: 8, title: "Mine", owner_user_id: 22 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 8, title: "Updated", owner_user_id: 22 }],
      });

    const response = await request(app)
      .put("/books/8")
      .set("Cookie", createAuthCookie(22, "user"))
      .send({ title: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated");
  });

  it("prevents users from editing books they do not own", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 9, title: "Not Mine", owner_user_id: 30 }],
    });

    const response = await request(app)
      .put("/books/9")
      .set("Cookie", createAuthCookie(22, "user"))
      .send({ title: "Hack Attempt" });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/don't have access/i);
  });

  it("lets users delete their own books", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ id: 10, title: "Mine", owner_user_id: 22 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 10, title: "Mine", owner_user_id: 22 }],
      });

    const response = await request(app)
      .delete("/books/10")
      .set("Cookie", createAuthCookie(22, "user"));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("lets admins delete any book", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 12, title: "Admin Removed", owner_user_id: 44 }],
    });

    const response = await request(app)
      .delete("/books/12")
      .set("Cookie", createAuthCookie(1, "admin"));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns the current user when the auth cookie is valid", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 15,
          username: "reader",
          name: "Reader",
          role: "user",
          created_at: new Date().toISOString(),
        },
      ],
    });

    const response = await request(app)
      .get("/auth/me")
      .set("Cookie", createAuthCookie(15, "user"));

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("reader");
  });

  it("rejects /auth/me when no auth cookie is present", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Authentication required/i);
  });

  it("does not allow public signup to escalate to admin", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [
        {
          id: 33,
          username: "new-user",
          name: "New User",
          role: "user",
          created_at: new Date().toISOString(),
        },
      ],
    });

    const response = await request(app).post("/auth/signup").send({
      username: "new-user",
      name: "New User",
      password: "secret123",
      role: "admin",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.role).toBe("user");
    const params = mockQuery.mock.calls[1]?.[1] as unknown[];
    expect(params[3]).toBe("user");
  });

  it("lets authenticated users change their password", async () => {
    const currentPasswordHash = await hash("secret123", 10);

    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 15,
            username: "reader",
            name: "Reader",
            role: "user",
            password_hash: currentPasswordHash,
            created_at: new Date().toISOString(),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 15,
            username: "reader",
            name: "Reader",
            role: "user",
            created_at: new Date().toISOString(),
          },
        ],
      });

    const response = await request(app)
      .patch("/auth/password")
      .set("Cookie", createAuthCookie(15, "user"))
      .send({
        currentPassword: "secret123",
        newPassword: "newsecret123",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/password changed successfully/i);
    const params = mockQuery.mock.calls[1]?.[1] as unknown[];
    expect(params[1]).toBe(15);
    expect(typeof params[0]).toBe("string");
    expect(params[0]).not.toBe("newsecret123");
  });

  it("rejects password changes when the current password is wrong", async () => {
    const currentPasswordHash = await hash("secret123", 10);

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 15,
          username: "reader",
          name: "Reader",
          role: "user",
          password_hash: currentPasswordHash,
          created_at: new Date().toISOString(),
        },
      ],
    });

    const response = await request(app)
      .patch("/auth/password")
      .set("Cookie", createAuthCookie(15, "user"))
      .send({
        currentPassword: "wrong-pass",
        newPassword: "newsecret123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/current password is incorrect/i);
  });
});
