# Task: Dependency-Aware Template Validation (Sub-Epic: 03_Template Resolution & Context)

## Covered Requirements
- [2_TAS-REQ-074]

## Dependencies
- depends_on: ["02_strict_resolution_engine.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/template/tests.rs` with a mock dependency graph (transitive closure).
- [ ] Write a test that passes when a template references a stage in the `depends_on` closure (direct or indirect).
- [ ] Write a test that fails when a template references a stage that is NOT in the `depends_on` closure.
- [ ] Verify that an invalid stage reference results in a specific error that can be mapped to `StageStatus::Failed`.

## 2. Task Implementation
- [ ] Update `ResolutionContext` to include a `transitive_dependencies: HashSet<StageID>` field.
- [ ] Implement validation logic in `TemplateResolver` that intercepts keys starting with `stage.`.
- [ ] For each `stage.<name>.*` reference, verify that `<name>` is present in `transitive_dependencies`.
- [ ] Throw a `ResolutionError::InvalidDependency` if the check fails.

## 3. Code Review
- [ ] Ensure the validation correctly handles transitive dependencies (i.e. if A depends on B, and B depends on C, then A can reference C).
- [ ] Verify the performance of the dependency check, especially for large dependency graphs.
- [ ] Confirm that `StageID` comparison is used for validation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib template::tests` and ensure all dependency-aware validation tests pass.

## 5. Update Documentation
- [ ] Document the rule that only dependency stages can be referenced in templates.

## 6. Automated Verification
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-074`.
- [ ] Run `./tools/verify_requirements.py` to ensure requirements are correctly mapped.
