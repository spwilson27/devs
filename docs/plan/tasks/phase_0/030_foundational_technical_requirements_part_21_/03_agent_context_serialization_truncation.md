# Task: Agent Context Serialization with Truncation (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-023B]

## Dependencies
- depends_on: [02_agent_context_types_and_dependency_logic.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/context.rs` (or similar) that generates an `AgentContext` larger than 10 MiB.
- [ ] Verify that the serialization function:
    - Sets the `truncated` flag to `true`.
    - Corrects the size to be within 10 MiB.
    - Proportionally truncates `stdout` and `stderr` fields in dependency stage outputs.

## 2. Task Implementation
- [ ] Implement a custom serialization function or method for `AgentContext` in `devs-core`.
- [ ] Logic for proportional truncation:
    1. Check total JSON size (10 MiB threshold).
    2. If over: calculate total length of all `stdout` and `stderr` strings in the context.
    3. Calculate the target budget for these fields.
    4. Truncate each `stdout` and `stderr` field proportionally to its original size until the total size is under 10 MiB.
    5. Ensure at least some minimum content is kept (if possible) or just strictly follow the proportional reduction.
    6. Set `truncated: true` in the final object.
- [ ] Emit a `WARN` level log (using `tracing::warn!`) if truncation occurs.

## 3. Code Review
- [ ] Verify the truncation algorithm is robust and handles empty or missing fields correctly.
- [ ] Ensure the 10 MiB limit is strictly enforced.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure the truncation logic is correct and handles edge cases.

## 5. Update Documentation
- [ ] Document the truncation policy in the code using doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and verify that [2_TAS-REQ-023B] is mapped correctly in `traceability.json`.
