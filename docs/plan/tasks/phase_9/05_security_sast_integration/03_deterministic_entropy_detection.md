# Task: Implement Deterministic Entropy Detection Algorithm (Sub-Epic: 05_Security & SAST Integration)

## Covered Requirements
- [TAS-019]

## 1. Initial Test Written
- [ ] Write a test in `tests/core/orchestrator/entropy_detector.test.ts` that sequentially feeds 3 identical error string outputs to the detector.
- [ ] Assert that on the 3rd identical hash, the detector correctly emits a `STRATEGY_PIVOT` event and clears its internal ring buffer.
- [ ] Write a secondary test that feeds 3 different error strings and asserts no event is emitted.

## 2. Task Implementation
- [ ] Create `EntropyDetector` class in `src/core/orchestrator/entropy_detector.ts`.
- [ ] Implement the 4-step algorithm: 
  1. Method to ingest stdout/stderr.
  2. Method to strip variable data (like timestamps or UUIDs) using regex to extract the core error signature, then compute its SHA-256 hash using the native Node.js `crypto` module.
  3. Maintain a ring buffer of size 3 for the hashes.
  4. Compare the hashes; if all 3 match, return a signal (boolean or event emission) to trigger a strategy pivot.
- [ ] Integrate `EntropyDetector` into the main LangGraph execution loop, intercepting tool failure observations before passing them to the Agent.

## 3. Code Review
- [ ] Verify the deterministic stripping of timestamps/variable data is robust so that slightly varying error outputs from the same root cause are still hashed identically.
- [ ] Ensure that `crypto.createHash('sha256')` is used properly without memory leaks.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit tests/core/orchestrator/entropy_detector.test.ts` to validate the hashing and loop detection logic.
- [ ] Run type-checking `tsc --noEmit` to confirm integration with the LangGraph state interface.

## 5. Update Documentation
- [ ] Update the Orchestrator documentation in `docs/architecture/02_orchestration.md` to include a sequence diagram illustrating the `STRATEGY_PIVOT` interrupt flow.

## 6. Automated Verification
- [ ] Run a programmatic script `node scripts/verify_entropy.js` which feeds a mock error "Error: Cannot find module 'x'" three times to the `EntropyDetector` class.
- [ ] The script must exit with code 0 if it detects the `STRATEGY_PIVOT` payload, and code 1 if it fails to trigger.