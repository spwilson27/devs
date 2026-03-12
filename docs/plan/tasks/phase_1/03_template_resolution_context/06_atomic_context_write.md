# Task: Atomic Context File Persistence (Sub-Epic: 03_Template Resolution & Context)

## Covered Requirements
- [2_TAS-REQ-090]

## Dependencies
- depends_on: [05_context_json_schema.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-executor/src/context/tests.rs` verifying the atomic write protocol.
- [ ] Write a test that simulates a write failure (e.g., using a mock filesystem or read-only directory) and verifies that the stage fails.
- [ ] Write a test verifying that the context file `.devs_context.json` is present in the working directory before agent spawn.
- [ ] Verify that the file is written atomically:
    - No partial `.devs_context.json` is ever visible (verify using a mock that checks for existence only after rename).

## 2. Task Implementation
- [ ] Implement the `write_context_file` method in the `StageExecutor` trait (or a helper utility).
- [ ] Implement the protocol described in [2_TAS-REQ-090] and [2_TAS-REQ-109] (which is similar):
    1. Serialize `StageContextPayload` to JSON bytes.
    2. Write bytes to `.devs_context.json.tmp` in the target working directory.
    3. Call `fsync` on the temp file to ensure persistence.
    4. Rename `.devs_context.json.tmp` to `.devs_context.json`.
- [ ] Ensure any IO errors result in a `Result::Err` that the stage dispatcher will use to set the stage to `Failed`.
- [ ] Integrate this call into each `StageExecutor` implementation (Local, Docker, Remote).

## 3. Code Review
- [ ] Verify the rename is atomic on POSIX and handled correctly on Windows.
- [ ] Confirm `fsync` is used before the rename.
- [ ] Check for potential race conditions during the write-and-rename sequence.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib context::tests` and ensure all write protocol tests pass.

## 5. Update Documentation
- [ ] Document the context file location and availability for agent authors.

## 6. Automated Verification
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-090`.
- [ ] Run `./tools/verify_requirements.py` to ensure requirements are correctly mapped.
