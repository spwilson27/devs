# Task: Implement UI and CLI Sign-off Components (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-UI-002], [1_PRD-REQ-UI-017], [1_PRD-REQ-NEED-ARCH-02]

## 1. Initial Test Written
- [ ] Create end-to-end tests `tests/e2e/test_ui_signoff.py` using the project's e2e framework (Playwright/Cypress/pytest+requests acceptable). Tests:
  - `test_cli_signoff_sets_freeze`: Run CLI command `devs approve --token <token> --user test-user` (simulate or call CLI entrypoint) and assert backend shows ApprovalRequest `status=='approved'` and system `architecture_freeze` flag is set.
  - `test_ui_signoff_button`: If the project has a web review dashboard, automate clicking the `Sign-off` button for a sample PRD/TAS and assert the API receives approval and the UI displays `Frozen` state; otherwise run an integration test that simulates the same HTTP POST.
  - `test_vscode_signoff_command`: If a VSCode extension exists, stub command activation and assert the `devs.signOff` command issues the approval API call.

## 2. Task Implementation
- [ ] Implement a sign-off component for UI and a CLI integration:
  - Web UI: `src/ui/components/SignOffButton.{tsx,js}` that opens a confirmation modal showing the document summary, changed blocks, and a single-click `Sign and Freeze` action which calls `POST /api/approvals/{token}/approve` with `{approver, method: 'web'}` and on success sets a `frozen` flag in the local state.
  - CLI: add `devs approve` command in `src/cli/approve.py` (or existing CLI framework) which accepts `--token`, `--user`, optional `--blocks` and calls the above API; return non-zero on failure.
  - VSCode extension: add a `Sign-off` command `devs.signOff` that calls the same API and shows a native notification on success.
- [ ] Persist a system-level `architecture_freeze` flag in the DB (`system_settings` table) when a full ApprovalRequest is approved; this flag should be checked by developer agents and the Distiller gate.

## 3. Code Review
- [ ] Verify: confirmation modal includes a digest of changed blocks, UI prevents double-click (idempotency), CLI provides clear error codes, and all sign-off flows are audited (log `approved_by`, `method`, `ip`/actor info).

## 4. Run Automated Tests to Verify
- [ ] Run e2e tests `pytest -q tests/e2e/test_ui_signoff.py` (or `npx playwright test` when Playwright is used) and ensure both CLI and UI flows pass.

## 5. Update Documentation
- [ ] Add `docs/user_signoff.md` describing CLI usage, UI sign-off flow, VSCode command, and the effects of `architecture_freeze` including how to revoke or re-open (if allowed by policy).

## 6. Automated Verification
- [ ] Add a CI e2e job `scripts/ci_run_signoff_e2e.sh` that runs the e2e tests in a reproducible environment and asserts the `architecture_freeze` flag toggles as expected.
