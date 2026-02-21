# Task: Entropy Detection Accuracy Validation (Sub-Epic: 37_1_PRD)

## Covered Requirements
- [1_PRD-REQ-MET-015]

## 1. Initial Test Written
- [ ] Create a new test suite in `tests/entropy/detector_accuracy.test.ts`.
- [ ] Implement at least 100 mock scenarios containing simulated LLM outputs and state transitions (50 normal operations, 50 infinite loops/failed retries).
- [ ] Write a test asserting that the `EntropyDetector.evaluate(scenario)` identifies >95% of the infinite loop/failed retry scenarios correctly without false positives on normal operations.

## 2. Task Implementation
- [ ] Implement the `EntropyDetector.evaluate()` function (in `src/core/entropy.ts` or similar).
- [ ] Utilize hashing (e.g., SHA-256 of the last N terminal outputs or actions) and heuristic pattern matching to detect cyclical agent behavior.
- [ ] Tune the detection thresholds to achieve the required >95% accuracy against the benchmark dataset.

## 3. Code Review
- [ ] Ensure the hashing or heuristic algorithms are computationally efficient and do not block the main orchestrator loop.
- [ ] Verify that the detection logic handles edge cases like identical short log outputs that are actually valid (e.g., `[INFO] Building...`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test tests/entropy/detector_accuracy.test.ts` to ensure the new accuracy benchmarks pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/entropy.md` detailing the hashing strategy and heuristics used to achieve >95% accuracy.
- [ ] Add the benchmark results to the agent memory context.

## 6. Automated Verification
- [ ] Execute `node scripts/verify_entropy_benchmark.js` (or run the specific test with a coverage/accuracy reporter) to confirm the 95% threshold is met in CI.
