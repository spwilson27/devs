# Task: Enforce Proto3 Syntax and Forbidden Language Options in .proto Files (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-237]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto (Consumer — proto files are checked)", "./do Entrypoint Script (Consumer — lint integration)"]

## 1. Initial Test Written
- [ ] All tests must include `// Covers: 2_TAS-REQ-237`.
- [ ] Write test cases in `scripts/test_proto_policy.sh` (or equivalent):
- [ ] `test_proto2_syntax_rejected`: Create a temp `.proto` file with `syntax = "proto2";` as the first declaration. Run the enforcement check. Assert exit code is non-zero and error message names the file and says `proto3 required`.
- [ ] `test_go_package_option_rejected`: Create a temp `.proto` file with `syntax = "proto3";` and `option go_package = "example.com/foo";`. Run the check. Assert non-zero exit and error message mentions `go_package`.
- [ ] `test_java_package_option_rejected`: Create a temp `.proto` file with `syntax = "proto3";` and `option java_package = "com.example";`. Run the check. Assert non-zero exit.
- [ ] `test_valid_proto3_no_go_java_passes`: Create a temp `.proto` file with only `syntax = "proto3";`, a `package devs.v1;`, and a message definition. Assert the check passes (exit 0).
- [ ] `test_missing_syntax_declaration_rejected`: Create a `.proto` file with no `syntax` line. Assert non-zero exit.
- [ ] `test_all_existing_proto_files_pass`: Run the check against the actual `proto/` directory in the repo. Assert exit 0.

## 2. Task Implementation
- [ ] Create `scripts/enforce_proto_policy.sh` (POSIX sh compatible):
  - Find all `.proto` files under `proto/` directory (using `find proto/ -name '*.proto'`).
  - For each file:
    - Check that the file contains `syntax = "proto3";` (grep for the exact string). If missing or different, report error with filename.
    - Check that the file does NOT contain `option go_package` (grep). If found, report error with filename and line number.
    - Check that the file does NOT contain `option java_package` (grep). If found, report error with filename and line number.
    - Check that the file does NOT contain `option java_outer_classname` (grep). If found, report error.
  - Exit non-zero if any violations found; print summary count.
- [ ] Integrate into `./do lint` by adding a call to `scripts/enforce_proto_policy.sh`.
- [ ] Optionally, also add as a `build.rs` pre-check in `devs-proto` so violations are caught at compile time too.

## 3. Code Review
- [ ] Verify all three forbidden options are checked: `go_package`, `java_package`, `java_outer_classname`.
- [ ] Verify `syntax = "proto3"` check is exact — not matching `proto3` as a substring in comments or strings.
- [ ] Verify the script is POSIX sh compatible.
- [ ] Verify error messages include the filename and line number for easy debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `scripts/test_proto_policy.sh` and confirm all 6 test cases pass.
- [ ] Run `./do lint` on the workspace and confirm the proto policy check passes.

## 5. Update Documentation
- [ ] Add a comment at the top of `scripts/enforce_proto_policy.sh`: `# Enforces [2_TAS-REQ-237]: proto3 syntax required, go_package/java_package forbidden.`

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the proto policy check appears in output and passes.
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep for `// Covers: 2_TAS-REQ-237` to confirm traceability annotation in test code.
