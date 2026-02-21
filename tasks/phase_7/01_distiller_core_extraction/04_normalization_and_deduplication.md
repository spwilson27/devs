# Task: Implement Normalization and Deduplication Component (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [9_ROADMAP-REQ-009], [1_PRD-REQ-PLAN-001]

## 1. Initial Test Written
- [ ] Create tests/distiller/test_normalization_dedup.py containing tests:
  - test_normalize_id_canonical_form()
  - test_deduplicate_variants_keep_merged_provenance()
  - test_normalizer_is_idempotent()
- [ ] Example cases to include in tests:
  - Input IDs: "tas-051", "TAS-051", "1_prd-req-plan-001", "1_PRD-REQ-PLAN-001" -> canonical forms: "TAS-051", "1_PRD-REQ-PLAN-001".
  - Two Requirement objects that differ only by case/spaces should deduplicate into one Requirement with merged provenance list (both source_doc entries retained).
- [ ] Run: pytest -q tests/distiller/test_normalization_dedup.py and confirm failure initially.

## 2. Task Implementation
- [ ] Implement src/distiller/normalizer.py exposing:
  - function normalize_reqid(raw_id: str) -> str  (canonicalization rules: trim, collapse whitespace, uppercase alphabetic segments, preserve numeric segments, replace underscores with hyphens ONLY when necessary to match canonical format)
  - function deduplicate_requirements(requirements: List[Requirement]) -> List[Requirement] which returns a de-duplicated list by normalized_id and merges provenance arrays (source_doc + line ranges) and sets confidence to max(confidences) when present.
- [ ] Ensure normalization is deterministic and documented.

## 3. Code Review
- [ ] Verify normalization is reversible for provenance (store original raw_text per provenance entry).
- [ ] Ensure no external network calls, algorithmic complexity O(n log n) or O(n) using hashing for dedup.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_normalization_dedup.py and ensure all tests pass.

## 5. Update Documentation
- [ ] Add a subsection 'Normalization and Deduplication' to docs/distiller.md explaining canonicalization rules, examples, and merging semantics.

## 6. Automated Verification
- [ ] Run a small script: python -c "from distiller.normalizer import deduplicate_requirements, normalize_reqid; print(normalize_reqid('tas-051'))" and assert output equals "TAS-051"; run pytest to confirm all tests pass.
