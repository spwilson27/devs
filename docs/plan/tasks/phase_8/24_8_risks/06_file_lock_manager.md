# Task: Implement FileLockManager for file-level write locking (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-047]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/file-lock-manager.spec.ts verifying:
  - acquire(paths: string[], ownerId: string) returns true when locks free.
  - concurrent acquire by two owners for overlapping paths: first succeeds, second either waits or receives false depending on API; test both behaviors if configurable.
  - release(ownerId) frees locks and allows next waiter to acquire.
  - locks have optional timeouts and are auto-released on owner crash (simulated by calling a cleanup handler).

## 2. Task Implementation
- [ ] Implement src/lib/locks/fileLockManager.ts exporting a FileLockManager class with methods:
  - async acquire(ownerId: string, paths: string[], opts?: { timeoutMs?: number, wait?: boolean }): Promise<boolean>
  - async release(ownerId: string): Promise<void>
  - status(): { ownerId:string, paths:string[] }[] for diagnostics
  - Persist minimal lock metadata in-memory; design an optional adapter interface so persistence (SQLite) can be added later.
- [ ] Use normalized paths (call normalizePath) as lock keys. Ensure atomicity when acquiring multi-file locks (acquire all-or-none) to avoid partial lock states.

## 3. Code Review
- [ ] Ensure deadlock avoidance: implement ordered locking by sorted normalized path keys when acquiring multi-file locks. Verify try/finally usage to release locks on errors. Confirm timeouts and cleanup hooks are implemented.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/unit/file-lock-manager.spec.ts --run and confirm all concurrent scenarios pass.

## 5. Update Documentation
- [ ] Document FileLockManager API in docs/risks/file_locking.md with examples (acquire -> perform writes -> release) and configuration options (timeout, wait behavior).

## 6. Automated Verification
- [ ] Run a concurrency simulation script that spawns N async tasks that attempt to acquire overlapping locks and assert that no two owners ever hold overlapping locks simultaneously (check with status()).
