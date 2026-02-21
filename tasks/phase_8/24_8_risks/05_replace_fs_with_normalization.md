# Task: Replace direct filesystem operations to use normalization middleware (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-045]

## 1. Initial Test Written
- [ ] Write integration tests at tests/integration/fs-normalization.spec.ts that stub core modules which currently call fs.* directly and assert they call the new normalizePath wrapper first. Use vi.spyOn to verify calls.

## 2. Task Implementation
- [ ] Refactor core code paths that perform filesystem writes/reads (search for direct uses of fs.readFileSync, fs.writeFileSync, fs.rename, etc.) and route them through the normalization wrapper (e.g., src/lib/fs/index.ts which delegates to fs after normalizing). Keep behavior identical except for path normalization and traversal protection.
- [ ] Ensure the normalization wrapper centralizes path resolution and throws PathTraversalError when appropriate.

## 3. Code Review
- [ ] Verify all modifications preserve existing semantics, add no new side-effects, and are covered by unit/integration tests. Ensure imports are minimal and cross-platform compatibility is preserved.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/integration/fs-normalization.spec.ts --run and run full test suite to ensure no regressions.

## 5. Update Documentation
- [ ] Update docs/risks/path_normalization.md to include a migration note listing modules replaced and a one-line guide on how to use the wrapper in new code.

## 6. Automated Verification
- [ ] Run static search (grep) to ensure no remaining direct calls to fs.writeFileSync or fs.rename in modules listed as protected; run a smoke integration that performs a typical file write and verify it succeeds under normalization.
