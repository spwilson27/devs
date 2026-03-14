# Task: Fallback State Machine Implementation (Sub-Epic: 01_mcp_tool_reliability_recovery)

## Covered Requirements
- [FB-SM-001], [FB-SM-002], [FB-SM-003], [FB-SM-004], [FB-SM-005]

## Dependencies
- depends_on: [06_fallback_registry_data_model_and_validation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-core/src/fallback/state_machine.rs`.
- [ ] Test that the only valid transition into `Active` is from `Implementing`. Attempting `Triggered -> Active` or `Inactive -> Active` must return an error (FB-SM-001).
- [ ] Test that transition from `Extended` to `PRD_Amendment` requires a corresponding amendment document path. The transition must fail if no amendment path is provided (FB-SM-002).
- [ ] Test that `Retired` is a terminal state: no transitions out of `Retired` are permitted. Test that a retired `fallback_id` cannot be reused — a new activation must create a new FAR with a new ADR number (FB-SM-003).
- [ ] Test that when `active_count` reaches 3, a new `Triggered` state must transition to `Blocked` instead. The `Blocked` state persists until an architecture review clears it and a slot opens (FB-SM-004).
- [ ] Test emergency rollback: `Active -> Inactive` (effectively `Retired`) is permitted. Verify that the FAR frontmatter is updated to `status = "Retired"` and a `## Retirement Notes` section is required (FB-SM-005).

## 2. Task Implementation
- [ ] Define the `FallbackStatus` enum: `Triggered`, `Implementing`, `Active`, `Extended`, `PRD_Amendment`, `Blocked`, `Retiring`, `Retired`, `Inactive`.
- [ ] Implement `FallbackStatus::transition(&self, target: FallbackStatus, context: &TransitionContext) -> Result<FallbackStatus>`:
    - [ ] Enforce `Active` only reachable from `Implementing` (FB-SM-001).
    - [ ] Enforce `Extended -> PRD_Amendment` requires `context.amendment_path.is_some()` (FB-SM-002).
    - [ ] Reject all transitions from `Retired` (FB-SM-003).
    - [ ] When `context.active_count >= 3` and target is `Active`, redirect to `Blocked` (FB-SM-004).
    - [ ] Allow `Active -> Retired` as emergency rollback when `context.is_emergency_rollback` (FB-SM-005).
- [ ] Implement `FallbackIdRegistry` to track retired IDs and prevent reuse (FB-SM-003).
- [ ] Integrate state machine validation into `FallbackRegistry::validate()`.

## 3. Code Review
- [ ] Verify exhaustive match on all state transitions — no implicit fallthrough.
- [ ] Ensure emergency rollback path correctly updates FAR frontmatter.
- [ ] Verify that the `Blocked` state correctly resolves when a slot becomes available.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib fallback::state_machine`
- [ ] Run `./do test` and verify traceability for FB-SM-001 through FB-SM-005.

## 5. Update Documentation
- [ ] Add a state machine diagram to `docs/plan/specs/8_risks_mitigation.md` showing all valid transitions.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[FB-SM-001]`, `[FB-SM-002]`, `[FB-SM-003]`, `[FB-SM-004]`, `[FB-SM-005]` as covered.
