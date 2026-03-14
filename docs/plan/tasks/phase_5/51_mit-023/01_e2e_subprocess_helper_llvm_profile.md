# Task: E2E Subprocess Test Helper with LLVM_PROFILE_FILE `%p` Suffix (Sub-Epic: 51_MIT-023)

## Covered Requirements
- [MIT-023], [AC-RISK-023-01]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters, ./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `tests/e2e/` (or a shared `devs-test-helpers` crate at `crates/devs-test-helpers/`), write an integration test `test_llvm_profile_file_pid_suffix` that:
  1. Calls the shared E2E subprocess-spawn helper (to be implemented in Task 2) which spawns the `devs` server binary.
  2. Asserts that after the subprocess exits, at least one `.profraw` file matching the glob `/tmp/devs-coverage-<PID>.profraw` exists in `/tmp/`.
  3. Asserts that no `.profraw` file named exactly `/tmp/devs-coverage.profraw` (without `%p` PID expansion) exists — the absence of this file confirms the `%p` pattern was used.
  4. Annotate the test: `// Covers: AC-RISK-023-01`.
- [ ] Write a unit test `test_spawn_command_sets_llvm_profile_file` inside `crates/devs-test-helpers/src/subprocess.rs`:
  1. Call `SpawnHelper::build_command("devs-server")` and inspect the returned `std::process::Command`.
  2. Assert that `LLVM_PROFILE_FILE` is set in `cmd.get_envs()` and that the value contains `%p` (e.g., `/tmp/devs-coverage-%p.profraw`).
  3. Assert the value does NOT contain a literal PID integer (the `%p` is the raw template, not yet expanded).
  4. Annotate: `// Covers: AC-RISK-023-01`.
- [ ] Write a unit test `test_pid_suffix_prevents_concurrent_conflict` that:
  1. Uses two `SpawnHelper` instances to build commands for two parallel subprocess invocations.
  2. Asserts that the `LLVM_PROFILE_FILE` values for both commands are identical templates (both `%p`-suffixed), meaning the OS will expand them to different per-PID files at runtime.
  3. Annotate: `// Covers: AC-RISK-023-01`.

## 2. Task Implementation

- [ ] Create a new library crate `crates/devs-test-helpers/` (if it does not already exist) with `Cargo.toml` declaring it as `[lib]` and adding it to the workspace `Cargo.toml` members list.
- [ ] Create `crates/devs-test-helpers/src/lib.rs` that re-exports `subprocess` and `fixtures` modules.
- [ ] Create `crates/devs-test-helpers/src/subprocess.rs` implementing `SpawnHelper`:
  ```rust
  // Covers: MIT-023, AC-RISK-023-01
  pub struct SpawnHelper {
      binary: &'static str,
      extra_env: Vec<(String, String)>,
  }

  impl SpawnHelper {
      pub fn new(binary: &'static str) -> Self { ... }

      /// Returns a `Command` pre-configured with LLVM_PROFILE_FILE=%p.
      pub fn build_command(&self) -> std::process::Command {
          let mut cmd = std::process::Command::new(self.binary);
          cmd.env(
              "LLVM_PROFILE_FILE",
              "/tmp/devs-coverage-%p.profraw",
          );
          for (k, v) in &self.extra_env {
              cmd.env(k, v);
          }
          cmd
      }

      /// Spawns the binary and returns a handle + the expected .profraw path template.
      pub fn spawn(&self) -> (std::process::Child, String) {
          let child = self.build_command().spawn().expect("failed to spawn binary");
          let template = format!("/tmp/devs-coverage-{}.profraw", child.id());
          (child, template)
      }
  }
  ```
- [ ] Ensure `SpawnHelper` is used in all existing CLI E2E tests that use `assert_cmd::Command::cargo_bin("devs")` — update them to also set `LLVM_PROFILE_FILE` via `.env("LLVM_PROFILE_FILE", "/tmp/devs-coverage-%p.profraw")` on their `assert_cmd::Command` objects.
- [ ] Add doc comments to all public items in `subprocess.rs` explaining the `%p` suffix requirement, referencing `RISK-023-BR-001`.
- [ ] Verify that `crate_type = ["lib"]` is set and the crate compiles with `cargo build -p devs-test-helpers`.

## 3. Code Review

- [ ] Confirm `LLVM_PROFILE_FILE` is set to exactly `/tmp/devs-coverage-%p.profraw` (literal `%p`, not a PID integer) in `SpawnHelper::build_command`.
- [ ] Confirm there is no location in the E2E test suite where a subprocess is spawned (via `std::process::Command`, `assert_cmd`, or `tokio::process::Command`) without `LLVM_PROFILE_FILE` being set — grep for `Command::new`, `cargo_bin`, `Command::cargo_bin` and verify each sets the env var.
- [ ] Confirm the `devs-test-helpers` crate is `cfg(test)` gated or listed only as a `[dev-dependency]` in consuming crates, so it does not appear in production builds.
- [ ] Confirm all new public items have `///` doc comments.

## 4. Run Automated Tests to Verify

- [ ] Run `cargo test -p devs-test-helpers -- --nocapture` and confirm all three new tests pass.
- [ ] Run `cargo test --test '*_e2e*' -- --test-threads 1 --nocapture` from the workspace root and confirm no test spawns a subprocess without `LLVM_PROFILE_FILE`.
- [ ] After running E2E tests, verify that `.profraw` files exist: `ls /tmp/devs-coverage-*.profraw` returns at least one file.
- [ ] Confirm all tests pass with exit code 0.

## 5. Update Documentation

- [ ] Add a section `## E2E Subprocess Coverage` to `crates/devs-test-helpers/README.md` (create if absent) documenting the `%p` suffix requirement and how to use `SpawnHelper`.
- [ ] Add a `// Covers: MIT-023, AC-RISK-023-01` annotation at the top of `crates/devs-test-helpers/src/subprocess.rs`.
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` status column for `MIT-023` if a status field exists.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `MIT-023` and `AC-RISK-023-01` appear in the `covered` set with no `stale_annotations`.
- [ ] Run `ls /tmp/devs-coverage-*.profraw | wc -l` after `./do coverage` and assert the count is ≥1.
- [ ] Run `cargo build -p devs-test-helpers 2>&1 | grep -c error` and assert output is `0`.
