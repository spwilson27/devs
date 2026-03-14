# Task: Proto Field Removal Reserved Statement Enforcement (Sub-Epic: 059_Detailed Domain Specifications (Part 24))

## Covered Requirements
- [2_TAS-REQ-245]

## Dependencies
- depends_on: [01_proto_timestamp_and_build_logic.md]
- shared_components: [./do Entrypoint Script, devs-proto]

## 1. Initial Test Written
- [ ] In `devs-proto/tests/proto_reserved_policy.rs`, write a test `test_no_gaps_in_field_numbers_without_reserved` that:
  - Reads every `.proto` file under `proto/devs/v1/`.
  - For each `message` block, extracts all assigned field numbers and all `reserved` field numbers.
  - Computes the expected sequential range `1..=max_field_number`.
  - Asserts that every number in that range is either assigned to a field or listed in a `reserved` statement. If gaps exist, the test fails listing the message name, file, and missing field numbers.
  - Add `// Covers: 2_TAS-REQ-245` annotation.
- [ ] Write a test `test_reserved_statements_include_field_names` that:
  - For each `reserved` numeric entry, checks that a corresponding `reserved "field_name"` string reservation exists in the same message (best practice per proto3 style guide).
  - This test may be advisory (warning) rather than hard-fail if the project decides name reservation is optional, but the numeric reservation must be enforced.
  - Add `// Covers: 2_TAS-REQ-245` annotation.

## 2. Task Implementation
- [ ] In the `./do` script's `lint` subcommand, add a proto field reservation lint step:
  - Option A (preferred): If `buf` is available, add `buf lint proto/` with a `buf.yaml` config that enables the `FIELD_NO_DELETE_UNLESS_NUMBER_RESERVED` rule (or equivalent).
  - Option B (fallback): Write a small script or Rust binary (`tools/proto_reserved_check`) that parses `.proto` files, extracts message field numbers and reserved numbers, and fails if any gap exists without a reserved statement.
- [ ] Ensure the lint step is integrated into the `./do lint` pipeline and runs on every presubmit.
- [ ] Add the `reserved` enforcement to the CI pipeline so it catches violations before merge.

## 3. Code Review
- [ ] Verify the parser handles nested messages correctly (messages inside messages).
- [ ] Verify it handles `oneof` fields (which share field numbers with the enclosing message).
- [ ] Verify the lint step does not produce false positives for valid proto files with no removed fields.
- [ ] Verify edge case: a message with only field 1 and no reserved statements passes (no gaps).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto --test proto_reserved_policy` and confirm all tests pass.
- [ ] Intentionally remove a field from a `.proto` file without adding `reserved`, run `./do lint`, and confirm it fails.
- [ ] Add the appropriate `reserved` statement, run `./do lint` again, and confirm it passes.

## 5. Update Documentation
- [ ] Add a comment in the proto lint script or `buf.yaml` explaining the field reservation policy and referencing [2_TAS-REQ-245].

## 6. Automated Verification
- [ ] Run `./do lint` on a clean workspace and verify exit code 0.
- [ ] Run `./do test` and verify `target/traceability.json` contains an entry for `2_TAS-REQ-245`.
