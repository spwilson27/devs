# Task: SAOP Payload Hash Tracking Infrastructure (Sub-Epic: 14_Entropy Detection and Pivot)

## Covered Requirements
- [3_MCP-TAS-019]

## 1. Initial Test Written
- [ ] Create `src/reliability/entropy/__tests__/SaopHashTracker.test.ts`.
- [ ] Write a unit test that instantiates `SaopHashTracker` and verifies it initializes with an empty ring buffer of capacity 3.
- [ ] Write a unit test that calls `recordObservation(payload: string)` with three identical payloads and asserts `getHashes()` returns an array of three identical SHA-256 hex strings.
- [ ] Write a unit test that calls `recordObservation` with four payloads and asserts the ring buffer only retains the most recent 3 (FIFO eviction).
- [ ] Write a unit test that calls `recordObservation` with three different payloads and asserts `getHashes()` returns three distinct hashes.
- [ ] Write a unit test verifying that calling `reset()` clears the buffer so `getHashes()` returns an empty array.

## 2. Task Implementation
- [ ] Create `src/reliability/entropy/SaopHashTracker.ts`.
- [ ] Import Node.js `crypto` module (no external dependencies).
- [ ] Define a `SaopHashTracker` class with:
  - `private readonly capacity: number` defaulting to `3`.
  - `private hashes: string[]` as the ring buffer (simple array, shift on overflow).
  - `recordObservation(payload: string): void` — computes `sha256(payload)` as a hex digest and appends to `this.hashes`; if length exceeds `capacity`, shift the oldest entry.
  - `getHashes(): ReadonlyArray<string>` — returns a readonly copy of the buffer.
  - `reset(): void` — clears `this.hashes`.
- [ ] Export `SaopHashTracker` as a named export.
- [ ] Add a barrel export in `src/reliability/entropy/index.ts`.

## 3. Code Review
- [ ] Verify no external hashing library is used; only Node.js built-in `crypto.createHash('sha256')`.
- [ ] Confirm the buffer never grows beyond `capacity` entries regardless of call count.
- [ ] Confirm `getHashes()` returns a copy (not a direct reference) to prevent mutation from callers.
- [ ] Confirm the class has no side-effects outside its own state (pure, deterministic).
- [ ] Confirm all public methods are documented with JSDoc.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="SaopHashTracker"` and verify all tests pass with zero failures.
- [ ] Run `npm run lint src/reliability/entropy/SaopHashTracker.ts` and confirm zero lint errors.

## 5. Update Documentation
- [ ] Update `src/reliability/entropy/entropy.agent.md` (create if absent) with a section describing `SaopHashTracker`: its purpose, the SHA-256 ring-buffer approach, capacity default, and the `reset()` lifecycle hook.
- [ ] Add `SaopHashTracker` to the module index in any existing architecture decision record (ADR) under `docs/adr/`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="SaopHashTracker"` and confirm 100% statement coverage for `SaopHashTracker.ts`.
- [ ] Run `grep -r "SaopHashTracker" src/reliability/entropy/index.ts` to confirm the barrel export exists.
