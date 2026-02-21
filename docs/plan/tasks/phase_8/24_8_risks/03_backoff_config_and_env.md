# Task: Add backoff configuration and environment bindings (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-030]

## 1. Initial Test Written
- [ ] Write unit tests at tests/unit/backoff-config.spec.ts validating that environment variables (LLM_BACKOFF_BASE_MS, LLM_BACKOFF_MAX_MS, LLM_BACKOFF_ENABLED) are read and parsed correctly by a new config loader (src/lib/config/backoff.ts). Tests should mock process.env and verify fallback defaults (2000,60000,true).

## 2. Task Implementation
- [ ] Implement src/lib/config/backoff.ts exporting getBackoffConfig(): { baseMs:number; maxMs:number; enabled:boolean }. Parse integers safely and clamp values (baseMs >= 100, maxMs <= 300000). Integrate getBackoffConfig into the LLM client and computeBackoff usage.

## 3. Code Review
- [ ] Verify parsing is robust against invalid env values, that values are clamped/sanitized, and that config is memoized for performance. Ensure all keys are documented in .env.example.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/unit/backoff-config.spec.ts --run and ensure tests pass.

## 5. Update Documentation
- [ ] Add entries to .env.example and docs/risks/backoff.md documenting these environment variables and recommended ranges.

## 6. Automated Verification
- [ ] CI check: run a small Node script that sets process.env to example values, requires getBackoffConfig(), and prints the parsed values; assert printed values match expected parsed values.
