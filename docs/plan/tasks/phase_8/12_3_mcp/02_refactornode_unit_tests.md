# Task: RefactorNode - Unit Tests for Cleanup Logic (Sub-Epic: 12_3_MCP)

## Covered Requirements
- [3_MCP-TAS-085]

## 1. Initial Test Written
- [ ] Create a focused unit test suite that defines the desired cleanup behaviors the RefactorNode must perform.
  - Test file: tests/unit/test_refactornode_cleanup.py (or tests/refactornode/cleanup.test.ts).
  - Tests to write first (red):
    1. test_noop_on_empty_changes: instantiate RefactorNode with changes=[] and assert apply_patch returns applied=False and changes_count==0.
    2. test_single_file_whitespace_cleanup: given a temp file with trailing whitespace and extra blank lines, assert apply_patch modifies content to remove trailing whitespace and collapse excessive blank lines.
    3. test_import_ordering_idempotence: given a file with unsorted imports, assert apply_patch sorts imports, and a second apply_patch is a no-op (idempotent).
    4. test_refactor_node_detects_conflicts: when two overlapping changes target the same region, apply_patch should fail with a ConflictError (or return applied=False with details).
  - Use fixtures to create a sandbox workspace (tmp_path / tmpdir) and write temporary files representing repository files.

## 2. Task Implementation
- [ ] Implement the minimal cleanup algorithms to satisfy the tests:
  - Implement helpers: normalize_whitespace(text) -> text, sort_imports(text, language) -> text (language-aware stub), detect_overlaps(changes) -> raises ConflictError.
  - Keep implementations small and focused: use regex-based normalization and deterministic sort for imports (alphabetical by symbol) as a starting point.
  - Implement apply_patch to: 1) validate changes, 2) read files from sandbox, 3) apply deterministic transformations in-memory, 4) write back only if content changed, and 5) return patch metadata.

## 3. Code Review
- [ ] Verify:
  - Deterministic outputs for identical inputs (no randomness).
  - Small, well-named helper functions with unit coverage.
  - Proper error types for conflict detection and clear failure messages.
  - Tests cover both positive and negative paths (idempotence and conflict cases).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for the new files only: `pytest tests/unit/test_refactornode_cleanup.py -q` or `npx jest tests/refactornode/cleanup.test.ts -t "RefactorNode"`.

## 5. Update Documentation
- [ ] Document the cleanup behaviors and the small helper functions in docs/agents/refactor_node.md with before/after snippets used in tests.

## 6. Automated Verification
- [ ] Add a CI job or local script `scripts/run_refactornode_unit_tests.sh` that runs the new tests and prints a concise JSON summary of results suitable for automated gating.
