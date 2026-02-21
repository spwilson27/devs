# Task: Implement CodeNode (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Ensure tests from task 06 exist and fail appropriately (Red). The tests will guide the implementation.

## 2. Task Implementation
- [ ] Implement CodeNode in src/tdd_engine/code_node.(py|ts) with the following behavior:
  1. preview_patch(target_file, patch_text) -> returns unified diff string (no changes written).
  2. apply_patch(target_file, patch_text) -> applies patch atomically and returns { id, target_file, success, diff }.
  3. acquire_lock(target_file) and release_lock(target_file) to serialize operations.
- [ ] Use safe write operations: write to temporary file then os.rename (atomic) or fs.renameSync.
- [ ] If the repository has git available and the workspace is a git repo, include an optional path to generate a git staged patch instead of direct file write, but default to filesystem-only implementation.

Implementation details:
- Implement small utility to compute unified diff (use difflib.unified_diff in Python or a small js diff library available in-repo; if none, implement naive line-based diff in the task).
- Ensure apply_patch includes checksum validation so that if file contents changed since preview, apply_patch fails with a clear error (preventing race conditions).

## 3. Code Review
- [ ] Verify atomicity of writes and correct lock semantics.
- [ ] Confirm that apply_patch returns an accurate diff that matches preview_patch.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for CodeNode and ensure they pass after implementation.
- [ ] Save output to tests/results/codenode_results.txt

## 5. Update Documentation
- [ ] Update docs/TAS-052-codenode.md with implementation notes, lock semantics, and CLI helper examples.

## 6. Automated Verification
- [ ] Provide scripts/verify_codenode_apply.sh that runs preview_patch then apply_patch and verifies final file contents and diffs.
