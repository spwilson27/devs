# Task: Template Resolution Context & Priority (Sub-Epic: 03_Template Resolution & Context)

## Covered Requirements
- [2_TAS-REQ-088], [2_TAS-REQ-073]

## Dependencies
- depends_on: []
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/template/tests.rs` verifying the `ResolutionContext` can be populated with multiple sources (inputs, metadata, stage outputs).
- [ ] Write a test to verify the priority order of resolution: `workflow.input` > `run.metadata` > `stage.<name>.structured` > `stage.<name>.exit_code` > `stage.<name>.stdout` > `stage.<name>.stderr` > `fan_out.item`.
- [ ] Verify that when the same key exists in both `workflow.input` and `run.metadata`, the input value is selected.

## 2. Task Implementation
- [ ] Define `ResolutionContext` struct in `crates/devs-core/src/template/context.rs`.
- [ ] Include fields for:
    - `inputs: HashMap<String, Value>`
    - `metadata: RunMetadata` (run_id, slug, workflow_name)
    - `stage_outputs: HashMap<StageID, StageOutput>`
    - `fan_out_item: Option<Value>`
- [ ] Define `TemplateResolver` struct in `crates/devs-core/src/template/resolver.rs`.
- [ ] Implement a method `resolve_key(&self, key: &str, ctx: &ResolutionContext) -> Result<Value, ResolutionError>` that implements the priority logic described in [2_TAS-REQ-073].
- [ ] Ensure `ResolutionError` can distinguish between missing keys and other resolution failures.

## 3. Code Review
- [ ] Verify the priority order is exactly as specified in the TAS.
- [ ] Ensure the context structure is efficient and doesn't require deep clones for every resolution.
- [ ] Verify that `StageID` is used consistently for indexing stage outputs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib template::tests` and ensure all priority and context tests pass.

## 5. Update Documentation
- [ ] Document the `ResolutionContext` structure and its role in the resolution pipeline in the `devs-core` internal docs.

## 6. Automated Verification
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-088`, `// Covers: 2_TAS-REQ-073`.
- [ ] Run `./tools/verify_requirements.py` to ensure requirements are correctly mapped.
