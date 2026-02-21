# Task: Add Planning Metadata & Flags to Technical Requirements (Sub-Epic: 11_Technical_Requirements_and_Feedback)

## Covered Requirements
- [9_ROADMAP-TAS-011], [9_ROADMAP-TAS-013]

## 1. Initial Test Written
- [ ] Create tests in `tests/requirements/test_planning_metadata.py` before implementation. Tests to write first:
  - test_default_planning_fields(): given a `TechRequirement` without planning fields, call `attach_planning_metadata(req)` and assert `priority`, `impact`, `token_estimate`, and `requires_human_review` fields are present with default types (int/str/bool/float).
  - test_token_estimate_heuristic(): provide a short and a long requirement text and assert `token_estimate` is proportional (longer -> larger estimate) and within expected bounds.
  - test_persistence_of_metadata(): after attaching metadata and persisting to DB (use sqlite in-memory), re-load and assert metadata fields are present.

## 2. Task Implementation
- [ ] Implement `src/requirements/planning.py` with functions:
  - `attach_planning_metadata(requirement: Dict) -> Dict` (pure function) that returns an enriched copy with fields: `priority` (int 1-5), `impact` ("low|medium|high"), `token_estimate` (int), `preconditions` (List[str]), `requires_human_review` (bool).
  - `token_estimate_heuristic(text: str) -> int` used by `attach_planning_metadata`.
  - Persisting helper `persist_planning_metadata(db_conn, requirement)` to write metadata into the requirements table created earlier.

## 3. Code Review
- [ ] Confirm planning functions are pure and easily testable. Review heuristics for token estimation for transparency (document formula). Ensure defaults are configurable via `config/planning.yaml` or env var.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/requirements/test_planning_metadata.py` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `docs/phase_7/11_technical_requirements_and_feedback/planning_metadata.md` describing fields, default values, tuning knobs, and sample outputs used by the roadmap planner.

## 6. Automated Verification
- [ ] Add a verification script `scripts/verify_planning_metadata.sh` that runs the new tests and prints a summary of sample token estimates for included sample requirements.
