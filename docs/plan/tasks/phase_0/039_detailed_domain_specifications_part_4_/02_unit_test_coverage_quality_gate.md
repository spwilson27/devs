# Task: Unit Test Coverage Quality Gate (QG-001) (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-050]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a simulation in `tests/test_coverage_gates.py` that:
    - Generates a synthetic `target/coverage/report.json` where QG-001 (unit coverage) is 89.9%.
    - Runs the coverage gate logic and ensures it reports "QG-001 FAILED: 89.9% < 90.0%" and exits non-zero.
    - Verifies that any unit tests that call internal Rust functions directly *only* contribute to QG-001, not the E2E gates [9_PROJECT_ROADMAP-REQ-309].

## 2. Task Implementation
- [ ] In `./do coverage`, configure `cargo llvm-cov` to specifically measure coverage from unit tests (e.g., tests within `src/` files) [1_PRD-REQ-050].
- [ ] Implement the threshold check specifically for QG-001 at 90.0%.
- [ ] Ensure the coverage gate reporter identifies uncovered lines and lists them in the output as per [3_MCP_DESIGN-REQ-EC-OBS-DBG-005].
- [ ] Ensure that failure of QG-001 causes the overall `coverage` stage to fail with `overall_passed: false` in `target/coverage/report.json` [4_USER_FEATURES-AC-3-DO-004].

## 3. Code Review
- [ ] Verify that unit test coverage is accurately isolated from E2E test coverage.
- [ ] Ensure the 90.0% threshold is hardcoded and cannot be bypassed.
- [ ] Verify that the `report.json` schema matches the PRD requirements (id, threshold, actual, passed, delta).

## 4. Run Automated Tests to Verify
- [ ] Run the simulation test script `tests/test_coverage_gates.py`.
- [ ] Run `./do coverage` on a codebase with a known coverage percentage and verify the reported value is correct.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document the 90% unit test coverage gate enforcement.

## 6. Automated Verification
- [ ] Run `./do coverage` after intentionally removing unit tests for a significant chunk of logic and verify the gate fails.
