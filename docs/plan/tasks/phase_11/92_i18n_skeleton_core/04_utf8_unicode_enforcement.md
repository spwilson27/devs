# Task: Enforce UTF-8 Encoding and Universal Unicode Support Across All Artifacts (Sub-Epic: 92_i18n_Skeleton_Core)

## Covered Requirements
- [4_USER_FEATURES-REQ-049]

## 1. Initial Test Written
- [ ] Create `packages/core/src/__tests__/unicode/utf8-enforcement.test.ts`.
- [ ] **File I/O tests**:
  - Import all file-read helpers (e.g., `readArtifact`, `writeArtifact`) from `packages/core/src/io/`.
  - Write a test that calls `writeArtifact('test-unicode.md', '# 你好 مرحبا こんにちは 🌍')` and then `readArtifact('test-unicode.md')`.
  - Assert the round-trip preserves the exact multi-script string (CJK, Arabic RTL, emoji, Latin diacritics).
  - Assert `readArtifact` returns a `string` (not a `Buffer`) and that its encoding is UTF-8 (validate by checking `.length` vs. `Buffer.byteLength(str, 'utf8')` differ for multi-byte chars, confirming Unicode code points are preserved).
- [ ] **Log output tests**:
  - Import the logger from `packages/core/src/logging/`.
  - Call `logger.info('Test: αβγ δεζ — résumé naïve')`.
  - Assert the log sink (in-memory or temp file) captures the exact string without garbling.
- [ ] **Spec/document content tests**:
  - Write a test that creates a mock spec document with a mixture of scripts: Latin, Greek, Hebrew, Arabic, Devanagari, CJK, and emoji (`🤖`, `✅`).
  - Write and read back via the artifact layer; assert byte-exact round-trip fidelity.
- [ ] **Webview rendering tests** (in `packages/vscode/webview/`):
  - Render `<ThoughtStreamer thoughts={['你好世界', 'مرحبا بك', 'こんにちは🌍']} />` with `renderWithI18n`.
  - Assert each string appears verbatim in the rendered DOM (no question marks or replacement characters `\uFFFD`).
- [ ] Create `packages/core/src/__tests__/unicode/bom-absence.test.ts`:
  - Read back artifacts written by `writeArtifact` as a `Buffer`.
  - Assert the first three bytes are NOT the UTF-8 BOM (`0xEF 0xBB 0xBF`). Artifacts must be BOM-free UTF-8.

## 2. Task Implementation
- [ ] Audit `packages/core/src/io/` for all `fs.readFile` / `fs.writeFile` calls:
  - All `fs.readFile` calls must explicitly pass `{ encoding: 'utf8' }` (or the `'utf8'` string shorthand).
  - All `fs.writeFile` calls must explicitly pass `{ encoding: 'utf8' }`.
  - If any call uses `'utf-8'` (with hyphen), normalise to `'utf8'` (Node.js canonical spelling) for consistency.
- [ ] Audit `packages/core/src/logging/` for stream creation:
  - Any `fs.createWriteStream` used by the logger must include `{ encoding: 'utf8' }` in its options.
- [ ] Add an ESLint rule (or `eslint-plugin-node` configuration) in `packages/core/.eslintrc.*` to flag any `fs.readFile` / `fs.writeFile` / `fs.createWriteStream` call that lacks an explicit encoding option. Add the rule `"no-restricted-syntax"` with a selector targeting those call patterns, or use a custom rule file at `packages/core/eslint-rules/enforce-utf8-encoding.js`.
- [ ] In the Webview (`packages/vscode/webview/`), confirm `<meta charset="UTF-8" />` is present in the HTML template used to bootstrap the Webview panel (`src/webview.html` or equivalent).
- [ ] In all `tsconfig.json` files across the monorepo, confirm or add `"charset": "utf8"` is not needed (TypeScript source files default to UTF-8) but verify no file has a BOM by running:
  ```bash
  grep -rIl $'\xef\xbb\xbf' packages/
  ```
  Remove any BOM from identified files using `sed -i '1s/^\xef\xbb\xbf//' <file>`.
- [ ] In `packages/vscode/webview/`, confirm `vite.config.ts` (or the bundler config) does not specify a non-UTF-8 output charset.
- [ ] Add a CI pre-check script `scripts/check-utf8.sh`:
  ```bash
  #!/usr/bin/env bash
  # Fails if any source or artifact file contains non-UTF-8 bytes
  find packages/ -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" | \
    xargs file --mime-encoding | grep -v "utf-8\|us-ascii\|binary" && exit 1 || exit 0
  ```
  Make executable with `chmod +x scripts/check-utf8.sh`.

## 3. Code Review
- [ ] Confirm every `fs.readFile` / `fs.writeFile` / `fs.appendFile` in `packages/core/` has an explicit `'utf8'` encoding option.
- [ ] Confirm the logger's write stream uses `'utf8'`.
- [ ] Confirm `<meta charset="UTF-8" />` is in the Webview HTML shell.
- [ ] Confirm the `check-utf8.sh` script is executable and referenced in `package.json` scripts or the CI workflow.
- [ ] Confirm the ESLint rule for encoding enforcement is active (run `npx eslint packages/core/src --rule '...'` manually to verify it fires on a synthetic violation).

## 4. Run Automated Tests to Verify
- [ ] Run Unicode unit tests:
  ```bash
  cd packages/core && npm test -- --testPathPattern="unicode/"
  ```
- [ ] Run the Webview unicode rendering tests:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="unicode/"
  ```
- [ ] Run the UTF-8 CI script:
  ```bash
  bash scripts/check-utf8.sh
  ```
  Must exit with code `0`.
- [ ] Run TypeScript compilation across all packages:
  ```bash
  npm run build --workspaces --if-present
  ```

## 5. Update Documentation
- [ ] Create `docs/engineering/utf8-unicode-policy.md`:
  - State the policy: "All file I/O MUST use explicit `'utf8'` encoding. All artifacts (specs, logs, code) MUST be BOM-free UTF-8."
  - List the enforcement mechanisms: ESLint rule, CI script, and test suite.
  - Document the multi-script test fixture strings used to validate round-trip fidelity.
- [ ] Add a pointer to this policy in `packages/core/README.md` under an "Encoding" section.
- [ ] Update `packages/vscode/webview/src/i18n/i18n.agent.md` with a note: "The webview HTML shell must always declare `<meta charset='UTF-8'>`. The underlying data transport from the extension host delivers UTF-8 strings."

## 6. Automated Verification
- [ ] Run:
  ```bash
  cd packages/core && npm test -- --testPathPattern="unicode/" --json --outputFile=/tmp/utf8_unicode_results.json
  ```
- [ ] Validate:
  ```bash
  node -e "const r = require('/tmp/utf8_unicode_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"
  ```
- [ ] Run the CI UTF-8 check and assert exit code `0`:
  ```bash
  bash scripts/check-utf8.sh; echo "Exit: $?"
  ```
- [ ] Run ESLint on `packages/core/src/` and confirm the encoding rule fires on a synthetic test file containing `fs.readFile('x', () => {})` (no encoding):
  ```bash
  echo "fs.readFile('test.txt', () => {});" > /tmp/synthetic_violation.js && \
  npx eslint --rulesdir packages/core/eslint-rules /tmp/synthetic_violation.js && \
  echo "FAIL: rule did not fire" || echo "PASS: rule fired correctly"
  ```
