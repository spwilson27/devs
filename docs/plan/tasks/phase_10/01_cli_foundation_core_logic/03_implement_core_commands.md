# Task: Implement init, run, and status Command Handlers (Sub-Epic: 01_CLI Foundation & Core Logic)

## Covered Requirements
- [1_PRD-REQ-INT-001]

## 1. Initial Test Written
- [ ] Create integration tests in `packages/cli/tests/commands.test.ts`.
- [ ] Mock the `CLIController` methods for `init`, `run`, and `status`.
- [ ] Assert that `devs init` calls the controller's init method with the current directory.
- [ ] Assert that `devs status` retrieves the project state from the controller and prints a message.
- [ ] Assert that `devs run` initiates the implementation loop.

## 2. Task Implementation
- [ ] In `packages/cli/src/index.ts`, define the `init` command using `commander`.
- [ ] Define the `run` command with optional flags for `--epic` or `--task`.
- [ ] Define the `status` command to show current progress.
- [ ] Connect these commands to the corresponding methods in `CLIController`.
- [ ] Implement basic console output (using `chalk`) for these commands before the TUI is integrated.

## 3. Code Review
- [ ] Ensure consistent naming conventions for command flags.
- [ ] Verify that commands provide helpful error messages for missing arguments (e.g., project name for `init`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/tests/commands.test.ts` and verify all commands are correctly routed.

## 5. Update Documentation
- [ ] Update `requirements.md` or local README to reflect that `init`, `run`, and `status` are now available in the CLI.

## 6. Automated Verification
- [ ] Run `node dist/index.js init my-test-project` and verify it creates a `.devs` directory or the expected initial structure (mocked if necessary).
