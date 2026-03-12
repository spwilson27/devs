# Task: Linting & Proto Governance Integration (Sub-Epic: 059_Detailed Domain Specifications (Part 24))

## Covered Requirements
- [2_TAS-REQ-244], [2_TAS-REQ-245], [2_TAS-REQ-246]

## Dependencies
- depends_on: [01_proto_timestamp_and_build_logic.md]
- shared_components: [./do Entrypoint Script, devs-proto]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_proto_governance.sh` that:
    - Modifies a `.proto` file (e.g., adds a comment) but leaves `devs-proto/src/gen/*.rs` unchanged, and verifies that `./do lint` fails due to "stale generated files".
    - Removes a field from a `.proto` file without adding it to a `reserved` statement and verifies that `./do lint` fails.
    - Adds a `clippy::pedantic` violation to `devs-proto/src/gen/some_file.rs` and verifies that `./do lint` still passes (or the violation is ignored specifically in that directory).

## 2. Task Implementation
- [ ] Update `./do lint` script:
    - Implement a "staleness check": for each `.proto` file in `proto/devs/v1/`, compare its modification time with the modification time of `devs-proto/src/gen/*.rs`. If any proto is newer, exit with an error.
    - Integrate a proto field governance tool (e.g., a custom script or a light-weight tool like `protoc-gen-lint` or `buf` if approved, otherwise a script that greps for removed fields against previous commits). For MVP, a script that ensures the `reserved` keyword is present if a field number is missing from the list of fields in the message will suffice.
    - Update the `clippy` call in `./do lint` to exclude `devs-proto/src/gen/` from the check. This can be done by using `cargo clippy --workspace --all-targets --all-features -- -D warnings --skip src/gen` (if your wrapper supports it) or by ensuring generated files have `#[allow(clippy::all)]` added at the top in `build.rs`. The requirement says "--skip src/gen" which might be a custom flag you need to implement in the `./do lint` wrapper.
- [ ] Ensure that `devs-proto/build.rs` or `lib.rs` includes logic to suppress clippy for the `src/gen` module.

## 3. Code Review
- [ ] Confirm that the staleness check does not have false positives (e.g., handles different OS timestamp resolutions).
- [ ] Confirm that clippy is still active for all other parts of the workspace.
- [ ] Confirm that removing a field number from a proto message without reserving it indeed triggers a failure.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_proto_governance.sh`.
- [ ] Run `./do lint` on a clean workspace and ensure it passes.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/2_tas.md` or a local developer guide to explain how to properly remove proto fields and why the staleness check exists.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure it completes within the 15-minute timeout.
- [ ] Run `./do test` and ensure `target/traceability.json` reflects coverage for the listed requirements.
