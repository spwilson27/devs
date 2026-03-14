# Task: Phase 0 Dependency Verification Gate (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [ROAD-P1-DEP-001]

## Dependencies
- depends_on: ["none"]
- shared_components: ["Phase Transition Checkpoint (PTC) Model", "devs-proto", "devs-core", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/phase_gate/phase_0_complete.rs`. Write test `test_phase_0_ptc_exists_and_valid` that: (1) globs `docs/adr/*-phase-0-complete.md`, asserts exactly one file matches, (2) reads the file, extracts the first ````json` fenced code block, (3) parses it with `serde_json`, (4) asserts `phase_id == "phase_0"`, (5) asserts every entry in `gate_conditions[]` has `"verified": true`, (6) asserts `platforms_verified` contains `"linux"`, `"macos"`, `"windows"`. Annotate with `// Covers: ROAD-P1-DEP-001`.
- [ ] Write test `test_devs_proto_crate_compiles` that runs `cargo check -p devs-proto` via `std::process::Command` and asserts exit code 0. Annotate with `// Covers: ROAD-P1-DEP-001`.
- [ ] Write test `test_devs_core_crate_compiles` that runs `cargo check -p devs-core` via `std::process::Command` and asserts exit code 0. Annotate with `// Covers: ROAD-P1-DEP-001`.
- [ ] Write test `test_traceability_has_phase_0_gate` that reads `target/traceability.json`, parses it, and asserts `phase_gates` array has an entry with `phase_id: "phase_0"` and `status: "passed"`. Annotate with `// Covers: ROAD-P1-DEP-001`.

## 2. Task Implementation
- [ ] Create `tests/phase_gate/phase_0_complete.rs` with the four tests above. Use `glob` crate for file matching. Use `serde_json::Value` for flexible JSON parsing.
- [ ] For PTC JSON extraction: split file on ````json` and ``````, take content between first pair, parse as JSON.
- [ ] If `tests/phase_gate/mod.rs` or `tests/phase_gate.rs` doesn't exist, create the appropriate test harness entry point.

## 3. Code Review
- [ ] Verify tests use `std::path::Path` joins, not hardcoded `/` separators, for cross-platform compatibility.
- [ ] Verify all 4 tests have `// Covers: ROAD-P1-DEP-001` annotations.
- [ ] Verify tests produce clear failure messages when Phase 0 artifacts are missing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test phase_gate` (or `cargo test phase_0_complete`) and confirm all 4 tests pass.

## 5. Update Documentation
- [ ] Ensure `// Covers: ROAD-P1-DEP-001` traceability comments are present on each test function.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `ROAD-P1-DEP-001` in its requirement coverage.
- [ ] Run `grep -r "ROAD-P1-DEP-001" tests/` and confirm at least one match.
