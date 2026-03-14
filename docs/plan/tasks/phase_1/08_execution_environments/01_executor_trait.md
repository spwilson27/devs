# Task: StageExecutor Trait and ExecutionEnv Schema (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-040], [2_TAS-REQ-044C], [1_PRD-REQ-022]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor (owner), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create the `devs-executor` crate in the Cargo workspace (`crates/devs-executor/`). Add it to the workspace `Cargo.toml` members list. Add dependencies on `devs-core`, `serde`, `serde_json`, `toml`, `uuid`, `tokio`, `anyhow`, and `tracing`.
- [ ] In `crates/devs-executor/src/lib.rs`, write a test module `tests` with the following tests:
  - `test_execution_env_default_is_tempdir_shallow`: Construct `ExecutionEnv::default()` and assert it equals `ExecutionEnv::Tempdir { full_clone: false }`.
  - `test_execution_env_tempdir_serde_roundtrip`: Serialize `ExecutionEnv::Tempdir { full_clone: true }` to JSON and TOML, deserialize back, assert equality.
  - `test_execution_env_docker_serde_roundtrip`: Serialize `ExecutionEnv::Docker { image: "rust:latest".into(), full_clone: false, docker_host: Some("tcp://remote:2375".into()) }` to JSON and TOML, deserialize back, assert equality. Verify `docker_host` is `Some`.
  - `test_execution_env_docker_optional_host_none`: Serialize a `Docker` variant with `docker_host: None`, deserialize, assert `docker_host` is `None`.
  - `test_execution_env_remote_serde_roundtrip`: Serialize `ExecutionEnv::Remote { ssh_config: HashMap::from([("HostName".into(), "10.0.0.1".into()), ("User".into(), "deploy".into())]), full_clone: true, server_addr: Some("myhost:50051".into()) }` to JSON and TOML, deserialize back, assert equality.
  - `test_execution_env_remote_optional_addr_none`: `server_addr: None` round-trips correctly.
  - `test_execution_env_tempdir_full_clone_defaults_false`: Deserialize `{"Tempdir": {}}` from JSON and verify `full_clone` is `false`.
  - `test_execution_env_docker_full_clone_defaults_false`: Deserialize a Docker JSON with no `full_clone` field and verify it defaults to `false`.
  - `test_stage_executor_trait_is_object_safe`: Write a function `fn _assert_object_safe(_: &dyn StageExecutor) {}` that compiles. (If the trait uses `async fn`, use the `async_trait` macro or `-> Pin<Box<dyn Future>>` return to ensure object safety.)
  - `test_execution_handle_stores_working_dir`: Create an `ExecutionHandle` with a known `PathBuf`, assert `working_dir()` returns it.
  - `test_execution_handle_stores_handle_id`: Create an `ExecutionHandle` with a known `Uuid`, assert `handle_id()` returns it.

## 2. Task Implementation
- [ ] Define the `ExecutionEnv` enum in `crates/devs-executor/src/types.rs` matching the schema from [2_TAS-REQ-044C] exactly:
  ```rust
  #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
  #[serde(tag = "type", rename_all = "snake_case")]
  pub enum ExecutionEnv {
      Tempdir {
          #[serde(default)]
          full_clone: bool,
      },
      Docker {
          image: String,
          #[serde(default)]
          full_clone: bool,
          docker_host: Option<String>,
      },
      Remote {
          ssh_config: HashMap<String, String>,
          #[serde(default)]
          full_clone: bool,
          server_addr: Option<String>,
      },
  }
  ```
- [ ] Implement `Default for ExecutionEnv` returning `Tempdir { full_clone: false }`.
- [ ] Define the `ExecutionHandle` struct in the same module:
  ```rust
  pub struct ExecutionHandle {
      working_dir: PathBuf,
      handle_id: Uuid,
      state: Box<dyn Any + Send + Sync>,
  }
  ```
  Provide accessor methods `working_dir() -> &Path`, `handle_id() -> Uuid`, and `downcast_state<T: 'static>() -> Option<&T>`.
- [ ] Define `StageContext` struct containing at minimum: `run_id: Uuid`, `stage_name: String`, `repo_url: String`, `execution_env: ExecutionEnv`, `env_vars: HashMap<String, String>`.
- [ ] Define `ArtifactMode` enum with variants `AgentDriven` and `AutoCollect`.
- [ ] Define the `StageExecutor` trait in `crates/devs-executor/src/lib.rs` using `#[async_trait]`:
  ```rust
  #[async_trait]
  pub trait StageExecutor: Send + Sync {
      async fn prepare(&self, ctx: &StageContext) -> Result<ExecutionHandle>;
      async fn collect_artifacts(&self, handle: &ExecutionHandle, mode: ArtifactMode) -> Result<()>;
      async fn cleanup(&self, handle: ExecutionHandle) -> Result<()>;
  }
  ```
  Note: `cleanup` takes ownership of `ExecutionHandle` to enforce single-use.
- [ ] Re-export all public types from `crates/devs-executor/src/lib.rs`.
- [ ] Add doc comments to all public items (trait, enum variants, struct fields).

## 3. Code Review
- [ ] Verify `ExecutionEnv` enum variants and field names exactly match [2_TAS-REQ-044C] schema.
- [ ] Verify `StageExecutor` trait has exactly the three methods from [2_TAS-REQ-040]: `prepare`, `collect_artifacts`, `cleanup`.
- [ ] Verify the trait is object-safe (compiles as `dyn StageExecutor`).
- [ ] Verify `Send + Sync` bounds on trait and `ExecutionHandle`.
- [ ] Verify the default `ExecutionEnv` is `Tempdir { full_clone: false }` per [2_TAS-REQ-044C] last paragraph.
- [ ] Verify no wire types from `devs-proto` leak into public API (per shared component manifest constraint 2_TAS-REQ-001G).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and verify zero warnings.
- [ ] Run `cargo doc -p devs-executor --no-deps` and verify documentation builds cleanly.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-040` annotation above the `StageExecutor` trait definition.
- [ ] Add `// Covers: 2_TAS-REQ-044C` annotation above the `ExecutionEnv` enum definition.
- [ ] Add `// Covers: 1_PRD-REQ-022` annotation above the `ExecutionEnv` enum (three execution targets).

## 6. Automated Verification
- [ ] Run `./do test` and confirm `devs-executor` tests appear in output and pass.
- [ ] Run `./do lint` and confirm no lint failures for `devs-executor`.
