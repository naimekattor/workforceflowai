#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const ENV_FILES = [".env.production.local", ".env.local", ".env.production", ".env"];
const REQUIRED_BUILD_ARGS = ["NEXT_PUBLIC_BASE_URL"];
const OPTIONAL_BUILD_ARGS = ["NEXT_PUBLIC_WS_URL"];

function parseEnvValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\n/g, "\n");
  }

  return trimmed;
}

function loadEnvFiles(projectRoot) {
  const values = {};

  for (const fileName of ENV_FILES) {
    const filePath = path.join(projectRoot, fileName);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (values[key] === undefined && process.env[key] === undefined) {
        values[key] = parseEnvValue(rawValue);
      }
    }
  }

  return values;
}

function getEnvValue(key, loadedValues) {
  return process.env[key] ?? loadedValues[key] ?? "";
}

const projectRoot = process.cwd();
const loadedValues = loadEnvFiles(projectRoot);
const passthroughArgs = process.argv.slice(2).filter((arg) => arg !== "--dry-run");
const isDryRun = process.argv.includes("--dry-run");

for (const key of REQUIRED_BUILD_ARGS) {
  if (!getEnvValue(key, loadedValues)) {
    console.error(
      `Missing ${key}. Set it in .env.production, .env, or the shell before building.`
    );
    process.exit(1);
  }
}

const dockerArgs = ["build"];

for (const key of [...REQUIRED_BUILD_ARGS, ...OPTIONAL_BUILD_ARGS]) {
  dockerArgs.push("--build-arg", `${key}=${getEnvValue(key, loadedValues)}`);
}

dockerArgs.push(...passthroughArgs);

if (!passthroughArgs.some((arg) => !arg.startsWith("-"))) {
  dockerArgs.push(".");
}

if (isDryRun) {
  console.log(["docker", ...dockerArgs].join(" "));
  process.exit(0);
}

const result = spawnSync("docker", dockerArgs, {
  cwd: projectRoot,
  shell: process.platform === "win32",
  stdio: "inherit",
});

process.exit(result.status ?? 1);
