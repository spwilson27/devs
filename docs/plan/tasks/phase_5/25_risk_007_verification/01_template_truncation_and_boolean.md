# Task: Implement Template Truncation and Boolean Stringification (Sub-Epic: 25_Risk 007 Verification)

## Covered Requirements
- [AC-RISK-007-03], [AC-RISK-007-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/template/tests.rs` (or similar), add a unit test that passes a 20,480-byte string as `stage.A.stdout` to the `TemplateContext`.
- [ ] Assert that a template `{{stage.A.stdout}}` resolves to exactly 10,240 bytes consisting of the *last* 10,240 bytes of the input string.
- [ ] Add a unit test that provides a JSON boolean `true` and `false` in a structured output field.
- [ ] Assert that `{{stage.A.output.is_valid}}` resolves to the literal string `"true"`.
- [ ] Assert that `{{stage.A.output.has_error}}` resolves to the literal string `"false"`.

## 2. Task Implementation
- [ ] Modify `TemplateResolver` or the context preparation logic in `devs-core` to truncate `stdout` and `stderr` fields to 10,240 bytes from the end of the buffer.
- [ ] Update the `TemplateResolver` logic to handle `serde_json::Value::Bool` by converting it to its string representation (`"true"` or `"false"`) instead of returning an error.
- [ ] Ensure that other non-scalar types (Object, Array) still return `TemplateError::NonScalarField` as per `AC-RISK-007-02`.

## 3. Code Review
- [ ] Verify that the truncation uses efficient string slicing or buffer management (respecting UTF-8 boundaries if necessary, though raw bytes are used for `BoundedBytes`).
- [ ] Confirm that boolean stringification is explicit and doesn't rely on implicit `Display` implementations that might differ from the required `"true"`/`"false"` literals.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib template` to verify the new unit tests pass.

## 5. Update Documentation
- [ ] Update `devs-core` documentation to reflect the 10,240-byte truncation limit for stdout/stderr in templates.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-RISK-007-03] and [AC-RISK-007-04] as covered.
