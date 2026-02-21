# Task: Implement NDJSON Headless Output Support (Sub-Epic: 01_CLI Foundation & Core Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-002]

## 1. Initial Test Written
- [ ] Write a test in `packages/cli/tests/headless.test.ts` that executes a command with the `--json` flag.
- [ ] Assert that the stdout contains valid JSON strings separated by newlines (NDJSON).
- [ ] Verify that the JSON objects contain standard fields: `timestamp`, `level`, `event`, and `payload`.

## 2. Task Implementation
- [ ] Add a global `--json` flag to the `commander` program in `packages/cli/src/index.ts`.
- [ ] Implement a `HeadlessLogger` utility that formats log events into NDJSON.
- [ ] Update `CLIController` to detect the `--json` flag and toggle between the interactive (TUI) and headless (NDJSON) output streams.
- [ ] Ensure that all command outputs (including progress updates from the orchestrator) are piped through the `HeadlessLogger` when the flag is active.

## 3. Code Review
- [ ] Verify that NDJSON output does not contain any `chalk` ANSI escape codes or TUI artifacts.
- [ ] Ensure the JSON schema for events is consistent across all commands.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/tests/headless.test.ts` and ensure the output is parseable by `JSON.parse`.

## 5. Update Documentation
- [ ] Document the NDJSON schema in `docs/cli/headless-mode.md` for CI/CD integration purposes.

## 6. Automated Verification
- [ ] Run `devs status --json | jq .` and verify that the output is valid JSON and contains the project status.
