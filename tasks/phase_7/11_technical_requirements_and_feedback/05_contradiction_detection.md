# Task: Implement Requirement Contradiction Detection Engine (Sub-Epic: 11_Technical_Requirements_and_Feedback)

## Covered Requirements
- [4_USER_FEATURES-REQ-081]

## 1. Initial Test Written
- [ ] Create tests at `tests/distiller/test_contradiction_detection.py` before implementation. Tests to write first:
  - test_detect_simple_keyword_conflict(): supply two short document snippets where one states "Offline-first" and the other states "Postgres-only"; assert `detect_contradictions(docs)` returns a list containing an item with `type: 'architectural-contradiction'`, `evidence` pointing at the two snippets and `confidence >= 0.7`.
  - test_no_false_positive_on_compatible_statements(): feed compatible statements (e.g., "Support Postgres" and "Prefer SQLite for small installs") and assert no contradictions.
  - test_detect_negation_conflict(): detect contradictions introduced by negation, e.g., "does not support X" vs "requires X".
  - test_integration_with_distiller(): run the distiller pipeline on a sample PRD+TAS pair that contains a contradiction and assert the pipeline produces a `clarification_request` record with linked `req_ids` and `evidence_snippets`.

## 2. Task Implementation
- [ ] Implement `src/distiller/contradiction.py` with:
  - `detect_contradictions(docs: List[Dict]) -> List[Contradiction]` where each `Contradiction` is a dict: `{ 'id': str, 'type': str, 'evidence': List[ { 'source_file': str, 'start_line': int, 'end_line': int, 'snippet': str } ], 'confidence': float }`.
  - Use a hybrid rules-based approach: (1) canonicalize statements (lowercase, strip punctuation), (2) detect mutually exclusive keyword pairs (e.g., offline-first vs postgres-only, single-leader vs multi-master), (3) simple negation detection (presence of "not", "doesn't", "without").
  - Keep heuristics configurable via `config/contradiction_rules.yaml` (list of mutually exclusive keyword pairs and thresholds).
  - Provide clear logging and return deterministic, reproducible confidence scores computed from matched rules.

## 3. Code Review
- [ ] Ensure the detection engine is explainable (each contradiction has human-readable `evidence` and rule id). Verify tests cover positive/negative cases and that results are deterministic.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/distiller/test_contradiction_detection.py` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/phase_7/11_technical_requirements_and_feedback/contradiction_detection.md` documenting rule format, examples of contradictions, tuning guidance for thresholds, and sample outputs (JSON).

## 6. Automated Verification
- [ ] Provide a smoke script `scripts/check_contradictions.sh` that runs a small suite of contradiction detection tests and outputs a machine-readable JSON report; CI can consume this to assert no regressions.
