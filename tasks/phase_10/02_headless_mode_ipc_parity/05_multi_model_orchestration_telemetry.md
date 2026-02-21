# Task: Multi-Model Orchestration Telemetry (Sub-Epic: 02_Headless Mode & IPC Parity)

## Covered Requirements
- [1_PRD-REQ-SYS-003]

## 1. Initial Test Written
- [ ] Write integration tests in `@devs/cli` to verify that the CLI correctly reports the model being used (Gemini 3 Pro for implementation vs. Flash for review/linting) during a task.
- [ ] Write a test that executes a command with the `--json` flag and verify that each agent interaction includes a `model` field in the payload.
- [ ] Verify that the CLI correctly reports when the orchestrator is switching between models for different agent roles.

## 2. Task Implementation
- [ ] Update the `OrchestratorEvent` schema in `@devs/core` to include a `model` field in all SAOP-compliant agent turn envelopes.
- [ ] Configure the `OrchestrationEngine` in `@devs/core` to populate the `model` field with the model name (e.g., `gemini-3-pro-v1`, `gemini-3-flash-v1`) based on the active agent role (Pro for implementation, Flash for review).
- [ ] Integrate this telemetry into the CLI's `OutputManager` so that it is included in both the Ink-based TUI and the `--json` output stream.
- [ ] Add a "Model Indicator" to the CLI's TUI (if not already present) that visually distinguishes between Pro-driven and Flash-driven tasks.
- [ ] Ensure that the JSON output accurately reflects the multi-model orchestration strategy in real-time.

## 3. Code Review
- [ ] Verify that the model telemetry is included in all relevant agent interactions, as per the SAOP standards.
- [ ] Ensure that the `model` field is correctly populated for both success and error responses.
- [ ] Check for consistency between the model names reported by the CLI and the backend orchestrator.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -w @devs/core` and `npm test -w @devs/cli` to verify the new multi-model orchestration telemetry.
- [ ] Manually execute `devs run --json` and verify the `model` fields in the NDJSON output stream.

## 5. Update Documentation
- [ ] Update the SAOP schema documentation to include the new `model` field in the agent interaction envelopes.
- [ ] Document the CLI's multi-model telemetry support in the README.

## 6. Automated Verification
- [ ] Run a shell script that executes the CLI with the `--json` flag, parses the output, and fails if the `model` field is missing or contains incorrect values for specific agent roles.
- [ ] Validate that the "Model Indicator" in the TUI correctly displays the model information when a task is in progress.
