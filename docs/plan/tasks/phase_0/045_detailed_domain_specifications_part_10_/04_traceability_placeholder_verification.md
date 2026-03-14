# Task: Traceability Scanner Handles Placeholder Requirement Tag (Sub-Epic: 045_Detailed Domain Specifications (Part 10))

## Covered Requirements
- [1_PRD-REQ-NNN]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/phase_0/test_placeholder_traceability.rs` (or shell script `tests/verify_placeholder_tag.sh`).
- [ ] **Test 1 — Scanner recognizes `1_PRD-REQ-NNN` as a valid requirement ID** (`test_scanner_parses_nnn_tag`): Run the traceability scanner against a test file containing `// Covers: 1_PRD-REQ-NNN`. Assert the scanner includes `1_PRD-REQ-NNN` in its output as a covered requirement. The scanner must not crash, skip, or treat it as invalid due to the non-numeric suffix `NNN`.
- [ ] **Test 2 — `1_PRD-REQ-NNN` appears in the authoritative requirement list** (`test_nnn_in_requirement_list`): Run the scanner's requirement extraction against the PRD spec file. Assert `1_PRD-REQ-NNN` is present in the extracted list of authoritative requirement IDs (since it appears as `**[1_PRD-REQ-NNN]**` in the PRD).
- [ ] **Test 3 — Covering test satisfies traceability** (`test_nnn_covered`): Create a test function annotated with `// Covers: 1_PRD-REQ-NNN`. Run the full traceability check and assert `1_PRD-REQ-NNN` is reported as covered (not uncovered/stale).
- [ ] Add `// Covers: 1_PRD-REQ-NNN` to the test file itself (this is the covering annotation).

## 2. Task Implementation
- [ ] Verify that `1_PRD-REQ-NNN` already appears in `docs/plan/specs/1_prd.md` (or `docs/plan/requirements/1_prd.md`) as an authoritative requirement tag with the `**[1_PRD-REQ-NNN]**` bold-bracket pattern. If not present, add it to the appropriate narrative section.
- [ ] Verify the traceability scanner's regex pattern accepts `NNN` as a valid suffix (not just `[0-9]+`). The PRD states this is a placeholder tag that appears verbatim in the source document. The scanner regex should match patterns like `[0-9a-zA-Z_]+_PRD-REQ-[0-9A-Z]+` or specifically allowlist `1_PRD-REQ-NNN`.
- [ ] If the scanner regex is too restrictive (only matches numeric suffixes), update it to also match `NNN` as a special case, or broaden the pattern to accept alphanumeric suffixes.
- [ ] Create a minimal Rust test file (or add to an existing test module) that contains the annotation `// Covers: 1_PRD-REQ-NNN` and a trivial passing test, ensuring the traceability gate is satisfied.

## 3. Code Review
- [ ] Verify the scanner regex change (if any) does not inadvertently match garbage strings — it should still require the `<number>_PRD-REQ-` or `<number>_TAS-REQ-` prefix pattern.
- [ ] Confirm the placeholder tag does not create a false sense of coverage — the test that covers it should be a real (even if trivial) assertion about the scanner's behavior, not just an empty test.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm all tests pass.
- [ ] Run the traceability scanner and confirm `1_PRD-REQ-NNN` is listed as covered.

## 5. Update Documentation
- [ ] No additional documentation needed — this is a meta-verification of the traceability infrastructure.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `1_PRD-REQ-NNN` appears in the traceability report as covered.
- [ ] Confirm `./do lint` passes (no stale annotations).
