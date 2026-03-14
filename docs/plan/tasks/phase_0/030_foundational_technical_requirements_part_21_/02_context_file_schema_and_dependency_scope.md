# Task: Implement Context File Schema and Transitive Dependency Scope (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-023A], [2_TAS-REQ-023D]

## Dependencies
- depends_on: []
- shared_components: ["devs-core (consumer — uses domain types for stage outputs and dependency graphs)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/context_file.rs` (or appropriate module), write a unit test `test_context_file_contains_depends_on_closure` that constructs a small DAG (A -> B -> C, A -> D) and verifies that when building context for stage C, only stages A and B (the transitive `depends_on` closure) are included, not D.
- [ ] Write a unit test `test_context_file_excludes_non_reachable_stages` with a diamond DAG (A -> B, A -> C, B -> D, C -> D) verifying that context for D includes A, B, and C, but a parallel stage E (no dependency relationship to D) is excluded.
- [ ] Write a unit test `test_context_file_only_includes_terminal_state_stages` that verifies stages in the transitive closure that are not in a terminal state (e.g., still running) are excluded from the context file content.
- [ ] Write a unit test `test_context_file_serializes_to_devs_context_json` that verifies the output struct serializes to valid JSON with expected field names (stage name as key, output fields as values).
- [ ] Write a unit test `test_context_file_name_is_correct` verifying the constant `CONTEXT_FILE_NAME` equals `".devs_context.json"`.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/context_file.rs` module.
- [ ] Define `pub const CONTEXT_FILE_NAME: &str = ".devs_context.json";`.
- [ ] Define a `StageContextEntry` struct with fields: `stage_name: String`, `exit_code: Option<i32>`, `stdout: Option<String>`, `stderr: Option<String>`, `structured_output: Option<serde_json::Value>`, `truncated: bool`. Derive `Serialize, Deserialize, Debug, Clone`.
- [ ] Define a `ContextFile` struct wrapping `Vec<StageContextEntry>` with `Serialize`/`Deserialize`.
- [ ] Implement `pub fn compute_transitive_depends_on(stage: &str, dependency_map: &HashMap<String, Vec<String>>) -> HashSet<String>` that computes the full transitive closure via BFS/DFS over the `depends_on` edges.
- [ ] Implement `pub fn build_context(stage: &str, dependency_map: &HashMap<String, Vec<String>>, stage_outputs: &HashMap<String, StageContextEntry>, terminal_stages: &HashSet<String>) -> ContextFile` that filters to transitive closure AND terminal-state stages only.
- [ ] Export from crate root.
- [ ] Add `// Covers: 2_TAS-REQ-023A` and `// Covers: 2_TAS-REQ-023D` annotations to relevant tests.

## 3. Code Review
- [ ] Verify the transitive closure algorithm handles cycles defensively (should not occur in a DAG, but guard against infinite loops).
- [ ] Verify `serde` derives produce the expected JSON shape.
- [ ] Verify no wire types (protobuf) are used — only domain types.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- context_file` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to all public types and functions explaining the context file contract.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- context_file` and verify exit code 0.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-023A" crates/devs-core/` and verify at least one match.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-023D" crates/devs-core/` and verify at least one match.
