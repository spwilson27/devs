# Task: Rust Builder API for Workflow Definition (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-006]: `devs` supports two workflow authoring formats — this task covers the typed Rust Builder API (compiled against the `devs` library crate, with conditional branching expressed as Rust closures).

## Dependencies
- depends_on: ["01_dag_data_structure_and_cycle_detection.md"]
- shared_components: [devs-core (consumer — `BoundedString`, domain types), devs-config (consumer — `WorkflowDefinition` struct that the builder produces)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/src/builder.rs` and `crates/devs-scheduler/tests/builder_tests.rs`.
- [ ] Write unit test `test_builder_minimal_workflow`: `Workflow::new("test-wf").stage("step1", StageConfig::new("pool1").prompt("do something")).build()` returns `Ok(WorkflowDefinition)` with one stage named "step1".
- [ ] Write unit test `test_builder_linear_chain`: build workflow with stages A→B→C using `.depends_on(["A"])` etc. Assert the resulting `WorkflowDefinition` has correct `depends_on` lists for each stage.
- [ ] Write unit test `test_builder_parallel_diamond`: A→{B,C}→D. Assert resulting definition captures the diamond dependency structure correctly.
- [ ] Write unit test `test_builder_with_branch_closure`: use `.branch(|ctx| if ctx.exit_code() == 0 { "next" } else { "retry" })` on a stage. Assert the `WorkflowDefinition` stores the branch handler (as a `Box<dyn Fn>` or equivalent).
- [ ] Write unit test `test_builder_with_prompt_file`: `.prompt_file("path/to/prompt.md")` sets `prompt_file` field instead of inline prompt. Assert the config reflects this.
- [ ] Write unit test `test_builder_with_system_prompt`: `.system_prompt("You are a reviewer")` sets the system prompt field.
- [ ] Write unit test `test_builder_with_env_vars`: `.env("KEY", "value")` adds environment variable to stage config.
- [ ] Write unit test `test_builder_with_inputs`: `.input("feature_name", InputType::String)` declares a workflow input parameter. Assert it appears in `WorkflowDefinition.inputs`.
- [ ] Write unit test `test_builder_empty_name_rejected`: `Workflow::new("")` returns `Err` with validation error.
- [ ] Write unit test `test_builder_duplicate_stage_name_rejected`: adding two stages with the same name returns `Err`.
- [ ] Write unit test `test_builder_unknown_depends_on_rejected`: stage B depends_on "nonexistent" — `build()` returns `Err`.
- [ ] Write unit test `test_builder_cycle_rejected`: A depends_on B, B depends_on A — `build()` returns `Err(CycleDetected)`.
- [ ] Write unit test `test_builder_produces_valid_dag`: build a complex workflow, call `DagGraph::new()` on the resulting definition's stages and assert topological sort succeeds.

## 2. Task Implementation
- [ ] Define `Workflow` builder struct in `crates/devs-scheduler/src/builder.rs` with fields:
  - `name: String`
  - `stages: Vec<(String, StageConfig)>` — ordered list of stage definitions
  - `inputs: Vec<InputDeclaration>` — declared workflow input parameters
- [ ] Define `StageConfig` struct with fields: `pool: String`, `prompt: Option<String>`, `prompt_file: Option<PathBuf>`, `system_prompt: Option<String>`, `env_vars: HashMap<String, String>`, `depends_on: Vec<String>`, `branch: Option<Box<dyn Fn(&BranchContext) -> String + Send + Sync>>`, `completion: CompletionSignal`.
- [ ] Implement `Workflow::new(name: &str) -> Self` — validates name is non-empty.
- [ ] Implement `Workflow::stage(mut self, name: &str, config: StageConfig) -> Self` — appends stage to list.
- [ ] Implement `Workflow::input(mut self, name: &str, input_type: InputType) -> Self`.
- [ ] Implement `Workflow::build(self) -> Result<WorkflowDefinition, BuilderError>`:
  - Validate no duplicate stage names.
  - Validate all `depends_on` references exist.
  - Construct `DagGraph` and run `topological_sort()` to verify acyclicity.
  - Return `WorkflowDefinition` on success.
- [ ] Implement fluent builder methods on `StageConfig`: `new(pool)`, `prompt(s)`, `prompt_file(p)`, `system_prompt(s)`, `env(k, v)`, `depends_on(deps)`, `branch(f)`, `completion(c)`.
- [ ] Define `BranchContext` struct with methods: `exit_code() -> i32`, `output() -> &serde_json::Value`, `stage_name() -> &str`.
- [ ] Define `InputType` enum: `String`, `Path`, `Integer`, `Boolean`.
- [ ] Define `InputDeclaration` struct: `name: String`, `input_type: InputType`, `required: bool`, `default: Option<serde_json::Value>`.
- [ ] Define `BuilderError` enum: `EmptyName`, `DuplicateStage { name }`, `UnknownDependency { stage, dependency }`, `CycleDetected { cycle }`.
- [ ] Add `// Covers: 1_PRD-REQ-006` annotation to all test functions.

## 3. Code Review
- [ ] Verify `StageConfig` branch closure is `Send + Sync` (required for multi-threaded dispatch).
- [ ] Verify builder validates at `build()` time, not at `stage()` time (accumulate-then-validate pattern).
- [ ] Verify `WorkflowDefinition` produced by the builder is the same struct consumed by the scheduler (no separate builder-only definition type).
- [ ] Verify no proto/wire types in the builder API — only domain types from `devs-core`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- builder` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments with examples to `Workflow`, `StageConfig`, and `Workflow::build`.
- [ ] Include a builder usage example in the module-level doc comment matching the project description's sketch.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- builder --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- builder` and verify ≥ 90% line coverage for `builder.rs`.
