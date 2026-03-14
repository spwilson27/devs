# Task: Unit vs E2E Test Separation and Serialization (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-015A], [2_TAS-REQ-015B]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Server Discovery Protocol (consumer — DEVS_DISCOVERY_FILE)]

## 1. Initial Test Written
- [ ] Create `tests/e2e/isolation_test.rs` in a workspace crate (e.g., `devs-server` or a dedicated `devs-e2e` crate) with two E2E test functions:
  - `e2e::isolation::test_unique_discovery_file_a` — generates a unique `DEVS_DISCOVERY_FILE` path via `tempfile::NamedTempFile`, sets the env var, writes a mock server address to it, reads it back, and asserts the content matches.
  - `e2e::isolation::test_unique_discovery_file_b` — same as above with a different value; exists to prove two tests don't collide on the same file.
- [ ] Write a test helper function `fn e2e_discovery_file() -> (tempfile::NamedTempFile, std::path::PathBuf)` that creates a unique temp file and returns its path for use as `DEVS_DISCOVERY_FILE`.
- [ ] Create `tests/do_script/test_e2e_serialization.sh` that:
  - **Test 1**: Runs `./do test` and inspects the cargo test invocation log (or `set -x` output) to confirm E2E tests are invoked with `--test-threads 1`.
  - **Test 2**: Asserts that unit tests (in `src/`) are NOT run with `--test-threads 1` (they use the default thread count).
  - **Test 3**: Verifies that the E2E test filter matches tests with the `e2e::` prefix in their fully-qualified name.

## 2. Task Implementation
- [ ] **Define test location conventions** [2_TAS-REQ-015A]:
  - Unit tests: `#[test]` or `#[tokio::test]` inside `src/**/*.rs` files within any workspace crate.
  - E2E tests: test functions inside `tests/` directories. E2E test names MUST contain the `e2e::` prefix in their fully-qualified test name (achieved by placing them in a `mod e2e { ... }` module or naming the test file/directory accordingly).
- [ ] **Create `devs-test-util` crate** (or a `test_util` module in an existing crate) providing:
  - `pub fn unique_discovery_path() -> (tempfile::NamedTempFile, PathBuf)` — creates a temp file suitable for `DEVS_DISCOVERY_FILE`.
  - `pub fn set_discovery_env(path: &Path)` — sets `DEVS_DISCOVERY_FILE` for the current process.
- [ ] **Modify `./do test`** [2_TAS-REQ-015B]:
  - Run unit tests: `cargo test --workspace --lib --bins` (default parallelism).
  - Run E2E tests: `cargo test --workspace --test '*' -- --test-threads 1` (serial execution).
  - Both invocations contribute to the overall exit code (fail if either fails).
- [ ] **Modify `./do coverage`** to apply the same separation:
  - Unit coverage: `cargo llvm-cov --workspace --lib --bins ...`
  - E2E coverage: `cargo llvm-cov --workspace --test '*' -- --test-threads 1 ...`
- [ ] **Ensure each E2E test that starts a server** sets `DEVS_DISCOVERY_FILE` to the unique path from the helper before starting the server process, and cleans it up on drop.

## 3. Code Review
- [ ] Verify no E2E tests exist inside `src/` files — only unit tests belong there.
- [ ] Verify no unit tests in `src/` spawn a `devs` server or bind to network ports.
- [ ] Verify `--test-threads 1` is applied ONLY to E2E test runs, not unit test runs.
- [ ] Confirm the `devs-test-util` crate (or module) is listed as a `[dev-dependencies]` only, not a regular dependency.
- [ ] Verify `DEVS_DISCOVERY_FILE` paths are truly unique (use `tempfile` crate, not PID-based naming).

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm both unit and E2E test phases execute.
- [ ] Run `sh tests/do_script/test_e2e_serialization.sh` and confirm all tests pass.
- [ ] Run two E2E tests concurrently (intentionally, outside `./do`) and confirm they do NOT conflict due to `DEVS_DISCOVERY_FILE` isolation.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-015A` to the test convention documentation or test helper source.
- [ ] Add `// Covers: 2_TAS-REQ-015B` to the `./do test` E2E invocation section and the discovery file helper.

## 6. Automated Verification
- [ ] Run `./do test` and confirm exit code 0.
- [ ] Run `sh tests/do_script/test_e2e_serialization.sh && echo "VERIFIED"` — `VERIFIED` must appear.
- [ ] Grep the `./do` script for `--test-threads 1` and confirm it appears in the E2E test invocation path.
