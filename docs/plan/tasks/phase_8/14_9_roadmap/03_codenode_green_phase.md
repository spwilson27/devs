# Task: Implement CodeNode (Green Phase) to apply surgical edits (Sub-Epic: 14_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-601]

## 1. Initial Test Written
- [ ] Create tests/tdd/test_codenode.py using pytest with the following tests:
  - test_apply_patch_atomic: create a temporary repo dir with file foo.py containing the token "PLACEHOLDER", call CodeNode.apply_patch([{"path":"foo.py","replace":"PLACEHOLDER","with":"def foo():\n    return 1\n"}]) and assert that foo.py contains the new content and that the write occurred atomically (write to tmp -> os.replace semantics can be asserted by checking that no partial file contents exist).
  - test_apply_patch_error_recovery: simulate an exception during patch application and assert that a backup file or transactional rollback leaves original content intact.

## 2. Task Implementation
- [ ] Implement tdd/codenode.py and tdd/surgical_edit.py with the following behavior:
  - CodeNode.apply_patch(edits: List[Dict]) -> List[Dict]: accept edits where each edit includes path, replace marker or unified-diff, and replacement content. For each edit: read original file, compute new content, write to a temporary file in same dir, then os.replace(tmp, target) to ensure atomicity. Return list of dicts {path, old_hash, new_hash}.
  - surgical_edit.apply_edit(path, new_content): low-level atomic file writer that also obtains a platform-appropriate file lock (fcntl on Unix) while writing.
  - Ensure proper path normalization (os.path.realpath/os.path.normpath) and guard against writing outside repository root.

## 3. Code Review
- [ ] Verify atomic writes via os.replace, file locking strategy, handling of edge cases (non-existent files, permission errors), and that apply_patch is idempotent for identical edits. Ensure tests cover these cases.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/tdd/test_codenode.py and confirm tests pass.

## 5. Update Documentation
- [ ] Add docs/architecture/codenode.md and docs/architecture/surgical_edit.md describing edit formats supported, locking model, failure semantics, and example code snippets.

## 6. Automated Verification
- [ ] CI verification: run pytest and then execute a small demo script tests/tdd/ci_apply_patch.sh which creates a sample file, applies a patch via CodeNode, and verifies SHA-256 checksums before and after match expectations.