# Task: End-to-End Integration Tests for Markdown Preview Engine (Sub-Epic: 61_Markdown_Preview_Engine)

## Covered Requirements
- [1_PRD-REQ-INT-008], [6_UI_UX_ARCH-REQ-016], [6_UI_UX_ARCH-REQ-082], [6_UI_UX_ARCH-REQ-077]

## 1. Initial Test Written
- [ ] Create an E2E test at `tests/e2e/markdown_preview_e2e.test.ts` that launches a headless environment (Playwright or `@vscode/test-electron`) and performs the following: open a markdown file in the extension editor, type additional markdown content, verify incremental chunks arrive in the preview, confirm syntax highlighting updates when theme toggles, and finally trigger `Regenerate` and confirm the preview updates deterministically.

## 2. Task Implementation
- [ ] Implement the E2E scaffolding and helper scripts to launch the extension in a CI-friendly headless runner. Add deterministic fixtures for SAOP streams and VSCode theme payloads. Provide a small orchestration harness that can assert timing constraints (e.g., chunk rendered within 100ms) and expose retry/backoff to reduce flakiness.

## 3. Code Review
- [ ] Ensure E2E tests are resilient (explicit waits for elements, deterministic fixtures), avoid heavy timeouts, and add idempotent teardown logic. Confirm tests fail fast on assertion failures and provide useful logs and snapshot diffs for debugging.

## 4. Run Automated Tests to Verify
- [ ] Execute the E2E suite locally via `yarn test:e2e` and in CI. Ensure the test completes within acceptable runtime (target <5 minutes) and returns non-flaky results on 3 successive runs.

## 5. Update Documentation
- [ ] Add `docs/testing/markdown-preview-e2e.md` describing how to run the E2E tests locally, interpret failures, and update fixtures when UX changes require snapshot updates.

## 6. Automated Verification
- [ ] Add a CI job (or extend existing test job) to run `tests/e2e/markdown_preview_e2e.test.ts` on pushes to main and PRs touching `packages/ui` or `extensions/vscode`. The job must upload failure artifacts (webview HTML snapshots and serialized SAOP traces) when a run fails.
