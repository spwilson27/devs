# Task: Standardize Proto File Header Structure (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-008A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a malformed `.proto` file in `proto/devs/v1/` that lacks the required `syntax`, `package`, or `import` header.
- [ ] Write a test script (or use a temporary bash command) that runs `./do lint` and asserts that it exits with a non-zero status and reports a lint error specifically related to the proto file header.

## 2. Task Implementation
- [ ] Develop a lint check (e.g., a simple shell script or part of a larger linting tool) that scans all `.proto` files in the `proto/devs/v1/` directory.
- [ ] The check MUST verify that every file starts with the EXACT header block required by [2_TAS-REQ-008A]:
    ```proto
    syntax = "proto3";
    package devs.v1;

    import "google/protobuf/timestamp.proto";
    ```
- [ ] Ensure the script accounts for additional imports after the mandatory block.
- [ ] Integrate this proto header check into `./do lint`.
- [ ] Ensure that `devs-proto/build.rs` does not proceed if these header rules are violated (this adds an additional layer of safety).

## 3. Code Review
- [ ] Verify that the regex or parsing logic used in the lint check is robust and correctly identifies missing or malformed header components.
- [ ] Confirm that all existing `.proto` files (once created) conform to this standard.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes on a codebase with correctly-formatted proto files.
- [ ] Remove the `import` line from a proto file and confirm that `./do lint` fails.

## 5. Update Documentation
- [ ] Ensure the project's agent memory or `GEMINI.md` reflects this requirement for any newly created `.proto` files.

## 6. Automated Verification
- [ ] Execute the proto header check script and verify it correctly flags files with missing or incorrect header sections.
- [ ] Run `./do lint` and check its output for proto file verification messages.
