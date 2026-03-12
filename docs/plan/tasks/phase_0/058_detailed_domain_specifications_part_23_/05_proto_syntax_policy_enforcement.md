# Task: Proto3 Syntax & Go Package Omission Policy Enforcement (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-237]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-proto"]

## 1. Initial Test Written
- [ ] Create a mock `.proto` file in a temporary directory with `syntax = "proto2";`.
- [ ] Verify that the policy enforcement script correctly identifies this violation and exits non-zero.
- [ ] Create a mock `.proto` file with `option go_package = "...";` and verify that it is identified as a violation.
- [ ] Create a mock `.proto` file with `syntax = "proto3";` and no Go/Java options, and verify that it is permitted.

## 2. Task Implementation
- [ ] Implement a script `scripts/enforce_proto_policy.sh` (or a Python script).
- [ ] The script should:
    - Iterate through all `.proto` files in the `proto/` directory.
    - Verify that each file starts with `syntax = "proto3";`.
    - Scan for the strings `option go_package`, `option java_package`, and `option java_outer_classname`.
    - If any of these are found, print a descriptive error and exit non-zero.
- [ ] Integrate this script into the `./do lint` subcommand or as a pre-build step in `devs-proto/build.rs`.
- [ ] Update the CI pipeline to include this check.

## 3. Code Review
- [ ] Verify that the script correctly identifies all required constraints from `2_TAS-REQ-237`.
- [ ] Ensure that the error message clearly points to the specific file and line violating the policy.
- [ ] Check for clear and efficient implementation.

## 4. Run Automated Tests to Verify
- [ ] Run the mock test cases created in step 1 and ensure they pass.
- [ ] Run `./do lint` on the current repository and ensure it passes (since all proto files should be compliant).

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the implementation of the proto syntax and Go package omission policy enforcement.

## 6. Automated Verification
- [ ] Run `./do lint` and verify that the proto policy check is executed and reported in the output.
