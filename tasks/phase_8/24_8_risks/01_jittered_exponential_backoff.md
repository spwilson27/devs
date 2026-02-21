# Task: Implement jittered exponential backoff library (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-030]

## 1. Initial Test Written
- [ ] Create unit tests at tests/utils/backoff.spec.ts using Vitest. Tests must be deterministic by mocking Math.random (Vitest's vi.spyOn(Math, 'random').mockReturnValue(...)). Write the following assertions:
  - computeBackoff(attempt: number, opts?) is exported from src/lib/backoff.ts and returns a number (milliseconds).
  - Default behavior: baseMs = 2000, maxMs = 60000, algorithm = "full jitter" (i.e., maxDelay = min(maxMs, baseMs * 2 ** (attempt - 1)); return Math.floor(Math.random() * maxDelay)).
  - For attempt = 1, when Math.random() is mocked to 0.0 expect 0 <= delay <= 2000, when Math.random() mocked to 1.0 expect delay <= 2000.
  - For a large attempt such that baseMs * 2**(attempt-1) > maxMs, assert returned delay <= 60000.
  - Validate type and boundary conditions (attempt <= 0 throws, non-numeric input throws).

## 2. Task Implementation
- [ ] Implement src/lib/backoff.ts with the exported function:
  - export function computeBackoff(attempt: number, opts?: { baseMs?: number; maxMs?: number; }): number
  - Default opts: baseMs = 2000, maxMs = 60000. Use the "full jitter" strategy described above. Ensure implementation allows Math.random to be mocked for tests and avoid any side-effects (no sleeps).
- [ ] Add an async helper sleep(ms: number) in src/lib/sleep.ts to be used by higher-level clients; keep it trivial (return new Promise(r => setTimeout(r, ms))).

## 3. Code Review
- [ ] Verify the implementation uses the full-jitter algorithm, that default constants match spec (2s base, 60s max), and that the function is pure and testable (Math.random injectable/mocked). Ensure proper TypeScript typings and JSDoc comments describing defaults and algorithm.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/utils/backoff.spec.ts --run
  - Confirm tests pass (exit code 0) locally.

## 5. Update Documentation
- [ ] Add or update docs/specs/8_risks_mitigation.md (or docs/risks/backoff.md) with: default base=2000ms, max=60000ms, algorithm name (full jitter), and environment/config keys (LLM_BACKOFF_BASE_MS, LLM_BACKOFF_MAX_MS).

## 6. Automated Verification
- [ ] After tests pass, run a small verification script: node -e "const b=require('./src/lib/backoff'); for(let i=1;i<=10;i++){const v=b.computeBackoff(i); if(v<0||v>60000){console.error('BACKOFF_OUT_OF_RANGE',i,v); process.exit(2)}} console.log('BACKOFF_VERIFIED');" and assert it prints BACKOFF_VERIFIED and exits 0.
