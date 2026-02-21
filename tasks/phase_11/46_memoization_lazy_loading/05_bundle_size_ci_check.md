# Task: Add automated bundle-size check and CI enforcement for Webview (Sub-Epic: 46_Memoization_Lazy_Loading)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-007]

## 1. Initial Test Written
- [ ] Create a node script scripts/check_bundle_size.js that reads the build output (dist/) and asserts the initial entry chunk(s) combined size is below a configurable threshold (e.g., 300 KB gzipped).
  - Create unit tests for the script under scripts/__tests__/check_bundle_size.test.js that feed a fake manifest and assert the script passes and fails correctly.

## 2. Task Implementation
- [ ] Implement scripts/check_bundle_size.js with behavior:
  - Read dist/manifest.json (or parse dist directory for entryPoint filenames).
  - Compute gzipped size of each entry asset using zlib.gzipSync(Buffer.from(fileContents)).length.
  - Sum sizes for the initial entry points and fail with process.exit(2) if over threshold.
- [ ] Add to the webview package.json scripts: "check:bundle": "node ../../scripts/check_bundle_size.js --max=300" (adjust path per monorepo layout).
- [ ] Add a CI step in the webview/build job that runs: npm run build && npm run check:bundle (or the workspace equivalent).

## 3. Code Review
- [ ] Validate the script is robust against missing manifest formats and prefers manifest.json when present.
- [ ] Ensure the script prints a clear table showing the offending chunks and sizes when the threshold is exceeded.
- [ ] Ensure exit codes are non-zero on failure to fail CI.

## 4. Run Automated Tests to Verify
- [ ] Locally run: npm --workspace packages/webview run build && node scripts/check_bundle_size.js --max=300 and confirm success/failure behaviors.

## 5. Update Documentation
- [ ] Add docs/build-size.md documenting the threshold rationale, how to update it, and guidance to split chunks further.

## 6. Automated Verification
- [ ] Add the check:bundle step to CI as a gating step so PRs cannot merge with an oversized initial bundle.