# Task: Implement Observation Hashing and Loop Detection (Sub-Epic: 34_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-078]

## 1. Initial Test Written
- [ ] Create `tests/core/orchestration/EntropyDetector.test.ts`.
- [ ] Write a test `should generate consistent SHA-256 hashes for identical tool/error outputs`.
- [ ] Write a test `should detect a loop when 3 consecutive error outputs produce the identical hash`.
- [ ] Write a test `should ignore timestamps or highly variable minor substrings (e.g. temporary file paths) when hashing by applying a normalization pre-filter`.

## 2. Task Implementation
- [ ] Create `src/core/orchestration/EntropyDetector.ts`.
- [ ] Implement a `hashOutput(output: string): string` method that first normalizes the input (stripping transient data like ANSI codes, timestamps, and UUIDs) and then generates a SHA-256 hash using the native Node.js `crypto` module.
- [ ] Implement an `analyzeHistory(history: string[]): boolean` method that tracks the rolling window of the last N (default 3) hashes.
- [ ] Integrate `EntropyDetector` into the `DeveloperAgent` turn lifecycle, ensuring every tool error output is evaluated before the agent formulates its next plan.
- [ ] Ensure the loop detection status is written to the SQLite `.devs/state.sqlite` database in the `entropy_events` table for auditability.

## 3. Code Review
- [ ] Verify that the normalizer regexes are robust enough to catch standard test runner timestamps and temporary file paths without destroying semantic meaning.
- [ ] Ensure `crypto` module usage does not leak memory or block the event loop on large outputs (use streaming hashing for strings over 1MB if necessary, or truncate safely).

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/core/orchestration/EntropyDetector.test.ts`.
- [ ] Confirm 100% pass rate.

## 5. Update Documentation
- [ ] Update `docs/architecture/entropy_detection.md` explaining the normalization and hashing heuristics used to evaluate error similarity.
- [ ] Ensure the agent's long-term memory records that observation hashing is active and dictates when to abort repetitive actions.

## 6. Automated Verification
- [ ] Run a synthetic script that pipes three identical compiler errors to the agent harness and assert that the script exits with an `ENTROPY_LOOP_DETECTED` signal rather than attempting a 4th implementation turn.