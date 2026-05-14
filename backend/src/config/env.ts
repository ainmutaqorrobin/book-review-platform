import "dotenv/config";

export type EnvRequirement = "required" | "optional" | "feature";
export type EnvStatus = "set" | "missing" | "fallback";

type EnvDefinition = {
  name: string;
  requirement: EnvRequirement;
  description: string;
  defaultValue?: string;
  sensitive?: boolean;
  group?: string;
};

type EnvGroupRequirement = {
  name: string;
  anyOf: string[];
  description: string;
};

export type EnvironmentStatusEntry = {
  name: string;
  requirement: EnvRequirement;
  description: string;
  status: EnvStatus;
  sensitive: boolean;
  fallbackValue?: string;
  group?: string;
};

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://book-review.mutaqorrobin.online",
];

const ENV_DEFINITIONS: EnvDefinition[] = [
  {
    name: "NODE_ENV",
    requirement: "optional",
    description: "Runtime environment mode",
  },
  {
    name: "PORT",
    requirement: "optional",
    description: "Backend runtime port",
    defaultValue: "4000",
  },
  {
    name: "DATABASE_URL",
    requirement: "required",
    description: "PostgreSQL connection string",
    sensitive: true,
  },
  {
    name: "OPENAI_API_KEY",
    requirement: "optional",
    description: "OpenAI API key for AI review enrichment",
    sensitive: true,
    group: "ai-provider",
  },
  {
    name: "ANTHROPIC_API_KEY",
    requirement: "optional",
    description: "Anthropic API key for AI review enrichment",
    sensitive: true,
    group: "ai-provider",
  },
  {
    name: "JWT_SECRET",
    requirement: "required",
    description: "JWT signing secret",
    sensitive: true,
  },
  {
    name: "JWT_EXPIRES_IN",
    requirement: "required",
    description: "JWT expiration duration",
  },
  {
    name: "CORS_ALLOWED_ORIGINS",
    requirement: "optional",
    description: "Comma-separated allowed CORS origins",
    defaultValue: DEFAULT_ALLOWED_ORIGINS.join(","),
  },
  {
    name: "GLOBAL_RATE_LIMIT_MAX",
    requirement: "optional",
    description: "Global request limit per window",
    defaultValue: "100",
  },
  {
    name: "REVIEW_RATE_LIMIT_WINDOW_MS",
    requirement: "optional",
    description: "Review submit rate-limit window in milliseconds",
    defaultValue: String(15 * 60 * 1000),
  },
  {
    name: "REVIEW_RATE_LIMIT_MAX",
    requirement: "optional",
    description: "Review submit rate-limit max requests",
    defaultValue: "300",
  },
  {
    name: "LOG_LEVEL",
    requirement: "optional",
    description: "Structured logger level",
    defaultValue: "info",
  },
  {
    name: "LOG_PRETTY",
    requirement: "optional",
    description: "Pretty-print logs instead of JSON",
    defaultValue: "false",
  },
  {
    name: "S3_ENDPOINT",
    requirement: "feature",
    description: "S3-compatible endpoint for uploaded book covers",
  },
  {
    name: "S3_PUBLIC_ENDPOINT",
    requirement: "feature",
    description: "Public base URL for uploaded book covers",
  },
  {
    name: "S3_ACCESS_KEY",
    requirement: "feature",
    description: "S3 access key for uploaded book covers",
    sensitive: true,
  },
  {
    name: "S3_SECRET_KEY",
    requirement: "feature",
    description: "S3 secret key for uploaded book covers",
    sensitive: true,
  },
  {
    name: "S3_BUCKET",
    requirement: "feature",
    description: "S3 bucket name for uploaded book covers",
  },
  {
    name: "S3_REGION",
    requirement: "feature",
    description: "S3 region for uploaded book covers",
    defaultValue: "us-east-1",
  },
  {
    name: "S3_FORCE_PATH_STYLE",
    requirement: "feature",
    description: "Enable path-style S3 requests",
    defaultValue: "false",
  },
];

const ENV_GROUP_REQUIREMENTS: EnvGroupRequirement[] = [
  {
    name: "ai-provider",
    anyOf: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],
    description: "At least one AI provider key must be configured",
  },
];

