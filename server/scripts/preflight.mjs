const required = ["JWT_SECRET"];

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasSplitDbVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"].every((key) => Boolean(process.env[key]));

if (!hasDatabaseUrl && !hasSplitDbVars) {
  required.push("DATABASE_URL (ou DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)");
}

const missing = required.filter((key) => {
  if (key.includes("DATABASE_URL")) {
    return false;
  }
  return !process.env[key];
});

if (missing.length > 0) {
  console.error("[Render Preflight] Variables manquantes:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

console.log("[Render Preflight] OK: configuration minimale détectée.");
console.log(`[Render Preflight] NODE_ENV=${process.env.NODE_ENV || "development"}`);
console.log(`[Render Preflight] PORT=${process.env.PORT || "4000"}`);
console.log(`[Render Preflight] DB_MODE=${hasDatabaseUrl ? "DATABASE_URL" : "SPLIT_VARS"}`);
