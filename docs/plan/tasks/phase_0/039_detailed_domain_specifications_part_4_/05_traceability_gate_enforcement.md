# Task: 100% Requirement Traceability Gate Enforcement (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-053]

## Dependencies
- depends_on: [none]
- shared_components: ["Traceability & Coverage Infrastructure" (consume), "./do Entrypoint Script & CI Pipeline" (consume)]

## 1. Initial Test Written
- [ ] Create `tests/traceability/test_traceability_gate.sh` that:
    - Creates a temporary directory with a mock requirements file containing 3 requirement IDs: `[MOCK-REQ-001]`, `[MOCK-REQ-002]`, `[MOCK-REQ-003]`.
    - Creates mock `.rs` files where only 2 of the 3 IDs are covered by `// Covers: MOCK-REQ-001` and `// Covers: MOCK-REQ-002` annotations.
    - Runs the traceability scanner against the temp directory.
    - Asserts exit code is non-zero.
    - Asserts output contains `MOCK-REQ-003` in the list of uncovered requirements.
    - Asserts output contains a percentage (66.7% or similar).
- [ ] Add a second test case in the same script:
    - All 3 IDs are covered. Scanner exits zero with `100.0%`.
- [ ] Add a third test case:
    - Zero `.rs` files exist (empty codebase). Scanner exits non-zero with `0.0%` (zero-result protection).
- [ ] Add a fourth test case:
    - A `// Covers: MOCK-REQ-001` annotation appears in a non-test file (e.g., `src/lib.rs` doc comment). Verify it counts toward traceability but does NOT affect E2E coverage gates.

## 2. Task Implementation
- [ ] Implement (or extend) the traceability scanner at `.tools/verify_requirements.py`:
    - **Step 1 — Parse requirements**: Read all normative requirement documents (`docs/plan/requirements/*.md`). Extract every requirement ID matching the pattern `\[(\d+_[A-Z_]+-REQ-\d+[A-Za-z]*)\]` (e.g., `[1_PRD-REQ-053]`, `[2_TAS-REQ-001G]`).
    - **Step 2 — Scan annotations**: Recursively search all `.rs` files in the workspace for `// Covers:` comments. Extract the requirement IDs referenced. Support multiple IDs per line: `// Covers: REQ-001, REQ-002`.
    - **Step 3 — Compute coverage**: `traceability_pct = (covered_ids / total_ids) * 100.0`.
    - **Step 4 — Report**: Print covered count, total count, percentage, and list of uncovered requirement IDs.
    - **Step 5 — Gate**: Exit non-zero if `traceability_pct < 100.0` or if `total_ids == 0` (zero-result protection).
- [ ] Write the traceability result to `target/traceability.json` with schema: `{ "total_requirements": N, "covered_requirements": M, "traceability_pct": P, "uncovered": ["REQ-ID", ...], "phase_gates": [...] }`.
- [ ] Integrate the scanner into `./do coverage` so it runs after the coverage gates and its failure causes the overall command to fail.
- [ ] Also integrate into `./do lint` as a check (non-blocking warning in Phase 0, becomes blocking in Phase 5).

## 3. Code Review
- [ ] Verify the requirement ID regex captures all formats used across the project (PRD, TAS, MCP, UI/UX, Security, Roadmap).
- [ ] Verify the scanner traverses all workspace crates — not just a hardcoded list.
- [ ] Verify `// Covers:` annotations inside `#[cfg(test)]` modules AND outside test modules both count for traceability.
- [ ] Verify duplicate annotations (same REQ-ID in multiple files) do not inflate the count — each requirement is counted as covered once.
- [ ] Verify the 100% threshold is hardcoded and not configurable.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/traceability/test_traceability_gate.sh` — all 4 test cases must pass.
- [ ] Run `python3 .tools/verify_requirements.py` on the actual workspace and review the output for correctness.

## 5. Update Documentation
- [ ] Document the `// Covers: REQ-ID` annotation convention in the developer guide, including examples of single and multiple IDs per line.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify `target/traceability.json` exists and contains `traceability_pct` field.
- [ ] Run `python3 -c "import json; d=json.load(open('target/traceability.json')); assert 'uncovered' in d; assert 'traceability_pct' in d; print(f'Traceability: {d[\"traceability_pct\"]}%')"`.
