# Task: Integrate Manifest Orchestrator with FileLockManager (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-047], [8_RISKS-REQ-048]

## 1. Initial Test Written
- [ ] Write integration tests at tests/integration/manifest-locking.spec.ts verifying that DependencyOrchestrator acquires the FileLockManager lock for the manifest path before applying changes and releases it after completion; concurrent orchestrator attempts must be serialized.

## 2. Task Implementation
- [ ] Modify DependencyOrchestrator.applyChange to call FileLockManager.acquire(ownerId, [manifestPath]) before applying and to release after success/failure. Ensure the orchestrator respects lock acquisition timeouts and logs PAUSED_FOR_LOCK when waiting.

## 3. Code Review
- [ ] Verify locking is applied only to manifest files (package.json, lockfile), that release happens in finally, and that the orchestrator behaves properly if it cannot obtain the lock (e.g., retries with backoff or fails fast according to config).

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/integration/manifest-locking.spec.ts --run and ensure serialization and lock semantics are enforced.

## 5. Update Documentation
- [ ] Update docs/risks/manifest_serialization.md to document how manifest updates are protected by FileLockManager and include a sequence diagram for the enqueue->acquire->apply->release flow.

## 6. Automated Verification
- [ ] Execute the concurrent manifest workload from previous tests but instrument FileLockManager.status() during the run and assert no overlapping owners for the same manifest path.
