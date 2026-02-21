# Task: Implement image redaction sanitization buffer for Webview image assets (Sub-Epic: 47_Security_Shield_CSP)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-079]

## 1. Initial Test Written
- [ ] Create unit tests `image-sanitizer.unit.test.ts` under `packages/shared/__tests__/` (or a shared utilities test folder). Tests should:
  - Load a set of fixture images that include EXIF metadata and a simple synthetic face/region marker (png/jpg fixtures under `tests/fixtures/images/`).
  - Call the exported `sanitizeImage(buffer, options)` API and assert that the returned Buffer no longer contains EXIF metadata (use `exif-parser` or `exiftool-vendored` in the test).
  - For the face-redaction mode, assert that the returned image has a blurred or opaque rectangle applied to expected face coordinates (compare pixel averages on the rectangle vs original image area).
- [ ] Add an integration test `image-sanitizer-ipc.test.ts` that simulates the webview posting an image to the extension host IPC and asserts the extension host returns a `vscode-resource:` or otherwise safe webview URI pointing to the sanitized image and that the webview will not embed the original raw data URI.

## 2. Task Implementation
- [ ] Implement `packages/shared/src/imageSanitizer.ts` with the following responsibilities:
  1. `sanitizeImage(buffer, options)` API that:
     - Strips all EXIF metadata using `sharp().withMetadata(false)` or `exiftool` APIs.
     - Optionally runs a lightweight face-detection pass (configurable via `options`) using a pure-Node library (e.g., `@vladmandic/face-api` in Node build or an external service if acceptable); if face(s) detected, overlay a blurred patch or opaque box at the detected bounding boxes.
     - Returns a sanitized Buffer and a deterministic manifest: `{ buffer, width, height, redactionRegions: [{x,y,w,h}], sanitizedSha256 }`.
  2. Implement a small in-memory/ephemeral disk cache `redactionBuffer` (TTL-based) that stores sanitized images and exposes a stable id/token for retrieval (example: `redaction://<sha256>`). The cache should:
     - Store sanitized images under a temp directory controlled by the extension host (not arbitrary user paths).
     - Expire entries after a configurable TTL (default: 1 hour) and provide periodic cleanup.
  3. Add an extension host IPC handler (`packages/vscode/src/handlers/imageHandler.ts`) that receives posted image buffers from the webview, calls `sanitizeImage`, stores the result in the `redactionBuffer`, and returns a webview-safe URI produced by `vscode.Uri.file(tempPath)` then `webview.asWebviewUri(uri)`.
  4. Ensure all image handling runs off the main extension thread (use `worker_threads` or spawn a child process) to avoid blocking the extension host.
- [ ] Ensure sanitized images are never embedded as raw `data:` URIs by default (unless explicitly allowed and sanitized), to reduce leakage risk.

## 3. Code Review
- [ ] Ensure EXIF metadata is removed in all formats (jpg/png/heic where supported), and no sensitive metadata remains.
- [ ] Verify face redaction is deterministic in tests and that redactionRegions are stored in the manifest for auditability.
- [ ] Confirm the redaction buffer uses a dedicated temp directory with limited permissions, TTL enforcement, and no symlink following vulnerabilities.
- [ ] Verify that the image pipeline runs in a worker and measures for CPU/memory bounding are applied to avoid DoS via large images.

## 4. Run Automated Tests to Verify
- [ ] Unit tests: `cd packages/shared && npm run test` (or the monorepo test command). Ensure all `image-sanitizer.unit.test.ts` tests pass.
- [ ] Integration test: run the IPC integration test that exercises the extension host handler; verify sanitized file is returned and accessible via `webview.asWebviewUri` in a simulated webview environment.

## 5. Update Documentation
- [ ] Add `docs/image-sanitization.md` describing the pipeline, configuration flags (face-redaction toggle, TTL), and developer guidance for adding new redaction algorithms.
- [ ] Update `docs/security.md` to reference the image redaction buffer and the rationale for TTL and ephemeral storage.

## 6. Automated Verification
- [ ] Add `scripts/verify-image-sanitizer.js` which:
  - Loads the fixture images and runs them through the `sanitizeImage` API.
  - Verifies that EXIF metadata is stripped (using `exif-parser`) and that the returned sanitized SHA256 matches the stored file name in the redaction buffer.
  - Optionally re-opens the sanitized file and checks that identified redactionRegions are present by sampling pixel statistics in those boxes.
- [ ] Run `node scripts/verify-image-sanitizer.js` in CI as a gate for tasks that modify image handling.
