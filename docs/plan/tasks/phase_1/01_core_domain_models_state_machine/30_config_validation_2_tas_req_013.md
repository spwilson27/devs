# Task: Implement Configuration Validation Framework (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [2_TAS-REQ-013], [2_TAS-REQ-013A]

## Dependencies
- depends_on: ["06_validation_error_collection.md"]
- shared_components: [devs-core (Owner), devs-config (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_server_config_validation_collects_all_errors` that constructs a `ServerConfig` with multiple invalid fields (invalid listen address, invalid MCP port, missing default pool) and asserts all errors are returned in a single validation pass
- [ ] Write test `test_pool_config_validation_capability_tags` that validates pool configurations with duplicate capability tags are rejected
- [ ] Write test `test_pool_config_validation_concurrency_limit` that validates `max_concurrent` must be > 0 and <= pool size
- [ ] Write test `test_project_entry_validation_repo_path_exists` that validates project repo paths must exist or be valid git repository paths
- [ ] Write test `test_workflow_definition_validation_stage_names_unique` that validates stage names within a workflow are unique
- [ ] Write test `test_workflow_definition_validation_dependency_graph_acyclic` that validates the stage dependency graph is a DAG (no cycles)
- [ ] Write test `test_workflow_definition_validation_fan_out_merge_handler` that validates fan-out stages have merge handlers when required
- [ ] Write test `test_config_display_redacts_credentials` that asserts `Display` impl for `ServerConfig` wraps credential fields in `[REDACTED]`

## 2. Task Implementation
- [ ] Define `ServerConfigValidator` struct in `crates/devs-core/src/config/validation.rs` with `validate(config: &ServerConfig) -> Result<(), Vec<ConfigValidationError>>`
- [ ] Define `ConfigValidationError` enum with variants:
  - `InvalidListenAddress { value: String, reason: String }`
  - `InvalidMcpPort { value: u16, reason: String }`
  - `MissingDefaultPool { pool_name: String }`
  - `DuplicatePoolName { name: String }`
  - `InvalidSchedulingPolicy { value: String }`
  - `WebhookTargetInvalid { url: String, reason: String }`
- [ ] Implement `PoolConfigValidator` with `validate(pool: &PoolConfig) -> Result<(), Vec<ConfigValidationError>>` checking:
  - `max_concurrent > 0`
  - `max_concurrent <= agent_count` (warning, not error)
  - No duplicate capability tags
  - At least one agent configured
  - Fallback agents marked correctly
- [ ] Implement `ProjectEntryValidator` with `validate(entry: &ProjectEntry) -> Result<(), ConfigValidationError>` checking:
  - Repo path exists or is valid git path
  - Priority/weight values in valid range
  - Checkpoint branch name valid (matches `^[a-zA-Z0-9_-]+$`)
  - Workflow search paths exist
- [ ] Implement `WorkflowDefinitionValidator` with `validate(def: &WorkflowDefinition) -> Result<(), Vec<ConfigValidationError>>` checking:
  - All stage names unique
  - All dependency references exist
  - Dependency graph is acyclic (use DFS cycle detection)
  - Fan-out stages have valid merge configuration
  - Template variables reference valid stage outputs
- [ ] Implement cycle detection algorithm: DFS with color marking (White/Gray/Black)
- [ ] Ensure all validators use the `ValidationCollector` pattern from task 06 to collect all errors before returning
- [ ] Add `pub mod validation;` to `crates/devs-core/src/config/mod.rs`

## 3. Code Review
- [ ] Verify validation collects ALL errors in a single pass (no short-circuit on first error)
- [ ] Verify cycle detection algorithm is correct (test with known cyclic and acyclic graphs)
- [ ] Verify credential fields are redacted in Display impls
- [ ] Verify error messages are actionable and include the invalid value

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core config::validation` and confirm all validation tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/config/validation.rs` explaining the validation framework and collect-all-errors pattern
- [ ] Add doc comments to each validator explaining the specific checks performed
- [ ] Document `ConfigValidationError` variants with examples of what triggers each

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify cycle detection test includes a graph with 10+ nodes and a known cycle
