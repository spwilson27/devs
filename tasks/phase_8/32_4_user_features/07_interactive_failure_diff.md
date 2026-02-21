# Task: Interactive Failure Diffs (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-061]

## 1. Initial Test Written
- [ ] Unit tests for a FailureDiffGenerator that assert output contains: per-file hunks, line ranges, unified diff text, and annotations linking failing test stack traces to diff lines.
- [ ] Integration test that given a failing commit and last passing commit, generates a navigable HTML-renderable diff artifact with anchors for each hunk and metadata JSON.

## 2. Task Implementation
- [ ] Implement devs/core/diffs.py exposing compute_failure_diff(failing_sha, passing_sha, failing_tests) -> {diffs: [{file, hunks, unified_text}], metadata}.
- [ ] Implement an exporter that can produce an interactive HTML bundle (static) or JSON API consumed by a web UI component FailureDiffViewer.
- [ ] Implement an optional quick-fix helper that can produce small patch suggestions for common patterns (e.g., missing import, off-by-one assertion) but DOES NOT auto-apply; it only produces candidate patches and confidence scores.

## 3. Code Review
- [ ] Confirm diff generation is deterministic and uses a stable diff algorithm (git diff --no-index or python difflib with canonical normalization).
- [ ] Validate hunk annotations accurately map stack trace line numbers to diff contexts.
- [ ] Ensure quick-fix heuristics are conservative and include confidence metadata.

## 4. Run Automated Tests to Verify
- [ ] Run the new unit tests and the integration test that produces the HTML/JSON artifact; open the artifact in CI (headless) to assert expected DOM anchors exist (where applicable).

## 5. Update Documentation
- [ ] Add docs/diagnostics/failure-diffs.md explaining how to invoke diff generation, how to read annotations, and how to export patches for reviewer approval.

## 6. Automated Verification
- [ ] Provide a verification script scripts/verify_failure_diff.sh that:
  - Checks out the failing and passing SHAs into temp dirs,
  - Runs compute_failure_diff and validates output JSON structure and that annotated lines referenced by stack traces exist in the unified diff.
