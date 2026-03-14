# Task: Context File Generation and Atomic Write (Sub-Epic: 03_Data Flow & Stage Communication)

## Covered Requirements
- [1_PRD-REQ-012]

## Dependencies
- depends_on: ["01_template_variable_resolution.md"]
- shared_components: [devs-core (consumer), devs-scheduler (consumer), devs-executor (consumer — writes context file to working directory)]

## 1. Initial Test Written
- [ ] Create `devs-scheduler/tests/context_file_tests.rs`.
- [ ] **Test 1: Context file contains all upstream outputs.** Stage C depends on A and B. After A and B complete, assert the context object passed to the executor contains both A's and B's full output JSON keyed by stage name.
- [ ] **Test 2: Context file JSON schema.** Assert the generated context is valid JSON with structure `{"stages": {"A": {"exit_code": 0, "output": {...}}, "B": {...}}, "inputs": {...}}`.
- [ ] **Test 3: Context file excludes non-dependency stages.** Workflow has stages A, B, C, D where D depends only on C. Assert D's context file does NOT contain A or B outputs (only transitive dependencies).
- [ ] **Test 4: Context file includes workflow inputs.** Assert the `"inputs"` key contains the workflow submission inputs.
- [ ] **Test 5: Empty output stage.** Stage completed via `exit_code` with no structured output. Assert context file entry has `"output": null` and `"exit_code": 0`.
- [ ] Create `devs-executor/tests/context_file_write_tests.rs`.
- [ ] **Test 6: Atomic write.** Mock a working directory. Call the context file writer. Assert `.devs_context.json` exists and is valid JSON. Verify write uses temp-file-then-rename pattern (check that no partial file is observable).
- [ ] **Test 7: Disk full simulation.** If the temp file write fails (mock IO error), assert the function returns an error and `.devs_context.json` does NOT exist (no partial write).
- [ ] Annotate all tests with `// Covers: 1_PRD-REQ-012`.

## 2. Task Implementation
- [ ] In `devs-scheduler/src/dispatch.rs`, add a `build_stage_context` function that:
  1. Iterates the transitive `depends_on` closure for the target stage.
  2. For each dependency, collects `StageRun.exit_code` and `StageRun.output` (the parsed structured output, or `None`).
  3. Includes `WorkflowRun.inputs`.
  4. Returns a `StageContext` struct serializable to JSON.
- [ ] Define `StageContext` in `devs-scheduler/src/types.rs`:
  ```rust
  pub struct StageContext {
      pub inputs: HashMap<String, serde_json::Value>,
      pub stages: HashMap<String, StageOutputRecord>,
  }
  pub struct StageOutputRecord {
      pub exit_code: Option<i32>,
      pub output: Option<serde_json::Value>,
  }
  ```
- [ ] In `devs-executor/src/context.rs`, implement `write_context_file(dir: &Path, ctx: &StageContext) -> Result<()>`:
  1. Serialize `ctx` to JSON.
  2. Write to a temp file in the same directory (`dir/.devs_context.json.tmp`).
  3. `fs::rename` the temp file to `dir/.devs_context.json`.
  4. On any IO error, clean up the temp file and return `Err`.
- [ ] Wire `build_stage_context` → `write_context_file` into the executor's `prepare_environment` step, called before agent spawn.

## 3. Code Review
- [ ] Verify atomic write pattern: temp file and rename are on the same filesystem (same directory guarantees this).
- [ ] Verify context only includes transitive dependencies, not all completed stages.
- [ ] Confirm `StageContext` derives `Serialize` and `Deserialize` for checkpoint compatibility.
- [ ] No secrets or credentials leak into the context file (env vars are NOT included in context file, only stage outputs and inputs).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler --test context_file_tests`.
- [ ] Run `cargo test -p devs-executor --test context_file_write_tests`.
- [ ] All 7 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `StageContext`, `build_stage_context`, and `write_context_file` explaining the JSON schema and atomic write contract.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions.
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-012' devs-scheduler/tests/context_file_tests.rs devs-executor/tests/context_file_write_tests.rs` and confirm at least 7 matches.
