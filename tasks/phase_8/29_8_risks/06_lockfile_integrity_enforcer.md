# Task: Enforce Lockfile Integrity & Verification (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-131]

## 1. Initial Test Written
- [ ] Create a unit test at tests/ci/lockfile.spec.ts that computes a SHA-256 checksum of a provided `tests/fixtures/package-lock.json` and asserts that `scripts/verify-lockfile.sh` returns 0 when the computed checksum matches the stored `.lockfile-checksum` fixture and non-zero when it does not.

## 2. Task Implementation
- [ ] Add `scripts/verify-lockfile.sh` which:
  - Computes `sha256sum` (or a cross-platform Node fallback) for `package-lock.json` / `yarn.lock` and compares against `.lockfile-checksum` stored at repository root.
  - Exits with non-zero status when mismatch occurs and prints an actionable message (e.g., "Lockfile mismatch: run npm ci && git add package-lock.json").
- [ ] Add an npm script `npm run verify-lockfile` that runs the script; hook this script into CI `preinstall` step.
- [ ] Provide a developer helper `scripts/update-lockfile-checksum.sh` to regenerate `.lockfile-checksum` after intentional updates.

## 3. Code Review
- [ ] Ensure script is cross-platform (use Node fallback when `sha256sum` is not available).
- [ ] Ensure the script will not incorrectly fail on different lockfile formats; detect and handle `package-lock.json` vs `yarn.lock`.
- [ ] Ensure the process does not store secrets or sensitive metadata in `.lockfile-checksum`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run verify-lockfile` against fixtures to validate both pass and fail scenarios.
- [ ] Integrate the verification step into CI so pull requests must pass lockfile verification before merging.

## 5. Update Documentation
- [ ] Add `docs/risks/lockfile-integrity.md` describing how lockfile integrity is enforced, how to update the checksum, and CI behavior when mismatch detected.

## 6. Automated Verification
- [ ] CI job must run `npm run verify-lockfile` and attach the script output to PR checks; add remediation steps to the PR check details when failing.
