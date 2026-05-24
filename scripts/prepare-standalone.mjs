import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, ".next");
const standaloneDir = join(distDir, "standalone");

function copyIntoStandalone(source, target) {
  if (!existsSync(source)) {
    return;
  }

  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

copyIntoStandalone(join(root, "public"), join(standaloneDir, "public"));
copyIntoStandalone(join(distDir, "static"), join(standaloneDir, ".next", "static"));

console.log("Prepared standalone build in .next/standalone");
