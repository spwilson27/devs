# Task: Prompt & Env Variable Resolution (Sub-Epic: 03_Template Resolution & Context)

## Covered Requirements
- [1_PRD-REQ-010]

## Dependencies
- depends_on: ["03_dependency_validation.md"]
- shared_components: [devs-core, devs-executor]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/stage/tests.rs` verifying that `StageConfig` inputs (prompt, env) can be successfully resolved.
- [ ] Write a test for resolving a `prompt_file` path (loading the content and then applying template substitution).
- [ ] Verify that environment variables are also correctly resolved using the `TemplateResolver`.
- [ ] Write a test that fails when resolution fails for any input field.

## 2. Task Implementation
- [ ] Implement a method `StageConfig::resolve(&self, ctx: &ResolutionContext, resolver: &TemplateResolver) -> Result<ResolvedStageInputs, ResolutionError>`.
- [ ] Implement prompt resolution:
    - If `prompt` (string) is provided, substitute templates.
    - If `prompt_file` is provided, load the file and then substitute templates.
- [ ] Implement environment variable resolution:
    - Iterate over the stage's `env` map and resolve templates in each value.
- [ ] Return the `ResolvedStageInputs` containing the fully substituted strings.

## 3. Code Review
- [ ] Ensure that `prompt_file` resolution correctly handles file path errors and loads content as UTF-8.
- [ ] Check that the system prompt is also resolved if present.
- [ ] Verify that the merged environment (server + workflow + stage) is correctly handled during resolution.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib stage::tests` and ensure all stage input resolution tests pass.

## 5. Update Documentation
- [ ] Document how to use template variables in prompts and environment variables in the user-facing workflow authoring guide.

## 6. Automated Verification
- [ ] Verify traceability annotations: `// Covers: 1_PRD-REQ-010`.
- [ ] Run `./tools/verify_requirements.py` to ensure requirements are correctly mapped.
