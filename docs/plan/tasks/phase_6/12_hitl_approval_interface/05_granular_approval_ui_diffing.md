# Task: Implement Granular Approval UI and High-Signal Diffing (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-NEED-ARCH-02], [1_PRD-REQ-UI-002]

## 1. Initial Test Written
- [ ] Create unit tests `tests/unit/test_high_signal_diff.py` and `tests/integration/test_granular_approval_ui.py`:
  - `test_high_signal_diff_classifies_changes`: Given two markdown document strings (old, new) assert the high-signal diff utility classifies changes into categories: `dependency_added`, `security_policy_changed`, `text_change`, `structural_change`.
  - `test_granular_block_approval_persisted`: Create an ApprovalRequest with three blocks, approve block #2 via the API or direct DB call, and assert only block #2 has status `approved` while others remain `pending`.
  - `test_ui_accept_reject_block`: Simulate UI accept/reject action (unit or integration) and assert DB reflects change and audit record exists.

## 2. Task Implementation
- [ ] Implement `src/utils/high_signal_diff.py` (or in project's utils) providing:
  - `compute_high_signal_diff(old_md: str, new_md: str) -> List[Dict]` where each dict represents a block change `{block_id, req_id, change_type, snippet_old, snippet_new}`.
  - Use a Markdown parser (e.g., `markdown-it-py`, `mistune` or a JS equivalent) to create an AST and diff AST nodes rather than raw text diffs; fallback to `difflib` when AST parser is not available.
- [ ] Implement frontend `src/ui/components/GranularApprovalDiff.{tsx,js}` which:
  - Renders the output of `compute_high_signal_diff` as interactive rows with Accept / Reject buttons for each changed block.
  - Calls `POST /api/approvals/{token}/blocks/{block_id}/approve` on Accept and `.../reject` on Reject.
- [ ] Persist per-block approvals in the `ApprovalBlock` model with audit records and timestamps.

## 3. Code Review
- [ ] Verify: diff classification rules (unit-tested), deterministic output for identical inputs, graceful fallback to textual diffs, and secure handling of any embedded content (no script execution in rendered snippets).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_high_signal_diff.py tests/integration/test_granular_approval_ui.py` and ensure deterministic passing results.

## 5. Update Documentation
- [ ] Add `docs/granular_approval_ui.md` explaining the diff categories, UI behavior, API endpoints used, and sample screenshots or DOM structure for the review dashboard.

## 6. Automated Verification
- [ ] Add `scripts/verify_granular_approval.sh` which runs the diff unit tests on sample document pairs and asserts expected classifications exist; include in CI to catch regressions.
