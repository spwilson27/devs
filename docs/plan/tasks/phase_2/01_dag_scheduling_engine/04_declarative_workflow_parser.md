# Task: Declarative TOML/YAML Workflow Parser (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-006]: `devs` supports two workflow authoring formats — this task covers the Declarative Config format (TOML or YAML, loaded at runtime without Rust compilation, with branching via built-in predicates or named Rust handlers registered at startup).

## Dependencies
- depends_on: ["01_dag_data_structure_and_cycle_detection.md", "03_rust_builder_api.md"]
- shared_components: [devs-config (consumer — `WorkflowDefinition` struct that the parser produces, `validate()` for config validation), devs-core (consumer — domain types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/src/declarative.rs` and `crates/devs-scheduler/tests/declarative_tests.rs`.
- [ ] Write unit test `test_parse_minimal_toml`: parse a TOML string with `[workflow] name = "test"` and one `[[stage]]` block. Assert it produces a valid `WorkflowDefinition`.
- [ ] Write unit test `test_parse_linear_chain_toml`: parse TOML with stages A, B (depends_on = ["A"]), C (depends_on = ["B"]). Assert the `depends_on` lists are correctly populated.
- [ ] Write unit test `test_parse_parallel_stages_toml`: stages B and C both depend_on A. Assert both are present in definition with correct deps.
- [ ] Write unit test `test_parse_with_built_in_predicate`: stage with `[stage.branch] predicate = "exit_code"` and `routes = { "0" = "next", "_" = "retry" }`. Assert the parsed definition contains a `BuiltInPredicate::ExitCode` branch with correct routing table.
- [ ] Write unit test `test_parse_with_named_handler`: stage with `[stage.branch] handler = "review_router"`. Assert parsed branch is `BranchConfig::NamedHandler("review_router")`.
- [ ] Write unit test `test_parse_with_inputs`: TOML declares `[[input]] name = "feature" type = "string" required = true`. Assert `WorkflowDefinition.inputs` contains the declaration.
- [ ] Write unit test `test_parse_with_fan_out_count`: stage with `fan_out = 3`. Assert parsed stage config has `fan_out: Some(FanOut::Count(3))`.
- [ ] Write unit test `test_parse_with_fan_out_list`: stage with `fan_out_inputs = [...]`. Assert parsed correctly.
- [ ] Write unit test `test_parse_yaml_equivalent`: same workflow as `test_parse_minimal_toml` but in YAML format. Assert identical `WorkflowDefinition` output.
- [ ] Write unit test `test_parse_unknown_field_rejected`: TOML with an unknown key at stage level. Assert parse returns an error (strict deserialization, deny unknown fields).
- [ ] Write unit test `test_parse_missing_name_rejected`: TOML without `[workflow] name`. Assert error.
- [ ] Write unit test `test_parse_empty_stages_rejected`: TOML with no `[[stage]]` blocks. Assert error referencing empty workflow.
- [ ] Write unit test `test_parse_cycle_detected_at_load`: TOML with A→B→A cycle. Assert parse returns cycle detection error.
- [ ] Write unit test `test_parse_unknown_dependency_rejected`: stage depends_on a nonexistent stage name.
- [ ] Write unit test `test_parse_produces_same_definition_as_builder`: construct identical workflows via builder and TOML, compare the resulting `WorkflowDefinition` structs (excluding branch closures, which can't be compared).
- [ ] Write unit test `test_built_in_predicates_list`: verify all supported built-in predicates (`exit_code`, `stdout_contains`, `output_field`) parse correctly.

## 2. Task Implementation
- [ ] Define `parse_toml(input: &str) -> Result<WorkflowDefinition, ParseError>` in `crates/devs-scheduler/src/declarative.rs`.
- [ ] Define `parse_yaml(input: &str) -> Result<WorkflowDefinition, ParseError>` with equivalent logic.
- [ ] Define intermediate serde structs for deserialization (with `#[serde(deny_unknown_fields)]`):
  - `TomlWorkflow`: `name: String`, `stages: Vec<TomlStage>`, `inputs: Option<Vec<TomlInput>>`, `timeout: Option<Duration>`.
  - `TomlStage`: `name: String`, `pool: String`, `prompt: Option<String>`, `prompt_file: Option<String>`, `system_prompt: Option<String>`, `depends_on: Option<Vec<String>>`, `completion: Option<String>`, `branch: Option<TomlBranch>`, `fan_out: Option<u32>`, `fan_out_inputs: Option<Vec<serde_json::Value>>`, `env: Option<HashMap<String, String>>`, `retry: Option<TomlRetry>`, `timeout: Option<String>`.
  - `TomlBranch`: `predicate: Option<String>`, `routes: Option<HashMap<String, String>>`, `handler: Option<String>`.
- [ ] Implement conversion from serde structs to `WorkflowDefinition`:
  - Map `TomlStage` to `StageConfig` (same struct used by builder).
  - For `predicate` branches: parse into `BuiltInPredicate` enum and routing table.
  - For `handler` branches: store as `BranchConfig::NamedHandler(String)`.
- [ ] Define `BuiltInPredicate` enum: `ExitCode`, `StdoutContains { pattern: String }`, `OutputField { field: String, value: serde_json::Value }`.
- [ ] Define `BranchConfig` enum: `Closure(Box<dyn Fn(&BranchContext) -> String + Send + Sync>)`, `BuiltInPredicate { predicate: BuiltInPredicate, routes: HashMap<String, String> }`, `NamedHandler(String)`.
- [ ] After parsing, run `DagGraph::new()` + `topological_sort()` to validate acyclicity at load time.
- [ ] Define `ParseError` enum: `InvalidToml(toml::de::Error)`, `InvalidYaml(serde_yaml::Error)`, `ValidationError(Vec<String>)`, `DagError(DagError)`.
- [ ] Add `toml` and `serde_yaml` as dependencies of `devs-scheduler` in `Cargo.toml`.
- [ ] Add `// Covers: 1_PRD-REQ-006` annotation to all test functions.

## 3. Code Review
- [ ] Verify `#[serde(deny_unknown_fields)]` on all intermediate structs — no silent field drops.
- [ ] Verify TOML and YAML parsers produce identical `WorkflowDefinition` output for equivalent inputs.
- [ ] Verify built-in predicate routing table is exhaustive check (has a default/wildcard route).
- [ ] Verify named handler references are stored as strings (resolution happens at runtime, not parse time).
- [ ] Verify no proto/wire types in the parser — only domain types.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- declarative` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `parse_toml`, `parse_yaml`, `BuiltInPredicate`, and `BranchConfig`.
- [ ] Add module doc comment with TOML and YAML examples matching the project description sketches.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- declarative --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- declarative` and verify ≥ 90% line coverage for `declarative.rs`.
