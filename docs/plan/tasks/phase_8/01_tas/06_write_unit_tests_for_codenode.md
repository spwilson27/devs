# Task: Write unit tests for CodeNode (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Create unit tests specifying CodeNode behavior: apply an atomic code patch, validate file write correctness, and produce a patch preview/diff.
  - Test path: tests/unit/test_codenode.(py|spec.ts)
  - Required assertions:
    1. CodeNode.apply_patch(target_file, patch_text) writes the expected file contents atomically and returns a structured result: { id, target_file, success: bool, diff: string }.
    2. CodeNode.preview_patch(target_file, patch_text) returns the expected unified diff without applying changes.
    3. Concurrent patch attempts to the same file should be serialized or return an error (test can simulate concurrency via threads/processes or sequential locks).

Jest example (tests/unit/test_codenode.spec.ts):
```ts
import { CodeNode } from '../../src/tdd_engine';

test('CodeNode applies atomic patch and provides diff preview', async () => {
  const node = new CodeNode({ workspaceRoot: 'tmp/sandbox' });
  const preview = await node.previewPatch('src/example.js', 'replace content');
  expect(preview).toContain('@@');
  const res = await node.applyPatch('src/example.js', 'replace content');
  expect(res.success).toBe(true);
  expect(res.diff).toContain('@@');
});
```

pytest example (tests/unit/test_codenode.py):
```py
from tdd_engine import CodeNode


def test_codenode_applies_patch(tmp_path):
    node = CodeNode({'workspace_root': str(tmp_path)})
    preview = node.preview_patch('src/example.py', 'new content')
    assert '@@' in preview
    res = node.apply_patch('src/example.py', 'new content')
    assert res['success'] is True
```

## 2. Task Implementation
- [ ] Implement CodeNode in src/tdd_engine/code_node.(py|ts) with methods:
  - preview_patch(target_file: str, patch_text: str) -> string (unified diff)
  - apply_patch(target_file: str, patch_text: str) -> { id, target_file, success: bool, diff: string }
- [ ] Use a safe patching strategy: write to temp file and atomically rename, or use git apply --index in an isolated repo clone (but prefer a language-level safe write to avoid git requirements).
- [ ] Implement lightweight file locking (per-file lock) to serialize concurrent patches.

## 3. Code Review
- [ ] Verify that patch preview matches the diff produced by apply_patch and that filesystem operations are atomic.
- [ ] Ensure proper handling of binary files (return an error) and large files (fail fast).

## 4. Run Automated Tests to Verify
- [ ] Run tests for CodeNode and confirm expected behavior.
- [ ] Save output to tests/results/codenode_results.txt

## 5. Update Documentation
- [ ] Add docs/TAS-052-codenode.md describing patch formats supported, locking strategy, and failure modes.

## 6. Automated Verification
- [ ] Implement scripts/verify_codenode.sh to:
  1. Create a target file in a sandbox
  2. Call preview_patch and apply_patch
  3. Verify the file contents match expectations and that diffs are produced
  4. Exit 0 on success
