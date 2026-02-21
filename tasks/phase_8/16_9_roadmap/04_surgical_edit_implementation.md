# Task: Implement surgical_edit tool (Sub-Epic: 16_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-206]

## 1. Initial Test Written
- [ ] Ensure tests from `03_surgical_edit_tests.md` are present and failing (red).

## 2. Task Implementation
- [ ] Implement the surgical edit library at `src/tools/surgical_edit.(py|js|ts)` with a clear public function:
  - `apply_edits(file_path: str, edits: List[Dict]) -> None`
  - Each `edit` is `{ "start": int, "end": int, "replacement": str }` with 1-based inclusive line indexes.
- [ ] Behavioural requirements:
  - Validate edits: ensure none overlap and all start/end indexes are in range; on overlap, raise a clear exception and do not modify the file.
  - Support multiple non-contiguous edits in a single operation. Implementation detail: sort edits by `start` descending before applying so earlier modifications do not shift later indexes.
  - Apply edits in-memory using a lines array and write atomically: write to a temp file in the same directory, fsync if available, then atomically rename/replace the original file.
  - Preserve original file permissions and EOL style.
  - Use advisory file locks (e.g., `fcntl.flock` on Unix) or an equivalent lockfile mechanism to prevent concurrent writers.
  - Provide a small CLI wrapper `scripts/surgical_edit_cli.(py|js)` that accepts a JSON file describing edits and applies them.

## 3. Code Review
- [ ] Verify the implementation avoids partial writes (atomic rename), properly handles Unicode and binary edge cases (raise for non-text), and documents the API contract. Ensure no insecure use of shell commands.
- [ ] Confirm unit tests from Task 03 now pass and add additional edge-case tests (very large files, empty replacement, insert at start/end).

## 4. Run Automated Tests to Verify
- [ ] Run the repository test runner and ensure all surgical_edit tests pass.

## 5. Update Documentation
- [ ] Create `docs/tools/surgical_edit.md` with: API reference (function signature), CLI examples, expected JSON schema for edits, failure modes, and integration note for DeveloperAgent CodeNode to call this function instead of ad-hoc file string manipulation.

## 6. Automated Verification
- [ ] Add `scripts/verify_surgical_edit.sh` that:
  - Runs unit tests for surgical_edit
  - Runs a sample CLI command applying multiple non-contiguous edits to a temporary fixture and asserts the output matches a checked-in golden fixture.

This implementation will make surgical edits safe, atomic, and suitable for programmatic use by DeveloperAgent.