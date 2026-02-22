#!/usr/bin/env node

/* Minimal CLI entrypoint. Keeps dependencies small for Phase 1.
   Recognises: devs init [--force|-f]
*/

import { init } from "./index.js";

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log("devs — available commands: init");
    process.exit(0);
  }

  if (cmd === "init") {
    const force = args.includes("--force") || args.includes("-f");
    try {
      const rc = await init({ projectDir: process.cwd(), force });
      process.exit(typeof rc === "number" ? rc : 0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  console.error("Unknown command:", cmd);
  process.exit(2);
}

main();