function getTrimmedValue(
  name: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const value = env[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseNumberEnv(name: string, fallbackValue: number) {
  const rawValue = getTrimmedValue(name);

  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${name} must be a valid number`);
  }

  return parsedValue;
}

export function collectEnvironmentStatus(
  env: NodeJS.ProcessEnv = process.env,
): EnvironmentStatusEntry[] {
  return ENV_DEFINITIONS.map((definition) => {
    const value = getTrimmedValue(definition.name, env);

    if (value) {
      return {
        name: definition.name,
        requirement: definition.requirement,
        description: definition.description,
        status: "set",
        sensitive: Boolean(definition.sensitive),
        group: definition.group,
      };
    }

    if (definition.defaultValue !== undefined) {
      return {
        name: definition.name,
        requirement: definition.requirement,
        description: definition.description,
        status: "fallback",
        sensitive: Boolean(definition.sensitive),
        fallbackValue: definition.defaultValue,
        group: definition.group,
      };
    }

    return {
      name: definition.name,
      requirement: definition.requirement,
      description: definition.description,
      status: "missing",
      sensitive: Boolean(definition.sensitive),
      group: definition.group,
    };
  });
}

export function getEnvironmentDiagnostics(
  env: NodeJS.ProcessEnv = process.env,
) {
  const entries = collectEnvironmentStatus(env);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const missingRequired = entries
    .filter(
      (entry) => entry.requirement === "required" && entry.status === "missing",
    )
    .map((entry) => entry.name);
  const fallback = entries
    .filter((entry) => entry.status === "fallback")
    .map((entry) => entry.name);
  const missingOptional = entries
    .filter(
      (entry) => entry.requirement === "optional" && entry.status === "missing",
    )
    .map((entry) => entry.name);
  const missingFeature = entries
    .filter(
      (entry) => entry.requirement === "feature" && entry.status === "missing",
    )
    .map((entry) => entry.name);
  const missingGroups = ENV_GROUP_REQUIREMENTS.filter(
    (group) =>
      !group.anyOf.some((envName) => byName.get(envName)?.status === "set"),
  );

  return {
    entries,
    summary: {
      set: entries.filter((entry) => entry.status === "set").length,
      fallback: fallback.length,
      missing: entries.filter((entry) => entry.status === "missing").length,
    },
    fallback,
    missingRequired,
    missingOptional,
    missingFeature,
    missingGroups,
  };
}

export function assertRequiredEnvironment(
  env: NodeJS.ProcessEnv | EnvironmentStatusEntry[] = process.env,
) {
  const entries = Array.isArray(env) ? env : collectEnvironmentStatus(env);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const missingRequired = entries
    .filter(
      (entry) => entry.requirement === "required" && entry.status === "missing",
    )
    .map((entry) => entry.name);
  const missingGroups = ENV_GROUP_REQUIREMENTS.filter(
    (group) =>
      !group.anyOf.some((envName) => byName.get(envName)?.status === "set"),
  );

  if (missingRequired.length === 0 && missingGroups.length === 0) {
    return;
  }

  const problems = [
    ...missingRequired.map((name) => `${name} is required`),
    ...missingGroups.map((group) => group.description),
  ];

  throw new Error(`Environment validation failed: ${problems.join("; ")}`);
}

export function requireEnv(
  name: string,
  errorPrefix = "Missing required environment variable",
) {
  const value = getTrimmedValue(name);

  if (!value) {
    throw new Error(`${errorPrefix}: ${name}`);
  }

  return value;
}

export function getPort() {
  return parseNumberEnv("PORT", 4000);
}

export function getAllowedOrigins() {
  return (
    getTrimmedValue("CORS_ALLOWED_ORIGINS") ?? DEFAULT_ALLOWED_ORIGINS.join(",")
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getGlobalRateLimitMax() {
  return parseNumberEnv("GLOBAL_RATE_LIMIT_MAX", 100);
}

export function getReviewRateLimitWindowMs() {
  return parseNumberEnv("REVIEW_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000);
}

export function getReviewRateLimitMax() {
  return parseNumberEnv("REVIEW_RATE_LIMIT_MAX", 300);
}

export function getLogLevel() {
  return getTrimmedValue("LOG_LEVEL") ?? "info";
}

export function isPrettyLoggingEnabled() {
  return (getTrimmedValue("LOG_PRETTY") ?? "false").toLowerCase() === "true";
}

export function getJwtSecret() {
  return requireEnv("JWT_SECRET");
}

export function getJwtExpiresIn() {
  return requireEnv("JWT_EXPIRES_IN");
}

export function getDatabaseUrl() {
  return requireEnv("DATABASE_URL");
}

export function getStorageEnv(name: string) {
  return requireEnv(name, "Missing required storage configuration");
}

export function getS3Region() {
  return getTrimmedValue("S3_REGION") ?? "us-east-1";
}

export function isS3ForcePathStyleEnabled() {
  return (
    (getTrimmedValue("S3_FORCE_PATH_STYLE") ?? "false").toLowerCase() === "true"
  );
}
