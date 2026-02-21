# Task: Implement devs doctor Command (Sub-Epic: 03_CLI State Control & Commands)

## Covered Requirements
- [4_USER_FEATURES-REQ-005]

## 1. Initial Test Written
- [ ] Create unit tests in `packages/cli/src/commands/__tests__/doctor.test.ts` to verify diagnostic logic.
- [ ] Mock the `Docker` service to simulate both available and unavailable states.
- [ ] Mock the `GeminiAPI` client to simulate connectivity success and failure (e.g., invalid API key).
- [ ] Test `.devs/` integrity check: Create a test case with missing or corrupt `state.sqlite` and verify `devs doctor` reports it.

## 2. Task Implementation
- [ ] Register the `doctor` command in `packages/cli/src/index.ts`.
- [ ] Implement the `DoctorService` in `packages/cli/src/services/DoctorService.ts`.
- [ ] Implement Docker/WebContainer availability check (e.g., running `docker info`).
- [ ] Implement API connectivity check (e.g., a simple `models.list` call to Gemini).
- [ ] Implement `.devs/` directory audit:
    - Check permissions (0700).
    - Check existence of `state.sqlite` and `lancedb/`.
    - Run a PRAGMA integrity_check on the SQLite database.
- [ ] Use `Ink` components to display a professional, color-coded diagnostic report with [PASS], [FAIL], and [WARN] badges.

## 3. Code Review
- [ ] Ensure the doctor command does not perform any destructive actions; it should only report status.
- [ ] Verify that sensitive info (like API keys) is NOT printed in the report (only masked or status-only).
- [ ] Check that the command handles missing dependencies gracefully (e.g., if `docker` is not in the PATH).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/commands/__tests__/doctor.test.ts`.
- [ ] Execute `devs doctor` on the local machine and verify output accuracy.

## 5. Update Documentation
- [ ] Add `devs doctor` to the CLI help text and `docs/cli/commands.md`.
- [ ] Document common failure modes and their suggested fixes based on the doctor's output.

## 6. Automated Verification
- [ ] Run a shell script that intentionally breaks the environment (e.g., renames `.devs/state.sqlite`), runs `devs doctor`, and verifies that it exits with a non-zero code and identifies the correct error.
