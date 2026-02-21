# Task: Implement EntropyDetector and StrategyPivot (Loop Detection) tests and spec (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Create tests at tests/tdd/entropy.detector.test.js (Jest) that validate deterministic entropy detection and strategy pivot behavior.
  - Test steps:
    1. Instantiate the EntropyDetector with configuration windowSize=5 and pivotThreshold=3.
    2. Feed the detector a sequence of outputs where three outputs are identical after normalization (strip timestamps, absolute paths), and others are distinct.
    3. Assert that after the 3rd identical normalized output the detector emits a `pivot` event or returns a status indicating a pivot is required.
    4. Validate the normalization logic by including noisy outputs with varying timestamps and path separators and asserting they collapse to the same hash.

- [ ] Run the test to confirm it fails before implementation.

## 2. Task Implementation
- [ ] Implement src/agents/entropy_detector.js (or .ts) exporting:
  - `class EntropyDetector { constructor({ windowSize, pivotThreshold }) }`
  - `observe(output: string): { pivot: boolean, hash: string }` which:
    - Normalizes output (trim, remove ISO timestamps via regex, canonicalize paths) and computes SHA-256 hash of normalized output.
    - Maintains a sliding window of last N hashes and counts repeats.
    - When a particular hash repeats >= pivotThreshold times within the window, returns pivot:true and emits a pivot event (EventEmitter) with the offending hash and recent outputs.
    - Keeps memory bounded (do not store raw outputs indefinitely) and stores only normalized outputs and their timestamps for audit limited to windowSize.

## 3. Code Review
- [ ] Ensure normalization rules are deterministic and well-documented. Add unit tests for normalization alone (e.g., tests/tdd/entropy.normalize.test.js).
- [ ] Verify that hashes are computed using a standard crypto library and that there are no time-based nondeterministic elements in the returned metadata.
- [ ] Confirm pivot events include the offending normalized hash and a deterministic excerpt of the last outputs for RCA.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/tdd/entropy.detector.test.js --runInBand` and supporting normalization tests; ensure all pass.
- [ ] Add a CI step that replays the test with synthetic noisy outputs to guard against regressions.

## 5. Update Documentation
- [ ] Add docs/tas/entropy_detector.md describing normalization rules, hashing algorithm (SHA-256), sliding-window semantics, pivotThreshold, and how downstream agents should respond to a pivot event.
- [ ] Cross-link this doc from the PRD strict TDD fragment and CodeNode/TestNode docs.

## 6. Automated Verification
- [ ] CI should run the detector tests and then run a small integration harness that simulates three identical failures in a DeveloperAgent turn sequence and assert that StrategyPivot is invoked (e.g., a callback or event listener triggered).