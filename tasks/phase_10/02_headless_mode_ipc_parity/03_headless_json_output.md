# Task: Headless Mode NDJSON Output (Sub-Epic: 02_Headless Mode & IPC Parity)

## Covered Requirements
- [1_PRD-REQ-INT-005]

## 1. Initial Test Written
- [ ] Write CLI integration tests in `@devs/cli` that execute commands with the `--json` flag.
- [ ] Verify that the command output contains only valid JSON (or NDJSON) and no Ink-based TUI artifacts (ANSI escapes, etc.).
- [ ] Verify that each line of output in NDJSON format is a valid JSON object with standard keys (`timestamp`, `type`, `payload`, `level`).
- [ ] Write a test to ensure error messages are also formatted as JSON when the `--json` flag is used.

## 2. Task Implementation
- [ ] Update the `@devs/cli` entry point (using `commander` or equivalent) to support a global `--json` flag.
- [ ] Create an `OutputManager` in `@devs/cli` that chooses between the Ink-based TUI and a JSON-only stream based on the `--json` flag.
- [ ] Implement the `NDJSON` formatter to pipe event-stream data (THOUGHT_STREAM, TOOL_LIFECYCLE) to `stdout` as JSON lines.
- [ ] Ensure that all core commands (`init`, `run`, `status`, etc.) correctly pipe their final results to the `OutputManager`.
- [ ] Suppress any TUI-specific logging or interactive prompts when `--json` is active.

## 3. Code Review
- [ ] Verify that the JSON output is machine-readable and suitable for CI/CD pipeline integration.
- [ ] Check that the JSON schema for output matches the specified SAOP (Structured Agent-Orchestrator Protocol) standards.
- [ ] Ensure that the `--json` flag correctly suppresses all TUI/Ink components to prevent non-JSON data from polluting `stdout`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -w @devs/cli` and specifically the new JSON output integration tests.
- [ ] Manually run `devs status --json` and pipe it through `jq` to verify structure.

## 5. Update Documentation
- [ ] Update the CLI README to document the `--json` flag and provide example JSON output schemas.
- [ ] Add a section on "CI/CD Integration" using the headless JSON mode.

## 6. Automated Verification
- [ ] Run a shell script that executes `devs run --json`, pipes to a JSON validator, and fails if the output is not valid NDJSON.
- [ ] Verify that no ANSI escape codes (for colors/TUI) are present in the JSON-mode `stdout`.
