# Task: Add documentation, CI jobs, and automated verification for Git-SQLite synchronization (Sub-Epic: 06_3_MCP)

## Covered Requirements
- [3_MCP-TAS-094]

## 1. Initial Test Written
- [ ] Create a CI smoke test at tests/ci/test_sync_integration_smoke.py which:
  - Validates that the integration scripts (verify_migration.sh, verify_git_utils.sh, verify_commitnode.sh, verify_atomicity.sh, verify_rewind.sh) exist and are executable.
  - Runs the fastest of the integration checks in a temp environment to ensure the CI job will be healthy.

## 2. Task Implementation
- [ ] Add or update CI workflow `.github/workflows/sync-integration.yml` that:
  - Runs on push to main and on-demand via workflow_dispatch.
  - Sets up Python, installs test deps, and runs the integration verification scripts in a disposable workspace.
  - Uses a matrix job to run on ubuntu-latest and macos-latest (if necessary), and includes steps to install git.
- [ ] Add `scripts/verify_sync.sh` that runs the full verification suite in order and exits non-zero on the first failure.
- [ ] Add a `docs/mcp/git_sqlite_sync.md` that explains the design decisions, limitations (DB snapshot size), and operator runbook (how to manually repair inconsistent states).

## 3. Code Review
- [ ] Ensure CI does not leak secrets (no database snapshots containing secrets committed to repo).
- [ ] Ensure CI runs fast enough for frequent commits—split expensive tests to a nightly job if needed.
- [ ] Ensure workflow retries are conservative and failures are actionable.

## 4. Run Automated Tests to Verify
- [ ] Run `./scripts/verify_sync.sh` locally (or run the GitHub Actions job via `act` if available) and confirm all verification scripts pass.

## 5. Update Documentation
- [ ] Add badges or status lines in README describing the sync-integration CI job and provide links to the runbook.
- [ ] Document how to run the verification scripts locally and in CI.

## 6. Automated Verification
- [ ] Ensure `.github/workflows/sync-integration.yml` calls `./scripts/verify_sync.sh` and that script reports clear results suitable for automation dashboards.
