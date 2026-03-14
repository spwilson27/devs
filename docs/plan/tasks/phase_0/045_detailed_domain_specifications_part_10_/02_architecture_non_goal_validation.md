# Task: Architecture Validation Against Non-Goals at Design Checkpoint (Sub-Epic: 045_Detailed Domain Specifications (Part 10))

## Covered Requirements
- [1_PRD-REQ-081]

## Dependencies
- depends_on: ["01_changelog_and_non_goals.md"]
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/phase_0/test_non_goal_arch_validation.rs` (or shell script `tests/verify_arch_validation.sh`).
- [ ] **Test 1 — Validation document exists** (`test_non_goal_validation_doc_exists`): Assert `docs/design/non-goal-architecture-validation.md` exists.
- [ ] **Test 2 — All five non-goals have sections** (`test_all_non_goals_assessed`): Parse the document and assert it contains five assessment sections, one per non-goal: GUI, Web API, Client Authentication, External Secrets Manager, Automated Triggers.
- [ ] **Test 3 — Each section has a verdict** (`test_each_section_has_verdict`): For each non-goal section, assert there is a line containing either `Verdict: No impediment` or `Verdict: Impediment found` (or similar structured verdict). Sections with impediments must also contain a `Resolution:` line.
- [ ] **Test 4 — No impediments remain unresolved** (`test_no_unresolved_impediments`): If any section says `Impediment found`, assert a corresponding `Resolution:` line exists and is non-empty.
- [ ] Add `// Covers: 1_PRD-REQ-081` to the test file.

## 2. Task Implementation
- [ ] Create `docs/design/non-goal-architecture-validation.md`.
- [ ] For each of the five non-goals, write a technical assessment section that examines the current architecture (as defined in the TAS) for structural impediments to adding the feature post-MVP:
    1. **GUI**: Verify gRPC API supports streaming for real-time UI updates; verify no terminal-specific assumptions in the server API; confirm the `devs-proto` service definitions are GUI-agnostic.
    2. **Web API / REST**: Verify no HTTP listener exists in the codebase; confirm gRPC-to-REST transcoding could be added as a separate crate without modifying core; verify no REST-specific patterns are baked into `devs-server`.
    3. **Client Authentication**: Verify no auth middleware or token concepts exist in core types; confirm gRPC interceptor injection points exist for future auth; verify `devs-core` has no auth-related dependencies.
    4. **External Secrets Manager**: Verify no secrets manager SDK is in `Cargo.toml` dependencies; confirm the credential resolution path in `devs-config` uses a trait/abstraction that could be extended; verify `Redacted<T>` is the only credential handling mechanism.
    5. **Automated Triggers**: Verify no cron, file-watch, or inbound webhook background tasks exist; confirm the `submit_run` path could be invoked by a future trigger module without modification; verify no polling loops exist in the server.
- [ ] Each section must include: **Current state**, **Assessment**, **Verdict**, and (if needed) **Resolution**.

## 3. Code Review
- [ ] Verify each assessment is technically rigorous — not just "it's fine" but explains the specific architectural elements examined.
- [ ] Confirm assessments reference specific crates, traits, or config structures from the TAS.
- [ ] Ensure no false positives: if the architecture actually has an impediment, it must be flagged and a resolution proposed.

## 4. Run Automated Tests to Verify
- [ ] Run the test(s) from step 1 and confirm all pass.

## 5. Update Documentation
- [ ] Add a link to `docs/design/non-goal-architecture-validation.md` from the phase 0 completion checklist or central design index if one exists.

## 6. Automated Verification
- [ ] Run `./do test` (or the traceability scanner) and confirm `1_PRD-REQ-081` appears as covered.
