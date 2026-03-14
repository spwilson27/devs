# Task: DEVS_DISCOVERY_FILE Unique Temp Path per E2E Test (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010E]

## Dependencies
- depends_on: []
- shared_components: ["Server Discovery Protocol", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a Rust integration test in the E2E test infrastructure (e.g., `tests/e2e/discovery_isolation_test.rs`) that spawns two test server instances concurrently, each with a unique `DEVS_DISCOVERY_FILE` env var, and asserts:
  1. Each server writes its address to its own unique discovery file path.
  2. The two file paths are different.
  3. Each file contains the correct server address for its respective server instance.
  4. No file conflicts or overwrites occur.
- [ ] Write a unit test for the discovery file path resolution logic that asserts: when `DEVS_DISCOVERY_FILE` is set, that value is used; when unset, the default `~/.config/devs/server.addr` is used.
- [ ] Write a test that verifies the E2E test harness helper function (e.g., `create_test_discovery_path()`) returns a unique path each time it is called, using a temporary directory and a unique identifier (UUID or PID+counter).

## 2. Task Implementation
- [ ] Create an E2E test utility function (e.g., in `tests/common/mod.rs` or `tests/e2e/helpers.rs`) named `create_test_discovery_path() -> PathBuf` that:
  1. Creates a path inside `std::env::temp_dir()` with a unique name (e.g., `devs_test_<uuid>.addr`).
  2. Returns the path without creating the file (the server will create it).
- [ ] In the E2E test harness's server spawn helper, automatically set `DEVS_DISCOVERY_FILE` to the value returned by `create_test_discovery_path()` before spawning each test server process. Store the path so it can be cleaned up after the test.
- [ ] In the server's discovery file resolution code (likely in `devs-core` or wherever the discovery path is determined), ensure `DEVS_DISCOVERY_FILE` env var takes precedence over the default path. The logic should be: `env::var("DEVS_DISCOVERY_FILE").ok().map(PathBuf::from).unwrap_or_else(|| default_discovery_path())`.
- [ ] In `.gitlab-ci.yml` or in the `./do test` command, ensure no global `DEVS_DISCOVERY_FILE` is set — each test must set its own. Add a CI variable comment documenting that `DEVS_DISCOVERY_FILE` is intentionally NOT set globally.
- [ ] Add cleanup logic to the E2E test teardown that removes the temporary discovery file after each test completes.

## 3. Code Review
- [ ] Verify the path generation uses sufficient randomness to prevent collisions (UUID or equivalent).
- [ ] Verify the env var override is checked at the right point in the code path — it must be read at server startup, not cached statically.
- [ ] Verify cleanup happens even if the test panics (use `Drop` impl on a test guard struct or `scopeguard`).
- [ ] Verify no test hardcodes a discovery file path — all tests must use the helper.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test discovery_isolation` to verify the E2E isolation test passes.
- [ ] Run `cargo test` with `--jobs 4` or higher to verify no discovery file conflicts under parallel execution.

## 5. Update Documentation
- [ ] Add a doc comment on `create_test_discovery_path()` explaining its purpose and that it must be used by all E2E tests that spawn a server.

## 6. Automated Verification
- [ ] Run `cargo test -- --test-threads=4 discovery` and verify all tests pass with no file conflict errors.
- [ ] Run `ls /tmp/devs_test_*.addr 2>/dev/null | wc -l` after tests to verify cleanup removed temporary files (count should be 0).
