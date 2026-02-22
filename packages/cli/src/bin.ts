#!/usr/bin/env node

/* Minimal CLI entrypoint. Keeps dependencies small for Phase 1.
   Recognises: devs init [--force|-f]
*/

import { init, status } from "./index.js";

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

  if (cmd === "status") {
    const json = args.includes("--json");
    try {
      const state = await status({ projectDir: process.cwd() });
      if (json) {
        console.log(JSON.stringify(state));
      } else {
        console.log(`Project: ${state.project.name} (status: ${state.project.status})`);
        if (state.active_epic) console.log(`Active epic: ${state.active_epic.name} (status: ${state.active_epic.status})`);
        if (state.active_task) console.log(`Active task: ${state.active_task.title} (status: ${state.active_task.status})`);
        console.log(`Progress: ${state.progress.completed}/${state.progress.total} (${state.progress.percent}%)`);
      }
      process.exit(0);
    } catch (err) {
      if (json) {
        console.log(JSON.stringify({ error: err && (err.message || String(err)) }));
      } else {
        console.error(err);
      }
      process.exit(1);
    }
  }

  console.error("Unknown command:", cmd);
  process.exit(2);
}

main();
