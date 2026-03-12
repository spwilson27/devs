# Task: Standardized Roadmap Checkpoint Records and Status Management (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-001] through [9_PROJECT_ROADMAP-REQ-463]
- [8_RISKS-REQ-001] through [8_RISKS-REQ-367]

## Dependencies
- depends_on: [01_traceability_and_risk_enforcement.md, 02_ptc_and_adr_linting.md]
- shared_components: [devs-checkpoint, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `pytest .tools/tests/test_checkpoint_status.py` that verifies a mock `target/roadmap_checkpoint.json`.
- [ ] Test cases must verify that a `passed` checkpoint cannot be overwritten (ROAD-CHECK-BR-012).
- [ ] Test cases must verify that if multiple checks fail, the `blocker` field names the FIRST failing check in alphabetical order.
- [ ] Test cases must verify that the `blocker` field is non-null if and only if `status: "failed"`.
- [ ] Test cases must verify that `status: "skipped"` is only valid for Windows platform when CI is on Linux/macOS.

## 2. Task Implementation
- [ ] Implement the `checkpoint-record` generation logic in `.tools/checkpoint.py`.
- [ ] Ensure checkpoint records are committed to the `devs/state` branch (use `git stash push/pop` if necessary to switch branches).
- [ ] Implement the `atomic-collision-prevention`: check for existing `status: "passed"` record for the same phase ID before writing.
- [ ] Add the `alphabetical-blocker-selection`: sort failed checks and pick the first one.
- [ ] Implement the `CI-platform-check`: verify CI environment variables (e.g., `CI_JOB_NAME`) to validate `skipped` status for Windows.
- [ ] Add the `Active` fallback monitoring: check `fallback-registry.json` and ensure `active_count <= 3`. Exit non-zero with `"BLOCKED: maximum simultaneous fallbacks (3) exceeded"` if limit is reached.
- [ ] Integrate a final `road-state-machine-verification` into `./do presubmit` that enforces the Locked -> InProgress -> Passed transition sequence.

## 3. Code Review
- [ ] Verify that the checkpoint records are atomic and persistent across CI environments.
- [ ] Ensure that the state machine logic is rigid and cannot be bypassed manually.
- [ ] Check that the fallback registry is cleaned up correctly when a fallback is retired.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_checkpoint_status.py`.
- [ ] Run `./do presubmit` and verify it correctly manages the roadmap status in the `devs/state` branch.

## 5. Update Documentation
- [ ] Document the roadmap state machine and checkpoint record schema in `docs/plan/specs/9_project_roadmap.md`.
- [ ] Ensure `MEMORY.md` reflects the completion of the roadmap integration.

## 6. Automated Verification
- [ ] Attempt to manually overwrite a "passed" checkpoint and verify that the script rejects it.
- [ ] Verify that `./do presubmit` emits exactly one `WARN:` per active fallback.
