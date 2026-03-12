# Task: Implement Adapter Version Tracking and Freshness Enforcement (Sub-Epic: 18_Risk 004 Verification)

## Covered Requirements
- [RISK-004-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test script `tests/test_adapter_version_tracking.sh` that:
    - Runs `./do setup` and verifies `target/adapter-versions.json` is created.
    - Verifies the JSON schema matches the specification (schema_version, captured_at, adapters).
    - Checks that `./do lint` passes when the file is fresh.
    - Manually updates the `captured_at` timestamp in `target/adapter-versions.json` to be 8 days old and verifies that `./do lint` fails with a "stale compatibility check" error.
    - Deletes the file and verifies `./do lint` fails with a "missing compatibility check" error.

## 2. Task Implementation
- [ ] Update `./do` script's `setup` command to:
    - Probe each of the 5 adapters (`claude`, `gemini`, `opencode`, `qwen`, `copilot`) using their version flags (e.g., `--version`).
    - Parse the version strings.
    - Generate `target/adapter-versions.json` with the current ISO8601 timestamp.
- [ ] Update `./do` script's `lint` command to:
    - Check for the existence of `target/adapter-versions.json`.
    - Parse the `captured_at` field and compare it against the current system time.
    - Exit non-zero if the file is missing or the timestamp is > 7 days old.

## 3. Code Review
- [ ] Verify that the version probing logic handles missing binaries gracefully during `setup` (marking `compatible: false` or similar in the JSON).
- [ ] Ensure the timestamp comparison logic is robust across different timezones.
- [ ] Verify that the lint error messages are descriptive and provide actionable steps (e.g., "Run ./do setup to refresh").

## 4. Run Automated Tests to Verify
- [ ] Execute `bash tests/test_adapter_version_tracking.sh`.
- [ ] Run `./do setup` followed by `./do lint` to ensure they work in a clean environment.

## 5. Update Documentation
- [ ] Update `target/adapter-versions.json` schema documentation if any adjustments were made.

## 6. Automated Verification
- [ ] Run `./do presubmit` and ensure it passes, confirming the new lint check is active and satisfied.
