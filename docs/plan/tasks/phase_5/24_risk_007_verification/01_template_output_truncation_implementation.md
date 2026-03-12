# Task: Template Output Truncation Implementation (Sub-Epic: 24_Risk 007 Verification)

## Covered Requirements
- [RISK-007-BR-003], [RISK-007-BR-004]

## Dependencies
- depends_on: [docs/plan/tasks/phase_1/03_template_resolution_context/01_template_resolver_skeleton.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/template/tests.rs`, add a test case `test_template_stdout_truncation`:
    - Create a `ResolutionContext` and inject a `stage_output` where `stdout` is a large string (e.g., 20,480 bytes, which is exactly 2x the limit).
    - Use a template: `Output: {{stage.A.stdout}}`.
    - Resolve the template using `TemplateResolver`.
    - Assert that the resolved string contains exactly 10,240 bytes from the *end* of the original `stdout` string.
    - Assert that the length of the substituted value is exactly 10,240 bytes.
- [ ] Add a similar test case for `stderr`.

## 2. Task Implementation
- [ ] Update `crates/devs-core/src/template/context.rs`:
    - Modify the `ResolutionContext` population logic (or the `StageOutput` adapter) to apply truncation to `stdout` and `stderr` fields.
    - Implement the truncation logic: if a string exceeds 10,240 bytes, preserve only the LAST 10,240 bytes (most recent content).
    - Ensure this truncation happens *before* the strings are stored in the `ResolutionContext` map, consistent with [RISK-007-BR-004].
    - Reuse `BoundedBytes` or `BoundedString` logic from `devs-core` if available to ensure consistent semantics (per [RISK-007-BR-003]).
- [ ] Verify that the `ResolutionContext` fields used by `TemplateResolver` (e.g., `{{stage.name.stdout}}`) pull from these truncated copies.

## 3. Code Review
- [ ] Confirm that truncation preserves valid UTF-8 boundaries if using `String` (be careful not to slice in the middle of a multi-byte character).
- [ ] Verify that the truncation is performed once at context creation, not repeatedly during resolution of multiple templates.
- [ ] Ensure that the full `stdout`/`stderr` (up to 1 MiB) remains available in the `StageOutput` for log streaming, and only the *template context* copy is truncated.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib template::tests`.
- [ ] Ensure `test_template_stdout_truncation` and `test_template_stderr_truncation` pass.

## 5. Update Documentation
- [ ] Update the `devs-core` crate documentation to specify the 10,240-byte limit for `stdout` and `stderr` when used in templates.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `devs-core` traceability confirms coverage for `RISK-007-BR-003` and `RISK-007-BR-004`.
