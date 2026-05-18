import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "../../");

const nodeEnv = process.env.NODE_ENV || "development";
const requestedPath = process.env.DOTENV_CONFIG_PATH;

const candidateFiles = requestedPath
  ? [requestedPath]
  : nodeEnv === "production"
    ? [path.join(serverRoot, ".env.production")]
    : [path.join(serverRoot, ".env")];

for (const envPath of candidateFiles) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
    break;
  }
}

export const NODE_ENV = nodeEnv;
export const IS_PRODUCTION = nodeEnv === "production";