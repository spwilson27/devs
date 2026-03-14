# Task: Enforce Proto File Header Block Convention (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-008A]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-proto (Protobuf Definitions & Generated Types)"]

## 1. Initial Test Written
- [ ] Write a lint script test that scans all `.proto` files under `proto/devs/v1/` and asserts each file begins with `syntax = "proto3";` as the first non-comment, non-empty line
- [ ] Assert each `.proto` file contains `package devs.v1;` as the second semantic line
- [ ] Write a negative test: create a temporary `.proto` file missing the `syntax` line, run the lint check, and assert it fails with an error identifying the file
- [ ] Write a negative test: create a temporary `.proto` file with `package devs.v2;` instead of `devs.v1`, run the lint check, and assert it fails

## 2. Task Implementation
- [ ] Create a proto header validation script (e.g., `scripts/check-proto-headers.sh` or inline in `./do lint`) that:
  1. Finds all `*.proto` files under `proto/`
  2. For each file, checks that the first non-empty, non-comment line is `syntax = "proto3";`
  3. Checks that a subsequent line contains `package devs.v1;`
  4. Exits non-zero if any file violates these rules, printing the filename and the violation
- [ ] Add this check as a step in `./do lint`
- [ ] Ensure all existing `.proto` files (if any, e.g., `server.proto`, `common.proto`) conform to the header format:
  ```proto
  syntax = "proto3";
  package devs.v1;

  import "google/protobuf/timestamp.proto";
  // Additional imports as required
  ```
- [ ] The `import "google/protobuf/timestamp.proto";` line is required only if the file uses `google.protobuf.Timestamp`; the check should enforce `syntax` and `package` lines but treat imports as optional

## 3. Code Review
- [ ] Verify the script handles edge cases: leading comments/license headers before `syntax` (proto3 spec allows comments before `syntax`, but the requirement says the file MUST BEGIN with the header block — clarify if comments are allowed before it)
- [ ] Verify the script is POSIX sh-compatible
- [ ] Verify all existing proto files pass the check

## 4. Run Automated Tests to Verify
- [ ] Run the proto header check on all existing proto files and confirm exit code 0
- [ ] Run the negative tests and confirm they fail as expected

## 5. Update Documentation
- [ ] Document the proto file header convention in development docs

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0
- [ ] Run `head -2 proto/devs/v1/*.proto` and visually confirm all files start with the required header
