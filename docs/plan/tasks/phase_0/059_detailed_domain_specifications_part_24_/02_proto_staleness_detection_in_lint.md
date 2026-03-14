# Task: Proto Staleness Detection in ./do lint (Sub-Epic: 059_Detailed Domain Specifications (Part 24))

## Covered Requirements
- [2_TAS-REQ-244]

## Dependencies
- depends_on: ["01_proto_timestamp_and_build_logic.md"]
- shared_components: [./do Entrypoint Script, devs-proto]

## 1. Initial Test Written
- [ ] In `tests/e2e/lint_proto_staleness.rs` (or a shell-based test script `tests/verify_proto_staleness.sh`), write a test `test_lint_detects_stale_generated_files` that:
  - Copies a `.proto` file to a temp location, appends a harmless comment to the original `.proto` file (making it newer than `src/gen/` files).
  - Runs `./do lint` and asserts it exits with a non-zero status code.
  - Asserts stderr/stdout contains a message indicating stale generated files (e.g., "proto files are newer than generated sources").
  - Restores the original `.proto` file from the temp copy.
  - Add `// Covers: 2_TAS-REQ-244` annotation.
- [ ] Write a test `test_lint_passes_when_gen_files_are_current` that:
  - Touches all `src/gen/*.rs` files to be newer than all `.proto` files (or runs a fresh `build.rs` generation).
  - Runs `./do lint` and asserts it exits 0 (assuming no other lint failures).
  - Add `// Covers: 2_TAS-REQ-244` annotation.

## 2. Task Implementation
- [ ] In the `./do` script's `lint` subcommand, add a proto staleness check step that runs before or alongside other lint checks:
  - Find the newest modification time among all `proto/devs/v1/*.proto` files.
  - Find the oldest modification time among all `devs-proto/src/gen/*.rs` files.
  - If any `.proto` file is newer than the oldest generated file, print an error message: `"ERROR: Proto files are newer than generated sources in devs-proto/src/gen/. Run 'cargo build -p devs-proto' with protoc installed to regenerate."` and exit 1.
  - Use `stat` or `find` with POSIX-compatible timestamp comparison (e.g., `find proto/devs/v1 -name '*.proto' -newer devs-proto/src/gen/mod.rs`).
- [ ] Ensure the staleness check runs early in the lint pipeline so developers get fast feedback.

## 3. Code Review
- [ ] Verify the staleness check uses POSIX-compatible commands (no GNU-only extensions) since the `./do` script must work on Linux, macOS, and Windows (Git Bash).
- [ ] Verify the check compares against all generated files, not just one sentinel file, to avoid false negatives.
- [ ] Verify the error message is actionable and tells the developer exactly what to do.

## 4. Run Automated Tests to Verify
- [ ] Run the staleness test and confirm it correctly detects stale files.
- [ ] Run `./do lint` on a clean workspace and confirm it passes.

## 5. Update Documentation
- [ ] Add a comment in the `./do` script explaining the staleness check and referencing [2_TAS-REQ-244].

## 6. Automated Verification
- [ ] Run `./do lint` on a clean workspace and verify exit code 0.
- [ ] Touch a `.proto` file, run `./do lint`, and verify it exits non-zero with the expected error message.
- [ ] Verify `target/traceability.json` contains an entry for `2_TAS-REQ-244`.
