# Task: Define Execution Handle and Environment Types (Sub-Epic: 049_Detailed Domain Specifications (Part 14))

## Covered Requirements
- [2_TAS-REQ-120]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create `crates/devs-executor/src/types.rs` (if not exists) and write unit tests for `ExecutionHandle` and `ExecutionEnvKind` serialization.
- [ ] Write a test verifying that `ExecutionHandle` contains all required fields: `env_kind`, `working_dir`, `run_id`, `stage_name`, `attempt`, `docker_container_id`, `ssh_session`.

## 2. Task Implementation
- [ ] Define the `ExecutionEnvKind` enum in `crates/devs-executor/src/types.rs`:
    ```rust
    pub enum ExecutionEnvKind { Tempdir, Docker, Remote }
    ```
- [ ] Define the `ExecutionHandle` struct in `crates/devs-executor/src/types.rs` with the following fields:
    ```rust
    pub struct ExecutionHandle {
        pub env_kind:    ExecutionEnvKind,
        pub working_dir: PathBuf,
        pub run_id:      Uuid,
        pub stage_name:  String,
        pub attempt:       u32,
        pub docker_container_id: Option<String>,
        pub ssh_session:         Option<Arc<ssh2::Session>>,
    }
    ```
- [ ] Ensure that `docker_container_id` is only `Some(_)` for `Docker` and `ssh_session` is only `Some(_)` for `Remote`.

## 3. Code Review
- [ ] Verify that `ExecutionHandle` uses `Uuid`, `PathBuf`, and `Arc<ssh2::Session>` as specified.
- [ ] Ensure all fields are public.
- [ ] Verify that the `ExecutionEnvKind` enum variants match the requirements exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` to ensure the types are correctly defined.

## 5. Update Documentation
- [ ] Document the `ExecutionHandle` struct and `ExecutionEnvKind` enum in the module-level doc comments.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments are present and formatting is correct.
- [ ] Run `cargo clippy -p devs-executor` to ensure idiomatic Rust.
