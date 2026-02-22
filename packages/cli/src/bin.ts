#!/usr/bin/env node

/* Minimal CLI entrypoint. Keeps dependencies small for Phase 1.
   Recognises: devs init [--force|-f]
*/

<<<<<<< HEAD
import { init, status } from "./index.js";
=======
import { init, pause, resume, skip } from "./index.js";
>>>>>>> af488ca (phase_1:08_cli_integration_state_control/03_cli_state_control_commands.md: Implement Orchestrator Control Commands (`pause`, `resume`, `skip`))

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log("devs — available commands: init, pause, resume, skip");
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

<<<<<<< HEAD
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
=======
  if (cmd === "pause") {
    try {
      const rc = await pause({ projectDir: process.cwd() });
      process.exit(typeof rc === "number" ? rc : 0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  if (cmd === "resume") {
    try {
      const rc = await resume({ projectDir: process.cwd() });
      process.exit(typeof rc === "number" ? rc : 0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  if (cmd === "skip") {
    try {
      const rc = await skip({ projectDir: process.cwd() });
      process.exit(typeof rc === "number" ? rc : 0);
    } catch (err) {
      console.error(err);
>>>>>>> af488ca (phase_1:08_cli_integration_state_control/03_cli_state_control_commands.md: Implement Orchestrator Control Commands (`pause`, `resume`, `skip`))
      process.exit(1);
    }
  }

  console.error("Unknown command:", cmd);
  process.exit(2);
}

main();
