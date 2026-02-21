# Task: Implement EntropyDetector and integrate into TDD loop (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-064]

## 1. Initial Test Written
- [ ] Create unit tests at tests/tas/entropy_detector.spec.ts. Tests to write first:
  - Test A: "detector pauses after 3 identical failing outputs"
    - Arrange: instantiate EntropyDetector, call observe(taskId, output) three times with identical output strings
    - Act: call shouldPause(taskId)
    - Assert: expect true after 3 identical observations
  - Test B: "different outputs do not trigger pause"
    - Arrange: observe with 3 different outputs
    - Assert: shouldPause(taskId) === false
  - Test C: "hashes are persisted, only hashes stored (no raw outputs)"
    - Arrange: check underlying storage (in-memory DB) stores only sha256 hashes and counts

## 2. Task Implementation
- [ ] Implement src/tas/EntropyDetector.ts with:
  - class EntropyDetector {
      async observe(taskId: string, output: string): Promise<void>
      async shouldPause(taskId: string): Promise<boolean>
      async reset(taskId: string): Promise<void>
    }
  - Implementation details:
    1. Compute SHA-256 hex of `output` using Node's crypto module: `createHash('sha256').update(output).digest('hex')`.
    2. Persist only the hash and a counter in a dedicated DB table `entropy(task_id TEXT, hash TEXT, count INTEGER, last_seen INTEGER)`.
    3. On observe: upsert (hash,count=coalesce(count,0)+1, last_seen=now).
    4. shouldPause returns true when any hash count >= 3 for the taskId (configurable threshold), and then sets task state to 'suspended' in tasks table and emits an event `entropy:pause` with REQ:[TAS-064].
    5. Provide a configurable windowing policy (e.g., reset counts after N minutes) to avoid false positives.
    6. Do NOT store raw output in DB — only the hash and metadata for privacy/security.

## 3. Code Review
- [ ] Ensure hashing uses a standard cryptographic library, counts are arithmetic and safe from race conditions, DB operations are parameterized, and the detector is memory-efficient. Verify the detector never writes raw outputs to logs without redaction.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest tests/tas/entropy_detector.spec.ts --run` and ensure tests fail before implementation and pass after.

## 5. Update Documentation
- [ ] Add docs/tas/entropy_detector.md describing the algorithm, threshold, table schema, and integration points with DeveloperAgent and StrategyPivotAgent. Reference [TAS-064].

## 6. Automated Verification
- [ ] Add scripts/tas/verify_entropy_detector.js to:
    1. Reset entropy table, 
    2. Observe the same output thrice for a test taskId, 
    3. Assert shouldPause(taskId) === true, 
    4. Query tasks table to ensure the task is marked 'suspended' or a pause event exists. Exit non-zero on mismatch.
