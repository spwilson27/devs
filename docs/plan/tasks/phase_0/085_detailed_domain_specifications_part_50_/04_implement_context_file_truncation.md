# Task: Implement Context File Truncation (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-502]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor, devs-core]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-executor` (or a helper utility crate) that simulates a large `StageOutput` collection.
- [ ] Provide enough `stdout`/`stderr` data so that the serialized JSON would exceed 10 MiB.
- [ ] Call the context file generation function.
- [ ] Assert that the resulting string/file size is ≤ 10 MiB.
- [ ] Assert that the `truncated` flag is set to `true` for the affected stages.
- [ ] Assert that `stdout` and `stderr` were truncated "proportionally" (e.g., by taking a suffix or a specific ratio).

## 2. Task Implementation
- [ ] Implement a `ContextFileBuilder` or similar utility that takes a list of `StageOutput`s.
- [ ] Implement logic to calculate the estimated size of the JSON output.
- [ ] If the size exceeds 10 MiB, implement a proportional truncation strategy for `stdout` and `stderr` fields.
- [ ] Update the `StageOutput` (or the copy used for context) to set `truncated: true`.
- [ ] Emit a `tracing::warn!` log when truncation occurs.
- [ ] Ensure the final serialization stays within the 10 MiB limit.

## 3. Code Review
- [ ] Verify the "proportional" truncation logic: it should be fair to all stages if possible, or follow a predictable pattern.
- [ ] Ensure the `truncated` flag is correctly propagated to the final JSON.
- [ ] Check for edge cases where even after truncation the headers/metadata exceed the limit (though unlikely for 10 MiB).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor`.

## 5. Update Documentation
- [ ] Update the TAS or developer docs regarding context file limits.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `2_TAS-REQ-502` as covered.
