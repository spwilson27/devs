# Task: Implement Per-Dispatch PTY Fallback Logging (Sub-Epic: 13_Risk 001 Verification)

## Covered Requirements
- [RISK-002-BR-002]

## Dependencies
- depends_on: ["03_pty_capability_probe_mitigation.md"]
- shared_components: [devs-adapters, devs-scheduler]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-scheduler/tests/pty_logging_tests.rs`.
- [ ] Mock the PTY probe to set `PTY_AVAILABLE = false`.
- [ ] Define a workflow with a stage that explicitly requests `pty = true`.
- [ ] Use a custom `tracing` subscriber to capture logs.
- [ ] Assert that a `WARN` log is emitted with `event_type: "adapter.pty_fallback"` and the correct `tool` name when the stage is dispatched.
- [ ] Verify that the log is emitted once per stage dispatch, even if multiple stages in the same run fallback.
- [ ] Verify the test fails.

## 2. Task Implementation
- [ ] In the adapter's `spawn` or `build_command` logic in `devs-adapters`, add a check for `PTY_AVAILABLE`.
- [ ] If `PTY_AVAILABLE == false` and the stage/adapter configuration requires `pty = true`, emit the `WARN` log:
    ```rust
    tracing::warn!(
        event_type = "adapter.pty_fallback",
        tool = adapter_name,
        "PTY is unavailable on this system; spawning agent without PTY."
    );
    ```
- [ ] Ensure the log is emitted before spawning the process without PTY.
- [ ] Verify that this logic is integrated into the core dispatch loop such that it fires once per dispatch.

## 3. Code Review
- [ ] Verify that the log structure strictly matches the requirement in [RISK-002-BR-002]: `event_type` and `tool` fields must be present.
- [ ] Ensure that no log is emitted if `PTY_AVAILABLE == true` or if `pty = false` is explicitly configured.
- [ ] Confirm the log message is clear and helpful for the end user.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-scheduler --test pty_logging_tests`
- [ ] Ensure the test is annotated with `// Covers: RISK-002-BR-002`.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` to indicate that PTY fallback logging is implemented and verified.
- [ ] Ensure the structured log fields are documented in the server's logging policy.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new logging integration test passes.
- [ ] Verify that the log output format is correctly serialized as JSON when the server's log output is set to `json`.
