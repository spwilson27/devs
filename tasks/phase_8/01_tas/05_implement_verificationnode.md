# Task: Implement VerificationNode (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Ensure tests from task 04 exist and fail appropriately (Red). Use these tests to guide implementation.

## 2. Task Implementation
- [ ] Implement VerificationNode in src/tdd_engine/verification_node.(py|ts) with method verify(test_id: str) -> { id, passed: bool, details: { failures: [...], duration_ms: int } }.
  - Steps:
    1. Resolve test file path by consulting TestNode's record or predictable sandbox location.
    2. Invoke the test runner with the target test path and capture stdout, stderr, and timing.
    3. Parse the runner output to produce the details.failures array. Each failure object must minimally have: { message: string, location: string?, raw: string }.
    4. Compute duration_ms from start to finish (wall clock).
    5. Ensure deterministic output ordering for failures (sort by filename/line if multiple).
- [ ] Add robust error handling: if the test runner itself crashes, set passed=false and include runner stderr in details.failures[0].raw.

## 3. Code Review
- [ ] Verify that VerificationNode does not mutate source files outside sandbox and that parse errors are handled gracefully.
- [ ] Confirm that the returned data shape is exactly as specified to enable automated gating in higher-level controllers.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for verification_node and ensure they pass:
  - Node: npm test -- --runTestsByPath tests/unit/test_verificationnode.spec.ts
  - Python: pytest -q tests/unit/test_verificationnode.py
- [ ] Save output to tests/results/verificationnode_results.txt

## 5. Update Documentation
- [ ] Update docs/TAS-052-verificationnode.md with parsing strategy, example runner outputs mapped to the structured result, and known runner idiosyncrasies.

## 6. Automated Verification
- [ ] Provide scripts/verify_verificationnode.sh to run the verification smoke tests described above and exit 0 only when both failing and passing cases behave as expected.
