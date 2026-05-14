import {
  assertRequiredEnvironment,
  getEnvironmentDiagnostics,
} from "../config/env";

const diagnostics = getEnvironmentDiagnostics();

console.table(
  diagnostics.entries.map((entry) => ({
    NAME: entry.name,
    REQUIREMENT: entry.requirement,
    STATUS: entry.status,
    FALLBACK: entry.fallbackValue ?? "",
    DESCRIPTION: entry.description,
  })),
);

console.log("");
console.log("Summary:");
console.log(`- set: ${diagnostics.summary.set}`);
console.log(`- fallback: ${diagnostics.summary.fallback}`);
console.log(`- missing: ${diagnostics.summary.missing}`);

if (diagnostics.missingRequired.length > 0) {
  console.log(`- missing required: ${diagnostics.missingRequired.join(", ")}`);
}

if (diagnostics.missingFeature.length > 0) {
  console.log(
    `- missing feature envs: ${diagnostics.missingFeature.join(", ")}`,
  );
}

if (diagnostics.missingGroups.length > 0) {
  console.log(
    `- missing grouped requirements: ${diagnostics.missingGroups
      .map((group) => group.description)
      .join(", ")}`,
  );
}

assertRequiredEnvironment(diagnostics.entries);
