# Task: Implement path normalization middleware (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-045]

## 1. Initial Test Written
- [ ] Write unit tests at tests/utils/path-normalize.spec.ts using Vitest. Tests should validate a normalizePath(inputPath, {root}) function:
  - Converts Windows-style backslashes to POSIX-style consistently across platforms.
  - Resolves relative segments ("..", ".") and returns an absolute path when given a root.
  - Prevents path traversal outside a configured root by throwing when resolved path is outside root.
  - Test vectors: "..\\secrets\\file.txt", "./src/../package.json", "C:\\project\\file".

## 2. Task Implementation
- [ ] Implement src/lib/pathNormalize.ts (or src/lib/fs/pathNormalize.ts) that uses the "upath" package (or Node's path.posix/win32 with normalization strategy) and exports:
  - normalizePath(inputPath: string, opts?: { root?: string }): string
  - isWithinRoot(normalizedPath: string, root: string): boolean
  - Throw a clear error type (PathTraversalError) when path is outside the allowed root.
- [ ] Add a small wrapper for all internal FS APIs to call normalizePath before operating on paths.

## 3. Code Review
- [ ] Confirm cross-platform behavior (use upath for portability), ensure no direct string concatenation for paths, and verify the PathTraversalError is used by higher-level code to reject unsafe operations.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/utils/path-normalize.spec.ts --run and confirm all tests pass.

## 5. Update Documentation
- [ ] Document the middleware in docs/risks/path_normalization.md with examples of normalized inputs and the security policy for rejecting traversal.

## 6. Automated Verification
- [ ] Run a kube/local check script that attempts to call the internal FS wrapper with a path that would traverse outside the workspace; assert the call is rejected and the error type is PathTraversalError.
