# Task: AgentAdapter Trait and Environment Injection (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [2_TAS-REQ-034], [1_PRD-REQ-014], [2_TAS-REQ-037]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/src/lib.rs` and a test module.
- [ ] Write a unit test that defines a mock implementation of `AgentAdapter`.
- [ ] Test `detect_rate_limit` with various exit codes and stderr strings for a mock tool.
- [ ] Test a helper function (to be implemented) that merges environment variables and ensures `DEVS_MCP_ADDR` is injected while server-internal variables like `DEVS_LISTEN` are stripped.
- [ ] Verify that the test fails (crate doesn't exist yet).

## 2. Task Implementation
- [ ] Initialize the `devs-adapters` crate in the workspace.
- [ ] Define the `AgentAdapter` trait in `src/lib.rs`:
    ```rust
    pub trait AgentAdapter {
        fn tool(&self) -> ToolKind;
        fn build_command(&self, ctx: &StageContext) -> Result<AdapterCommand, AdapterError>;
        fn detect_rate_limit(&self, exit_code: i32, stderr: &str) -> bool;
    }
    ```
- [ ] Define `AdapterCommand` struct:
    ```rust
    pub struct AdapterCommand {
        pub program: String,
        pub args: Vec<String>,
        pub env: HashMap<String, String>,
        pub use_pty: bool,
    }
    ```
- [ ] Implement the environment injection logic in a shared helper. Ensure `DEVS_MCP_ADDR` is present in the final environment map.
- [ ] Implement the stripping of internal variables (`DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`) from the inherited environment before merging with stage-specific ones.
- [ ] Ensure all types use `devs-core` domain types where appropriate (e.g., `ToolKind`, `StageContext`).

## 3. Code Review
- [ ] Verify the `AgentAdapter` trait is clean and doesn't contain platform-specific logic (that should be in the runner).
- [ ] Ensure `detect_rate_limit` is designed for passive detection (no network calls).
- [ ] Check that `AdapterCommand` is serializable if needed for logging or debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the `AgentAdapter` trait and its methods.
- [ ] Update `devs-adapters/README.md` with an overview of the trait.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments are present and formatting is correct.
- [ ] Run `./do test` to verify 100% requirement-to-test traceability for the covered IDs.
