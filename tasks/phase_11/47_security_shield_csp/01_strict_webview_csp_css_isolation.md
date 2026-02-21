# Task: Implement strict Webview CSP and generated app CSS isolation (Sub-Epic: 47_Security_Shield_CSP)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-081]

## 1. Initial Test Written
- [ ] Add a unit test `webview-csp.test.ts` under `packages/vscode/__tests__/` (or the extension package test folder) that calls the webview HTML generation function (e.g., `createWebviewHtml({nonce})`) and asserts:
  - The returned HTML contains a single <meta http-equiv="Content-Security-Policy"> tag.
  - The CSP content string includes at minimum the directives: `default-src 'none'`, `script-src 'nonce-${nonce}' 'self'`, `style-src 'nonce-${nonce}' 'self'`, `img-src 'self' data:`, and a minimal `connect-src` whitelist for allowed MCP endpoints.
  - No `unsafe-inline` or `unsafe-eval` tokens are present in the final CSP string.
- [ ] Add a unit/integration test `webview-css-scope.test.ts` that builds or simulates the generated CSS and asserts that all top-level selectors are either placed into a Shadow DOM root or prefixed with a single deterministic scope token (example: `.devs-<hash>`) produced by the CSS build pipeline. The test should run the CSS post-processing script (PostCSS plugin or Webpack loader) and validate the first 50 selectors are scoped.

## 2. Task Implementation
- [ ] Implement a deterministic nonce generator utility `packages/vscode/src/utils/nonce.ts` that returns a cryptographically random, base64-like nonce per-webview creation and is testable via an injectable RNG for unit tests.
- [ ] Update the webview HTML generator (`packages/vscode/src/webview/provider.ts` or equivalent) to:
  - Generate a nonce for each webview instance.
  - Inject a strict CSP meta tag into the HTML head using the generated nonce. Example CSP (tweak to project endpoints):
    - `default-src 'none'; script-src 'nonce-${nonce}' 'self' vscode-resource:; style-src 'nonce-${nonce}' 'self'; img-src 'self' data:; connect-src 'self' https://mcp.devs.internal; frame-ancestors 'none'; base-uri 'none';`
  - Add the same `nonce` attribute to the generated `<script>` and any inlined `<style>` tags produced at runtime.
- [ ] Implement CSS isolation by ONE of the following approaches (choose the one that fits the existing build):
  1. Shadow DOM mounting: modify the webview boot script to attach a shadow root to the webview container and mount React inside the shadow root; adapt the bundler to emit a single critical CSS style tag that is injected into the shadow root with the same nonce.
  2. PostCSS scoping: add a PostCSS step (postcss-prefixwrap or similar) to prefix all generated selectors with a deterministic scope class `.devs-<hash>` and ensure the webview container uses that class at runtime.
- [ ] Update build config (webpack/vite) to emit the scoped CSS artifact and expose a deterministic scope token to the webview HTML generator so tests can assert the scope token.
- [ ] Ensure that Tailwind/Tokens integration remains Theme-aware: do not hardcode colors; use `--vscode-*` tokens and map them inside the shadow root or scoped CSS.

## 3. Code Review
- [ ] Verify CSP correctness: no `unsafe-eval` or `unsafe-inline` in production policy; script/style tags use nonce attributes; `frame-ancestors 'none'` and `base-uri 'none'` are present.
- [ ] Confirm nonce generation uses crypto-secure RNG and is unique per webview instance and not derived from predictable data.
- [ ] Confirm CSS isolation approach does not leak styles to the host VSCode window (Shadow DOM or deterministic scoping verified).
- [ ] Ensure build changes do not regress bundle size by more than a reasonable threshold (+10%); document any increases.
- [ ] Confirm automated tests cover both HTML generation and the CSS scoping step.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `cd packages/vscode && npm run test -- --runInBand` (or the monorepo test command used by the repo).
- [ ] Run the CSS scoping test by invoking the PostCSS pipeline locally: `node scripts/build-scoped-css.js --test` (or `npm run build:css -- --test`) and ensure the `webview-css-scope.test.ts` passes.

## 5. Update Documentation
- [ ] Update `docs/security.md` (or create it under `docs/ui-security.md`) with the CSP policy text, rationale, and developer instructions for adding new allowed `connect-src` endpoints or resources.
- [ ] Add a short dev note in `packages/vscode/README.md` describing the nonce lifecycle and the chosen CSS isolation strategy and how to run local verification scripts.

## 6. Automated Verification
- [ ] Add `scripts/verify-webview-csp.js` that loads the built `webview/index.html` (or the string produced by `createWebviewHtml`) and programmatically asserts:
  - A CSP meta tag exists and contains the exact mandated directives.
  - All `<script>` and `<style>` tags include the same nonce value.
  - CSS scoping is present (either the container has the `.devs-<hash>` class or the page uses a ShadowRoot).
- [ ] Run `node scripts/verify-webview-csp.js` as part of CI for the `phase_11` pipeline and fail the build if any assertion fails.
