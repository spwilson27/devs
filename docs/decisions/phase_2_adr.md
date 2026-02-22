# ADR-WC-003: WebContainerDriver E2E Test Gating

Status: Proposed

Context
-------
WebContainer-based end-to-end (E2E) tests require a browser-like environment (Playwright, jsdom with WebContainer availability, or real browser CI runners) and can be flaky on CI while the required environment is validated and hardened.

Decision
--------
- Gate WebContainerDriver E2E tests behind the RUN_E2E=true environment variable.
- Add a dedicated CI job `webcontainer-e2e` that runs the E2E suite and is marked `continue-on-error: true` until WebContainer CI support is confirmed stable.
- Document that the `continue-on-error` flag will be removed once the E2E job demonstrates stability for three consecutive runs.

Consequences
------------
- E2E tests will not block the main CI gate while we validate runner stability.
- Developers can opt-in to run E2E tests locally or in CI by setting RUN_E2E=true.
