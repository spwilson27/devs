# Task: Define Snapshot Commit Metadata Constants (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-022C]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/constants.rs` (or a similar relevant module) that asserts the existence and exact values of snapshot metadata constants.
- [ ] The test must verify:
    - `SNAPSHOT_COMMIT_MSG_PREFIX` (or similar) is exactly `"devs: snapshot "`.
    - `DEVS_GIT_AUTHOR_NAME` is exactly `"devs"`.
    - `DEVS_GIT_AUTHOR_EMAIL` is exactly `"devs@localhost"`.

## 2. Task Implementation
- [ ] Implement the constants in `devs-core`.
- [ ] Ensure they are public so other crates like `devs-checkpoint` can consume them.
- [ ] Implement a helper function `format_snapshot_commit_msg(run_id: &Uuid) -> String` that returns the formatted string `devs: snapshot <run-id>`.

## 3. Code Review
- [ ] Verify that constants are placed in an appropriate module within `devs-core`.
- [ ] Ensure `missing_docs` are provided for the new public items.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure the constants and helper function work as expected.

## 5. Update Documentation
- [ ] Update any relevant internal documentation about git commit conventions if it exists.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the `traceability.json` correctly maps [2_TAS-REQ-022C] to the new tests.
