# Task: Define ExecutionHandle and ExecutionEnvKind Types (Sub-Epic: 049_Detailed Domain Specifications (Part 14))

## Covered Requirements
- [2_TAS-REQ-120]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor (create types in)]

## 1. Initial Test Written
- [ ] In `crates/devs-executor/src/types_tests.rs`, write `test_execution_env_kind_has_three_variants` — assert that `ExecutionEnvKind::Tempdir`, `ExecutionEnvKind::Docker`, and `ExecutionEnvKind::Remote` all exist and are distinct (e.g., pattern match exhaustively).
- [ ] Write `test_execution_handle_all_fields_accessible` — construct an `ExecutionHandle` with `env_kind: Tempdir`, a `working_dir`, `run_id`, `stage_name`, `attempt`, `docker_container_id: None`, `ssh_session: None`. Assert all fields hold expected values.
- [ ] Write `test_execution_handle_docker_has_container_id` — construct with `env_kind: Docker`, `docker_container_id: Some("abc123".into())`, `ssh_session: None`. Assert `docker_container_id` is `Some`.
- [ ] Write `test_execution_handle_remote_has_ssh_session` — construct with `env_kind: Remote`, `docker_container_id: None`, `ssh_session: Some(arc_session)`. Assert `ssh_session` is `Some`. (Use a mock or `unsafe` placeholder if `ssh2::Session` cannot be constructed in tests — document the approach.)
- [ ] Write `test_execution_handle_tempdir_has_neither_optional` — construct with `env_kind: Tempdir`. Assert both `docker_container_id` and `ssh_session` are `None`.

## 2. Task Implementation
- [ ] Create `crates/devs-executor/src/types.rs` and define:
    ```rust
    use std::path::PathBuf;
    use std::sync::Arc;
    use uuid::Uuid;

    /// The kind of execution environment for a stage.
    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum ExecutionEnvKind {
        Tempdir,
        Docker,
        Remote,
    }

    /// Carries all state needed for artifact collection and cleanup
    /// after a stage completes in its execution environment.
    pub struct ExecutionHandle {
        pub env_kind:             ExecutionEnvKind,
        pub working_dir:          PathBuf,
        pub run_id:               Uuid,
        pub stage_name:           String,
        pub attempt:              u32,
        pub docker_container_id:  Option<String>,
        pub ssh_session:          Option<Arc<ssh2::Session>>,
    }
    ```
- [ ] Add `ssh2` and `uuid` to `crates/devs-executor/Cargo.toml` dependencies.
- [ ] Export `ExecutionHandle` and `ExecutionEnvKind` from the crate's public API (`lib.rs`).
- [ ] Add a `#[cfg(test)]` module or separate test file with all tests from step 1.

## 3. Code Review
- [ ] Verify field types match the spec exactly: `ExecutionEnvKind`, `PathBuf`, `Uuid`, `String`, `u32`, `Option<String>`, `Option<Arc<ssh2::Session>>`.
- [ ] Confirm all fields on `ExecutionHandle` are `pub`.
- [ ] Confirm `ExecutionEnvKind` derives `Debug, Clone, Copy, PartialEq, Eq`.
- [ ] Verify no wire types from `devs-proto` are used in these type definitions.
- [ ] Confirm `docker_container_id` is semantically only meaningful for `Docker` and `ssh_session` for `Remote` — document this invariant in doc comments even though it is not enforced at the type level.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor -- types` and confirm all 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `ExecutionEnvKind` explaining the three execution targets (tempdir, Docker, remote SSH).
- [ ] Add doc comments to `ExecutionHandle` explaining that `docker_container_id` is `Some` only for `Docker` and `ssh_session` is `Some` only for `Remote`.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings for `devs-executor`.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and confirm clean output.
