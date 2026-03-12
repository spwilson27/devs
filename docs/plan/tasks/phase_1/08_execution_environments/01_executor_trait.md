# Task: StageExecutor Trait and ExecutionEnv Schema (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-040], [2_TAS-REQ-044C], [1_PRD-REQ-022]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create a new crate `devs-executor` in the workspace.
- [ ] Write unit tests for `ExecutionEnv` serialization/deserialization using `serde_json` and `toml`. Verify that:
    - `Tempdir { full_clone: false }` is the default.
    - All variants (`Tempdir`, `Docker`, `Remote`) can be correctly parsed from a `toml::Value`.
- [ ] Write a mock implementation of the `StageExecutor` trait and verify that it satisfies the `Send + Sync` bounds.

## 2. Task Implementation
- [ ] Define the `StageExecutor` trait in `devs-executor/src/lib.rs`:
    ```rust
    pub trait StageExecutor: Send + Sync {
        async fn prepare(&self, ctx: &StageContext) -> Result<ExecutionHandle>;
        async fn collect_artifacts(&self, handle: &ExecutionHandle, policy: ArtifactCollection) -> Result<()>;
        async fn cleanup(&self, handle: &ExecutionHandle) -> Result<()>;
    }
    ```
- [ ] Define the `ExecutionHandle` struct. It should contain at least:
    - `working_dir`: PathBuf
    - `handle_id`: Uuid
    - `any_state`: Box<dyn Any + Send + Sync> (to allow implementations to store their own state, e.g. container IDs or SSH sessions)
- [ ] Define the `ExecutionEnv` enum exactly as specified in `2_TAS-REQ-044C`:
    ```rust
    #[derive(Debug, Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum ExecutionEnv {
        Tempdir { 
            #[serde(default)]
            full_clone: bool 
        },
        Docker {
            image:       String,
            #[serde(default)]
            full_clone:  bool,
            docker_host: Option<String>,
        },
        Remote {
            ssh_config:  HashMap<String, String>,
            #[serde(default)]
            full_clone:  bool,
            server_addr: Option<String>,
        },
    }
    ```
- [ ] Add a `Default` implementation for `ExecutionEnv` that returns `Tempdir { full_clone: false }`.

## 3. Code Review
- [ ] Verify `ExecutionEnv` matches the schema in `2_TAS-REQ-044C`.
- [ ] Ensure `StageExecutor` trait methods are `async` and return `Result`.
- [ ] Verify `Send + Sync` bounds on the trait and handle.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` to verify schema parsing and trait bounds.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the creation of `devs-executor` and the definition of the `StageExecutor` trait.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure the new crate follows project standards.
