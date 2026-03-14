# Task: Implement Retention Policy Config Types and Run Deletion Primitive (Sub-Epic: 07_Logging & Retention)

## Covered Requirements
- [1_PRD-REQ-032]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config, devs-checkpoint]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/retention.rs` (new file), write tests annotated with `// Covers: 1_PRD-REQ-032`:
    - [ ] `test_retention_policy_max_age_only` — construct `RetentionPolicy { max_age: Some(Duration::from_secs(7 * 86400)), max_size_bytes: None }`, assert `has_age_limit()` is true, `has_size_limit()` is false.
    - [ ] `test_retention_policy_max_size_only` — construct with `max_age: None, max_size_bytes: Some(500 * 1024 * 1024)`, assert `has_size_limit()` is true, `has_age_limit()` is false.
    - [ ] `test_retention_policy_both_limits` — construct with both set, assert both return true.
    - [ ] `test_retention_policy_neither_limit` — construct with both `None`, assert both return false (retention disabled).
    - [ ] `test_retention_policy_default` — verify `Default::default()` produces both limits as `None`.
- [ ] In `crates/devs-config/src/retention.rs` (new file), write tests annotated with `// Covers: 1_PRD-REQ-032`:
    - [ ] `test_parse_retention_from_toml_max_age` — parse TOML fragment `[retention]\nmax_age_days = 30` into `RetentionPolicy` with `max_age` = 30 days.
    - [ ] `test_parse_retention_from_toml_max_size` — parse `[retention]\nmax_size_mb = 500` into `RetentionPolicy` with `max_size_bytes` = 500 * 1024 * 1024.
    - [ ] `test_parse_retention_from_toml_both` — parse TOML with both fields.
    - [ ] `test_parse_retention_absent` — verify absent `[retention]` section yields `RetentionPolicy::default()`.
- [ ] In `crates/devs-checkpoint/src/store.rs`, write tests annotated with `// Covers: 1_PRD-REQ-032`:
    - [ ] `test_delete_run_removes_directories` — create a temp git repo with `.devs/runs/<run-id>/checkpoint.json` and `.devs/logs/<run-id>/output.log`, call `delete_run(run_id)`, assert both directories are removed from disk.
    - [ ] `test_delete_run_commits_deletion` — after `delete_run`, verify a git commit exists on the checkpoint branch with message `devs: delete run <run-id>`.
    - [ ] `test_delete_run_idempotent` — call `delete_run` for a non-existent run-id, assert `Ok(())` (no error).

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/retention.rs`:
    - [ ] Define `RetentionPolicy` struct with fields `max_age: Option<std::time::Duration>` and `max_size_bytes: Option<u64>`.
    - [ ] Derive `Debug, Clone, Default, PartialEq, Eq`.
    - [ ] Implement `has_age_limit(&self) -> bool` and `has_size_limit(&self) -> bool`.
    - [ ] Add doc comments referencing [1_PRD-REQ-032].
    - [ ] Re-export from `crates/devs-core/src/lib.rs`.
- [ ] Create `crates/devs-config/src/retention.rs`:
    - [ ] Define a `RetentionConfigRaw` serde struct with `max_age_days: Option<u32>` and `max_size_mb: Option<u64>`.
    - [ ] Implement `From<RetentionConfigRaw> for RetentionPolicy` performing unit conversions (days → `Duration`, MB → bytes).
    - [ ] Integrate into the existing `ServerConfig` parsing by adding an optional `retention` field.
- [ ] Add `delete_run(&self, run_id: &RunId) -> Result<()>` to the `CheckpointStore` trait and git-backed implementation:
    - [ ] Locate `.devs/runs/<run-id>` and `.devs/logs/<run-id>`.
    - [ ] Recursively delete both directories if they exist.
    - [ ] Use `git2` to stage the deletions and create a commit with message `devs: delete run <run-id>` using author `devs <devs@localhost>`.
    - [ ] If directories do not exist, return `Ok(())`.
    - [ ] Run git operations via `spawn_blocking`.

## 3. Code Review
- [ ] Verify `RetentionPolicy` lives in `devs-core` (pure domain type, no runtime deps).
- [ ] Verify `RetentionConfigRaw` lives in `devs-config` (parsing layer).
- [ ] Verify `delete_run` uses `git2` exclusively — no shell `git` calls.
- [ ] Verify doc comments are present on all public items.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- retention`.
- [ ] Run `cargo test -p devs-config -- retention`.
- [ ] Run `cargo test -p devs-checkpoint -- delete_run`.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-032` traceability annotations to all new test functions.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` maps [1_PRD-REQ-032] to the new tests.
