import { app } from "./app";
import {
  assertRequiredEnvironment,
  getEnvironmentDiagnostics,
  getPort,
} from "./config/env";
import { ensureDatabaseSchema } from "./config/ensureSchema";
import { logger } from "./services/logger";
const environmentDiagnostics = getEnvironmentDiagnostics();

logger.info(
  {
    summary: environmentDiagnostics.summary,
    fallback: environmentDiagnostics.fallback,
    missingOptional: environmentDiagnostics.missingOptional,
    missingFeature: environmentDiagnostics.missingFeature,
  },
  "Environment variables checked",
);

assertRequiredEnvironment(environmentDiagnostics.entries);

const PORT = getPort();

await ensureDatabaseSchema();

app.listen(PORT, () => logger.info({ port: PORT }, "Server running"));
