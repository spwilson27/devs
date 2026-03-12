# Task: Checkpoint Schema Version Forward-Compatible Validation (Sub-Epic: 083_Detailed Domain Specifications (Part 48))

## Covered Requirements
- [2_TAS-REQ-490], [2_TAS-REQ-492]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint` that attempts to load a `checkpoint.json` with `"schema_version": 2`.
- [ ] Mock or use a temporary directory to store this invalid checkpoint file.
- [ ] Verify that the loading function returns an error or a specific `Unrecoverable` state.
- [ ] Verify that the error message or log output contains the string `"unsupported checkpoint schema version"`.
- [ ] Verify that other fields in the JSON are NOT accessed or validated if the version is unsupported.
- [ ] In an integration test (or server-level test), ensure that if one run has an unsupported version, the server still starts and successfully loads other valid runs.

## 2. Task Implementation
- [ ] In `devs-checkpoint`, update the `checkpoint.json` deserialization logic to first check the `schema_version` field.
- [ ] Define the current supported version as a constant (e.g., `const SUPPORTED_SCHEMA_VERSION: u32 = 1;`).
- [ ] If the version in the file does not match the supported version, log an `ERROR` using the `tracing` crate with the exact message: `"unsupported checkpoint schema version <N> in <path>"`.
- [ ] Transition the run state to `Unrecoverable` (ensure this state exists in `devs-core`'s `WorkflowRun` domain type).
- [ ] Ensure the deserializer stops processing further fields to avoid potential breakage from future schema changes.

## 3. Code Review
- [ ] Confirm that the logging matches the requirement exactly: `"unsupported checkpoint schema version <N> in <path>"`.
- [ ] Ensure that the `Unrecoverable` state is handled correctly by the scheduler (it should be skipped).
- [ ] Verify that the deserialization logic is robust and doesn't panic on missing `schema_version`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure the version validation tests pass.

## 5. Update Documentation
- [ ] Document the checkpoint schema versioning policy in the `devs-checkpoint` README or internal documentation.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-490]` and `[2_TAS-REQ-492]` are correctly mapped to the tests.
