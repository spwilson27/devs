# Task: Implement Secure Deletion Engine with Random-Data Overwrite (Sub-Epic: 13_Data Minimization and Secure Deletion)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-044]

## 1. Initial Test Written
- [ ] Create `src/core/purge/__tests__/secureDeletion.test.ts`:
  - Mock `fs/promises` (`readFile`, `writeFile`, `unlink`, `stat`, `readdir`, `rm`) using `jest.mock`.
  - Test `secureDeleteFile(filePath: string): Promise<void>`:
    - Asserts `stat` is called to get file size.
    - Asserts `writeFile` is called with a `Buffer` of cryptographically random bytes (`crypto.randomBytes`) equal to the file size (not zeroes).
    - Asserts `writeFile` is called **3 times** (DoD 5220.22-M three-pass overwrite) with different random buffers each pass.
    - Asserts `unlink` is called exactly once after all overwrite passes.
    - Asserts that if `stat` throws `ENOENT`, the function resolves without error (idempotent).
    - Asserts that if any overwrite pass fails, the error propagates (no silent swallowing).
  - Test `secureDeleteDirectory(dirPath: string): Promise<void>`:
    - Asserts it recursively calls `secureDeleteFile` on every regular file discovered.
    - Asserts `rm` with `{ recursive: true, force: true }` is called after all files are securely overwritten.
    - Asserts that empty directories are handled without error.
  - Test with a real temp directory (integration test tagged `@integration`) using actual `crypto.randomBytes` and real FS writes to verify the overwrite actually occurs.

## 2. Task Implementation
- [ ] Create `src/core/purge/secureDeletion.ts`:
  - Import `crypto` (Node built-in), `fs/promises`, and `path`.
  - Implement `secureDeleteFile(filePath: string): Promise<void>`:
    1. Call `fs.stat(filePath)` to get `size`. If `ENOENT`, return immediately.
    2. Loop 3 times: generate `crypto.randomBytes(size)` and call `fs.writeFile(filePath, buffer)`. Use `{ flag: 'r+' }` to overwrite in-place without truncating.
    3. Call `fs.unlink(filePath)`.
    - Add comment: `// [5_SECURITY_DESIGN-REQ-SEC-SD-044] Three-pass random overwrite before unlink.`
  - Implement `secureDeleteDirectory(dirPath: string): Promise<void>`:
    1. Use `fs.readdir(dirPath, { withFileTypes: true, recursive: true })` to list all entries.
    2. Filter for files (`dirent.isFile()`), resolve full paths.
    3. `await Promise.all(files.map(secureDeleteFile))`.
    4. Call `fs.rm(dirPath, { recursive: true, force: true })`.
- [ ] Export both functions from `src/core/purge/index.ts`.
- [ ] Add TypeScript strict-mode compatible typings (no `any`).

## 3. Code Review
- [ ] Verify `crypto.randomBytes` is used (not `Math.random` or zeroes) — grep for `Math.random` in `secureDeletion.ts` and assert absence.
- [ ] Verify the overwrite loop runs exactly 3 times — no magic numbers; extract as `const OVERWRITE_PASSES = 3`.
- [ ] Verify `{ flag: 'r+' }` is used in `writeFile` to prevent file growth/truncation.
- [ ] Verify the function correctly handles symlinks (skip them — only delete regular files).
- [ ] Verify no sensitive data (file contents) is logged at any log level.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/core/purge/__tests__/secureDeletion.test.ts --coverage` and confirm all tests pass with ≥ 95% branch coverage.
- [ ] Run integration tests: `npx jest --testNamePattern="@integration" src/core/purge/__tests__/secureDeletion.test.ts`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add `docs/security/secure-deletion.md` documenting: the 3-pass DoD 5220.22-M overwrite strategy, the API (`secureDeleteFile`, `secureDeleteDirectory`), and known limitations (e.g., SSD wear-leveling caveat).
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Secure deletion uses 3-pass random-byte overwrite via `crypto.randomBytes`. Implemented in `src/core/purge/secureDeletion.ts` per SD-044."

## 6. Automated Verification
- [ ] Run `node scripts/verify-secure-deletion.js` (create if absent): creates a temp file with known content, calls `secureDeleteFile`, reads raw bytes from disk (or asserts `ENOENT`), and confirms original content is unreadable. Exit code 0 = pass.
- [ ] Confirm `npm run validate-all` passes.
