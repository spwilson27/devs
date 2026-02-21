# Task: Implement DocumentChecksum utility (generate and store SHA-256 checksums for PRD/TAS) (Sub-Epic: 08_Document Integrity and Security)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-060]

## 1. Initial Test Written
- [ ] Create unit tests at tests/security/test_document_checksum.(ts|js|py) using the project's test framework. Write two tests:
  - Test A (deterministic SHA-256): create a temporary file named `PRD.md` with exact contents `hello world` (no trailing newline). Assert that computeChecksum('PRD.md') returns the exact SHA-256 hex string `b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9`.
  - Test B (manifest generation): create two temp files `PRD.md` and `TAS.md` (content arbitrary). Call generateManifest([paths], outPath='.devs/checksums.json'). Assert that `.devs/checksums.json` exists, contains a top-level object {"version": "1", "generated_at": <ISO8601>, "files": {"PRD.md": "<sha>", "TAS.md": "<sha>"}} and that each `<sha>` equals computeChecksum(file) called in the same test. Assert the manifest file is written atomically (write to a temp file then rename) and that the file mode is 0600 and the `.devs/` directory mode is 0700.

Notes for test implementation:
- Use system temp dirs, ensure cleanup after test. Use deterministic file contents for Test A to make a fixed expected hash.
- Tests must not depend on network or external services and must run in sandbox.

## 2. Task Implementation
- [ ] Implement a small, focused module `src/security/document_checksum.(ts|js|py)` with the following exported functions:
  - computeChecksum(filePath: string) -> Promise<string> (hex lowercase SHA-256)
  - generateManifest(filePaths: string[], outPath: string = '.devs/checksums.json') -> Promise<void>
  - verifyManifest(outPath: string = '.devs/checksums.json') -> Promise<{ok: boolean, mismatches: Record<string,{expected:string,found:string}>}>
- Implementation details:
  - Use the platform's standard crypto library (Node: `crypto.createHash('sha256')`; Python: `hashlib.sha256`).
  - Read files as binary, compute hex digest, return lowercase hex string with no `0x` or prefix.
  - Manifest format: JSON with fields: { version: "1", generated_at: <ISO8601 UTC>, files: {<relative-path>: <sha256>}, generator: "document_checksum" }
  - Ensure `.devs/` directory is created with 0700 permissions before writing manifest.
  - Write manifest atomically: write to a temp file in the same directory and then rename to final path (POSIX atomic rename). After rename, set file mode to 0600.
  - Add defensive error handling: if a file is unreadable, generateManifest should fail with a clear error and not write a partial manifest.
  - Add small CLI entrypoint `bin/document-checksum` or a script `scripts/generate_checksums` that accepts `--files` and `--out` options.
- Add lightweight documentation comment above each exported function describing inputs, outputs, and error conditions.

## 3. Code Review
- [ ] Verify the implementation uses only stdlib crypto primitives and no deprecated or insecure hashing libraries.
- [ ] Confirm the atomic write pattern (temp file -> fs.rename) is implemented and tested.
- [ ] Verify file/directory permission changes are explicit (chmod) and have tests asserting them.
- [ ] Ensure exception messages are actionable and logged (avoid leaking secrets).
- [ ] Ensure all new code is covered by unit tests and target module coverage >= 90%.

## 4. Run Automated Tests to Verify
- [ ] Execute the project test runner and specifically run the new tests (e.g., `npm test -- tests/security/test_document_checksum.*` or `pytest tests/security/test_document_checksum.py`).
- [ ] Confirm Test A returns the fixed SHA-256 and Test B asserts manifest structure and atomic write semantics.

## 5. Update Documentation
- [ ] Update `specs/5_security_design.md` to document the `DocumentChecksum` utility, the manifest format, and the location `.devs/checksums.json`.
- [ ] Add a short HOWTO in `docs/security.md` or `docs/ops/checksums.md` describing how to (a) regenerate checksums and (b) revoke/regenerate in the approval flow.

## 6. Automated Verification
- [ ] Add `scripts/verify_checksums.(sh|js|py)` that re-computes file checksums for PRD.md and TAS.md and compares them to `.devs/checksums.json` returning exit code 0 on match and non-zero on mismatch. Integrate this script into CI as a pre-run gate for the DistillNode and ImplementationLoop.
