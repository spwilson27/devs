# Task: CLI & UI Rewind Controls (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-002]

## 1. Initial Test Written
- [ ] Create `src/cli/__tests__/rewind_command.test.ts`.
- [ ] Write a test `should parse devs rewind --to <task_id> and pass the task ID to the orchestrator`.
- [ ] Write a test `should exit with code 1 and print an error if the orchestrator throws a RewindStateError`.
- [ ] Create `src/extension/ui/__tests__/rewind_action.test.ts` for the VSCode extension.
- [ ] Write a test `should trigger the devs.rewindTo command with the selected task node ID from the tree view`.

## 2. Task Implementation
- [ ] Modify `src/cli/index.ts` to register the `rewind` command using Commander or Yargs.
- [ ] Implement the command handler to extract the `--to` argument and invoke `RewindOrchestrator.executeRewind()`.
- [ ] Add user-facing progress indicators (e.g., "Rewinding git state...", "Cleaning database...").
- [ ] In the VSCode extension (`src/extension/extension.ts`), register the VSCode command `devs.rewindTo`.
- [ ] Wire the command to a "Rewind to Here" context menu item on the Task Tree View items in `package.json`.
- [ ] Upon invocation, the VSCode extension should send an IPC message to the Orchestrator Server to execute the rewind, displaying a progress notification.

## 3. Code Review
- [ ] Ensure CLI output is clear and properly formatted, matching existing CLI conventions.
- [ ] Verify that the VSCode extension correctly handles IPC errors and displays them as user-friendly toast error messages.
- [ ] Check that the CLI command requires confirmation (`--force` or a prompt) to prevent accidental data loss, unless running in headless mode.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit -- src/cli/__tests__/rewind_command.test.ts` and verify it passes.
- [ ] Run `npm run test:extension -- src/extension/ui/__tests__/rewind_action.test.ts` to verify extension logic.

## 5. Update Documentation
- [ ] Update `docs/cli_reference.md` to include the `devs rewind` command, its arguments, and examples.
- [ ] Update `docs/vscode_extension.md` to describe the new context menu action in the task tree.

## 6. Automated Verification
- [ ] Run `node dist/cli/index.js rewind --help` and use a script to assert that the output contains the description of the `--to` flag.
