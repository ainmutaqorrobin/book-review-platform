import { describe, expect, it } from "vitest";
import {
  assertRequiredEnvironment,
  collectEnvironmentStatus,
} from "../config/env";

describe("environment configuration", () => {
  it("reports set, fallback, and missing env values", () => {
    const entries = collectEnvironmentStatus({
      DATABASE_URL: "postgresql://db",
      JWT_SECRET: "secret",
      JWT_EXPIRES_IN: "3600000",
      REDIS_URL: "redis://127.0.0.1:6379",
      OPENAI_API_KEY: "sk-test",
    } as NodeJS.ProcessEnv);

    const byName = new Map(entries.map((entry) => [entry.name, entry]));

    expect(byName.get("DATABASE_URL")?.status).toBe("set");
    expect(byName.get("PORT")?.status).toBe("fallback");
    expect(byName.get("S3_ENDPOINT")?.status).toBe("missing");
    expect(byName.get("S3_ENDPOINT")?.requirement).toBe("feature");
  });

  it("accepts configuration when at least one AI provider key exists", () => {
    const entries = collectEnvironmentStatus({
      DATABASE_URL: "postgresql://db",
      JWT_SECRET: "secret",
      JWT_EXPIRES_IN: "3600000",
      REDIS_URL: "redis://127.0.0.1:6379",
      OPENAI_API_KEY: "sk-test",
    } as NodeJS.ProcessEnv);

    expect(() => assertRequiredEnvironment(entries)).not.toThrow();
  });

  it("rejects missing required runtime configuration", () => {
    const entries = collectEnvironmentStatus({
      JWT_SECRET: "secret",
      JWT_EXPIRES_IN: "3600000",
    } as NodeJS.ProcessEnv);

    expect(() => assertRequiredEnvironment(entries)).toThrow(
      /DATABASE_URL is required/i,
    );
  });
});
