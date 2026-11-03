import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith(".test.mjs") || f.endsWith(".test.js"))
  .sort();

for (const file of testFiles) {
  await import(pathToFileURL(path.join(__dirname, file)).href);
}
