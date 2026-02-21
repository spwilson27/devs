# Task: Headless Navigation & Phase Gate Logic (Sub-Epic: 02_Headless Mode & IPC Parity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-069], [8_RISKS-REQ-054]

## 1. Initial Test Written
- [ ] Write integration tests in `@devs/cli` to verify that when the `--json` flag is used, the CLI bypasses any interactive prompts (e.g., using default values or failing if user input is strictly required).
- [ ] Write a test that simulates a "Phase Gate" (e.g., waiting for PRD approval) and verify that in headless mode, the CLI returns a specific JSON object indicating `WAITING_FOR_APPROVAL`.
- [ ] Write a test to ensure the CLI ignores complex navigation commands and automatically focuses on the current active task when in headless mode.

## 2. Task Implementation
- [ ] Implement the `HeadlessNavigation` logic in `@devs/cli/src/headless-nav.ts`.
- [ ] Configure the CLI to suppress interactive UI prompts (e.g., `inquirer` or Ink's approval components) when in headless mode.
- [ ] Implement a mechanism to provide "Automatic Defaults" for simple prompts in headless mode (e.g., `devs init --yes`).
- [ ] Update the `PhaseGate` handling in `@devs/cli` to output a `PHASE_GATE_PENDING` JSON status message instead of blocking on terminal input.
- [ ] Implement logic that ensures the CLI always defaults to the current active task or phase gate, ignoring any UI-driven navigation state that may be present in a parallel TUI or Extension session.

## 3. Code Review
- [ ] Verify that the "Headless Transition" logic correctly ignores complex navigation parameters as per `6_UI_UX_ARCH-REQ-069`.
- [ ] Ensure that the CLI does not block indefinitely on user input when in headless mode.
- [ ] Check for clear error messages when the CLI requires user input in headless mode but no default value or `--yes` flag is provided.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -w @devs/cli` and verify the new headless navigation integration tests.
- [ ] Manually test `devs run --json` in a project with a pending phase gate and verify the non-blocking JSON response.

## 5. Update Documentation
- [ ] Update the CLI documentation to explain how to handle "Phase Gates" and approvals in CI/CD or headless environments.
- [ ] Document the use of the `--yes` flag (or similar) to provide default answers to interactive prompts.

## 6. Automated Verification
- [ ] Run a shell script that executes the CLI in a project requiring a phase-gate approval, verify that it exits with a non-zero code or a `PHASE_GATE_PENDING` JSON message, and doesn't hang.
- [ ] Validate that navigation-related UI events from the IPC stream are ignored in the headless JSON mode.
