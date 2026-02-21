# Task: Entropy Detection & Hash Tracking (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-022]

## 1. Initial Test Written
- [ ] Create `src/core/entropy/__tests__/entropy_detector.test.ts`.
- [ ] Write a test `should compute a stable SHA-256 hash for identical error outputs`.
- [ ] Write a test `should store the last N hashes per task in SQLite`.
- [ ] Write a test `should detect when the last 3 hashes are identical and emit an ENTROPY_LOOP_DETECTED event`.

## 2. Task Implementation
- [ ] Implement `src/core/entropy/EntropyDetector.ts`.
- [ ] Create a method `processOutput(output: string, taskId: string): boolean`.
- [ ] Inside `processOutput`, strip dynamic temporal data (like timestamps or temporary file paths) using regex, then calculate the SHA-256 hash of the cleaned output string.
- [ ] Store the `(taskId, hash, timestamp)` in the `entropy_events` SQLite table.
- [ ] Query the table for the last 3 entries for `taskId`. If all 3 hashes match, return `true` (loop detected), otherwise `false`.
- [ ] Integrate the `EntropyDetector` into the `SandboxProvider` output stream wrapper or the `ToolProxy` so that all terminal stderr/stdout from failing tool calls are automatically evaluated.

## 3. Code Review
- [ ] Check the regex stripping logic to ensure it reliably normalizes outputs (e.g., `Error at /tmp/sandbox-123/file.ts:14` should hash the same as `Error at /tmp/sandbox-456/file.ts:14`).
- [ ] Ensure hashing is performant and non-blocking, operating asynchronously if necessary.
- [ ] Verify that the `entropy_events` table schema supports fast lookups for the last 3 hashes (e.g., index on `taskId` and `timestamp`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit -- src/core/entropy/__tests__/entropy_detector.test.ts` and verify it correctly detects simulated loops.
- [ ] Run `npm run build` to verify type safety.

## 5. Update Documentation
- [ ] Update `docs/architecture/entropy_management.md` to describe the hash-based loop detection algorithm.
- [ ] Document the `entropy_events` table schema in `docs/database_schema.md`.

## 6. Automated Verification
- [ ] Run `npm run verify:schema` to ensure the `entropy_events` table migration script is valid and properly applies to a fresh SQLite database.
