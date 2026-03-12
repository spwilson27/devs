# Task: CLI JSON Output Schemas Implementation (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086G]

## Dependencies
- depends_on: [none]
- shared_components: [devs-cli, devs-proto, devs-core]

## 1. Initial Test Written
- [ ] In `devs-cli`, create integration tests using `assert_cmd` to verify the JSON output of all subcommands when `--format json` is passed.
- [ ] Test that `submit`, `list`, `status`, `logs`, `cancel`, `pause`, `resume`, and `project` commands produce JSON that conforms to the normative schemas.
- [ ] Test the error JSON format: `{ "error": "<message>", "code": <n> }` for all error scenarios as per [2_TAS-REQ-063].
- [ ] Verify that all JSON responses include a `request_id` where applicable.

## 2. Task Implementation
- [ ] In `devs-cli`, implement the `Serialize` trait for CLI response types or use `serde_json` to format gRPC response types.
- [ ] Ensure that all commands respect the `--format json` flag.
- [ ] Implement the normative JSON output schemas for all CLI subcommands as defined in [2_TAS-REQ-086G].
- [ ] Use `devs-core` types where possible to ensure consistency across the application.

## 3. Code Review
- [ ] Verify that all CLI commands consistently use the same JSON error structure.
- [ ] Verify that the JSON output doesn't contain any human-readable text outside of the JSON structure itself.
- [ ] Ensure that the CLI output remains parseable by standard JSON tools.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli`.
- [ ] Ensure all CLI JSON output integration tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the implementation of CLI JSON output schemas.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments and code quality standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086G] to the new tests.
